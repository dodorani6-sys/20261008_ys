export interface SaleRecord {
  id?: number;
  월: string; // 'YYYY-MM'
  지점: string;
  매출액: number;
  객수: number;
  비고: string | null;
  수정여부?: boolean;
  updated_at?: string | null;
  created_at?: string;
}

export interface HolidayMap {
  [yyyyMm: string]: {
    count: number;
    holidays: string[];
  };
}

export const BRANCH_LIST = [
  '용산역점',
  '삼각지점',
  '이태원점',
  '효창공원점',
  '한남점',
] as const;

export type BranchName = (typeof BRANCH_LIST)[number];

export const BRANCH_COLORS: Record<string, string> = {
  용산역점: '#f97316', // 주황
  삼각지점: '#3b82f6', // 파랑
  이태원점: '#10b981', // 초록
  효창공원점: '#8b5cf6', // 보라
  한남점: '#ef4444', // 빨강
};
