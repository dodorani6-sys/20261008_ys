export interface RawReview {
  review_no: number;
  written_on: string;
  rating: number;
  review_text: string;
}

export type SentimentType = '긍정' | '부정' | '중립' | '광고';

export const COMPLAINT_CATEGORIES = [
  '배터리',
  '흡입력',
  '소음',
  '무게·사용감',
  '디자인',
  '관리·청소',
  '구성품',
  '품질·불량',
  '배송',
  '포장',
  '고객센터',
  '가격',
  '설명서',
  '기타'
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export interface AnalyzedReview {
  id?: number;
  analyzed_on: string; // YYYY-MM-DD
  review_no: number;
  written_on: string;
  rating: number;
  review_text: string;
  sentiment: SentimentType;
  categories: string[];
  improvement_request: string | null;
  is_safety_issue: boolean;
  model_used: string;
  is_edited?: boolean;
}

export interface HarmStatistic {
  rank: number;
  reason: string;
  count: number;
}

export interface ConsumerSafetyResponse {
  totalIncidents: number;
  topReasons: HarmStatistic[];
  periodText?: string;
  startDate?: string;
  endDate?: string;
  cachedAt?: string;
  error?: string;
}

export interface HistorySummary {
  analyzed_on: string;
  total_count: number;
  negative_count: number;
  ad_count: number;
  non_ad_count: number;
  negative_ratio: number; // 광고 제외 기준 부정 비율 (%)
  model_used?: string;
}
