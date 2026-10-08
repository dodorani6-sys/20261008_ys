export interface Violation {
  article: string; // 예: "제5조 (식대)"
  reason: string;  // 구체적인 사유
}

export interface ExpenseItem {
  id: string; // 고유 키
  번호: string;
  제출자: string;
  부서: string;
  사용일: string;
  사용시각: string;
  항목: string;
  가맹점: string;
  금액: number;
  원래금액: string; // 원본 금액 문자열
  인원: number;
  증빙: string;
  품의번호: string;
  제출일: string;
  메모: string;
  raw: Record<string, string>; // 원본 데이터
  violations?: Violation[]; // 위반 목록
  isViolated?: boolean;     // 위반 여부
}

export interface ParseResult {
  data: ExpenseItem[];
  errors: string[];
  filename: string;
}
