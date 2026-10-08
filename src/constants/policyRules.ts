/**
 * 경비 규정(제5조 ~ 제9조) 상수 및 정책 파라미터
 * 출처: 경비규정_발췌.txt
 */

export const POLICY_RULES = {
  // 제5조 (식대): 1인당 1회 12,000원 한도
  MEAL: {
    ARTICLE: "제5조 (식대)",
    MAX_PER_PERSON: 12000,
  },
  // 제6조 (교통비): 오후 10시(22:00) 이후 퇴근 또는 업무상 외부 이동(메모 확인)
  TRANSPORT: {
    ARTICLE: "제6조 (교통비)",
    NIGHT_TIME_START: "22:00",
    WORK_MOVE_KEYWORDS: /방문|점검|이동|출장|고객사|현장/,
  },
  // 제7조 (증빙): 간이영수증 30,000원 미만 인정
  RECEIPT: {
    ARTICLE: "제7조 (증빙)",
    MAX_SIMPLE_RECEIPT: 30000,
  },
  // 제8조 (접대비): 300,000원 초과 시 사전 품의번호 필수
  ENTERTAINMENT: {
    ARTICLE: "제8조 (접대비)",
    PRE_APPROVAL_THRESHOLD: 300000,
  },
  // 제9조 (제출): 30일 이내 제출 & 동일 지출(사용일, 가맹점, 금액) 중복 제출 금지
  SUBMISSION: {
    ARTICLE: "제9조 (제출)",
    MAX_DAYS: 30,
  },
} as const;
