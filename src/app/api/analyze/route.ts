import { NextRequest, NextResponse } from 'next/server';
import { RawReview, AnalyzedReview, COMPLAINT_CATEGORIES } from '@/lib/reviews/types';

export const runtime = 'nodejs';
// Allow sufficient timeout for single batch processing of 100+ reviews
export const maxDuration = 60;

interface GeminiAnalysisItem {
  review_no: number;
  sentiment: '긍정' | '부정' | '중립' | '광고';
  categories: string[];
  improvement_request: string | null;
  is_safety_issue: boolean;
}

const SYSTEM_PROMPT = `
당신은 무선 핸디 청소기 「클린핏 미니」의 고객 리뷰 분석 전문가입니다.
주어진 리뷰 목록 전체를 분석하여 지정된 JSON 스키마에 맞춰 정확히 반환하십시오.

[분류 기준]
1. [감성] (반드시 아래 4개 중 하나로만 분류):
   - '긍정', '부정', '중립', '광고'
   - 별점이 아닌 '텍스트 본문 의미 중심'으로 판정합니다.
   - 반어법(예: "배송 정말 빠르네요^^ 주문하고 딱 12일 만에 왔어요")은 반드시 '부정'으로 분류합니다.
   - 체험단, 원고료, 무상제공, 협찬, 할인링크, 서포터즈 문구가 포함된 리뷰는 반드시 '광고'로 분류합니다.
   - 칭찬과 불만이 혼재되어 있을 경우 더 우세한 쪽으로 판정하고, 대등할 경우 '중립'으로 처리합니다.

2. [유형] (다중 태깅 가능, 반드시 아래 정해진 목록에서만 선택하여 배열로 작성):
   허용 목록: ${JSON.stringify(COMPLAINT_CATEGORIES)}
   - 한 리뷰 내에 여러 주제나 언급이 있을 경우 복수로 모두 배열에 포함하십시오.
   - 해당되는 항목이 없을 경우 ['기타']로 지정하십시오.

3. [따로 뽑기]:
   - 개선 요청 (improvement_request): "~면 좋겠어요", "~해 주세요", "~바랍니다", "~필요해요" 등 고객의 명시적/암시적 요구사항 문장을 원문에서 추출하십시오. 없으면 null로 지정하십시오.
   - 안전 이슈 (is_safety_issue): 뜨거움, 발열, 타는 냄새, 연기, 감전, 스파크, 폭발, 화상 등의 키워드나 화재/신체 위해 정황이 조금이라도 감지되면 반드시 true로 표시하십시오. 해당 없으면 false입니다.

[출력 형식]
반드시 다음 형태의 JSON 배열만 출력하십시오. 마크다운 코드블록이나 불필요한 설명 없이 순수 JSON 배열만 반환하십시오.
[
  {
    "review_no": 1,
    "sentiment": "긍정",
    "categories": ["흡입력"],
    "improvement_request": null,
    "is_safety_issue": false
  }
]
`;

async function callGemini(model: string, apiKey: string, reviews: RawReview[]): Promise<{ status: number; text?: string; error?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const userPrompt = `
다음은 분석해야 할 「클린핏 미니」 리뷰 ${reviews.length}건 목록입니다. 단 한 건도 누락하지 말고 전체를 분석하여 JSON 배열로 반환해 주세요.

리뷰 데이터:
${JSON.stringify(reviews, null, 2)}
`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { status: res.status, error: errBody };
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return { status: 200, text: candidateText };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fetch error';
    return { status: 500, error: message };
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 500 });
    }

    const body = await req.json();
    const reviews: RawReview[] = body.reviews;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 400 });
    }

    // 1차 호출: gemini-3.8-flash
    let currentModel = 'gemini-3.8-flash';
    let geminiRes = await callGemini(currentModel, apiKey, reviews);

    // PRD 3.2: 503(Service Unavailable) 에러 발생 시 gemini-3.5-flash-lite로 1회 재시도
    if (geminiRes.status === 503) {
      console.warn(`[Gemini] ${currentModel} returned 503. Retrying with gemini-3.5-flash-lite fallback...`);
      currentModel = 'gemini-3.5-flash-lite';
      geminiRes = await callGemini(currentModel, apiKey, reviews);
    }

    if (geminiRes.status !== 200 || !geminiRes.text) {
      console.error(`[Gemini] Failed with status ${geminiRes.status}:`, geminiRes.error);
      return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 502 });
    }

    // Clean JSON text
    let cleanJson = geminiRes.text.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.slice(7);
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.slice(3);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();

    let parsedList: GeminiAnalysisItem[];
    try {
      parsedList = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('[Gemini] JSON parse error:', parseErr, cleanJson.slice(0, 300));
      return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 502 });
    }

    if (!Array.isArray(parsedList)) {
      return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 502 });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const analysisMap = new Map<number, GeminiAnalysisItem>();
    for (const item of parsedList) {
      analysisMap.set(item.review_no, item);
    }

    // Merge with original reviews
    const analyzedReviews: AnalyzedReview[] = reviews.map((raw) => {
      const analyzed = analysisMap.get(raw.review_no);

      const sentiment = (['긍정', '부정', '중립', '광고'].includes(analyzed?.sentiment ?? '')
        ? analyzed!.sentiment
        : '중립') as AnalyzedReview['sentiment'];

      const categories = Array.isArray(analyzed?.categories) ? analyzed!.categories : ['기타'];

      return {
        analyzed_on: todayStr,
        review_no: raw.review_no,
        written_on: raw.written_on,
        rating: raw.rating,
        review_text: raw.review_text,
        sentiment,
        categories,
        improvement_request: analyzed?.improvement_request || null,
        is_safety_issue: Boolean(analyzed?.is_safety_issue),
        model_used: currentModel,
      };
    });

    return NextResponse.json({
      model_used: currentModel,
      analyzedReviews,
    });
  } catch (error) {
    console.error('[Analyze API] Unexpected error:', error);
    return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 500 });
  }
}
