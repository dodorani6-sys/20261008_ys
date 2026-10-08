import { NextResponse } from 'next/server';
import { ConsumerSafetyResponse, HarmStatistic } from '@/lib/reviews/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CachedData {
  timestamp: number;
  data: ConsumerSafetyResponse;
}

// 24-hour server-side cache (PRD 3.3: 1일(24시간) 동안 집계 결과 저장 및 재활용)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let memoryCache: CachedData | null = null;

interface HarmItem {
  receptionNumber?: string;
  receiveDay?: string;
  itemMajor?: string;
  itemMiddle?: string;
  itemMinor?: string;
  injuryReason?: string;
  injurySymptoms?: string;
  [key: string]: unknown;
}

async function fetchPage(serviceKey: string, pageNo: number): Promise<HarmItem[]> {
  const params = new URLSearchParams({
    serviceKey,
    pageNo: String(pageNo),
    numOfRows: '1000',
    apiFormat: 'json',
  });

  const url = `https://apis.data.go.kr/B551919/open-api/harm/reception?${params.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Public safety API responded with HTTP ${res.status}`);
  }

  const json = await res.json();
  const resultCode = json?.response?.header?.resultCode;
  if (resultCode && resultCode !== 'I100' && resultCode !== '00') {
    throw new Error(`API error code: ${resultCode} - ${json?.response?.header?.resultMsg}`);
  }

  const items = json?.response?.body?.items?.item;
  if (!items) {
    return [];
  }

  return Array.isArray(items) ? items : [items];
}

export async function GET() {
  const now = Date.now();

  // Return cached result if valid
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      ...memoryCache.data,
      cachedAt: new Date(memoryCache.timestamp).toISOString(),
    });
  }

  const apiKey = process.env.CONSUMER_SAFETY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 500 });
  }

  try {
    const reasonCounts = new Map<string, number>();
    let totalVacuumIncidents = 0;
    let minDate = '9999-99-99';
    let maxDate = '0000-00-00';

    // 순차적으로 3페이지(총 3,000건) 요청
    for (let page = 1; page <= 3; page++) {
      const items = await fetchPage(apiKey, page);

      for (const item of items) {
        // 접수 등록 일자(receiveDay) 범위 추적
        if (typeof item.receiveDay === 'string' && item.receiveDay.trim()) {
          const rDate = item.receiveDay.trim();
          if (rDate < minDate) minDate = rDate;
          if (rDate > maxDate) maxDate = rDate;
        }

        // 품목 소분류(itemMinor)가 "가정용 진공청소기"인 데이터만 필터링
        if (item.itemMinor === '가정용 진공청소기') {
          totalVacuumIncidents++;
          const reason = item.injuryReason?.trim() || '기타 원인';
          reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
        }
      }
    }

    // 사고 원인별 발생 건수 집계 후 1위부터 3위까지 추출
    const sortedReasons = Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topReasons: HarmStatistic[] = sortedReasons.map(([reason, count], idx) => ({
      rank: idx + 1,
      reason,
      count,
    }));

    // 기간 문자열 생성 (예: "26년 6월 1일부터 8월 21일까지")
    let periodText = '기간 정보 없음';
    if (minDate !== '9999-99-99' && maxDate !== '0000-00-00') {
      const parsePart = (d: string) => {
        const p = d.split('-');
        if (p.length === 3) {
          const yy = p[0].length === 4 ? p[0].slice(2) : p[0];
          const mm = parseInt(p[1], 10);
          const dd = parseInt(p[2], 10);
          return { yy, mm, dd };
        }
        return null;
      };
      const s = parsePart(minDate);
      const e = parsePart(maxDate);
      if (s && e) {
        if (s.yy === e.yy) {
          periodText = `${s.yy}년 ${s.mm}월 ${s.dd}일부터 ${e.mm}월 ${e.dd}일까지`;
        } else {
          periodText = `${s.yy}년 ${s.mm}월 ${s.dd}일부터 ${e.yy}년 ${e.mm}월 ${e.dd}일까지`;
        }
      }
    }

    const responsePayload: ConsumerSafetyResponse = {
      totalIncidents: totalVacuumIncidents,
      topReasons,
      periodText,
      startDate: minDate !== '9999-99-99' ? minDate : undefined,
      endDate: maxDate !== '0000-00-00' ? maxDate : undefined,
    };

    // Update cache
    memoryCache = {
      timestamp: now,
      data: responsePayload,
    };

    return NextResponse.json({
      ...responsePayload,
      cachedAt: new Date(now).toISOString(),
    });
  } catch (error) {
    console.error('[Consumer Safety API Error]:', error);
    return NextResponse.json({ error: '불러오지 못했습니다' }, { status: 502 });
  }
}
