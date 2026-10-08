import { ExpenseItem, Violation } from "./types";
import { POLICY_RULES } from "@/constants/policyRules";

/**
 * 개별 경비 항목에 대한 제5조 (식대) 검증
 */
export function checkMealRule(item: ExpenseItem): Violation | null {
  const itemType = item.항목.trim();
  if (itemType === "식대") {
    const headcount = Math.max(1, item.인원 || 1);
    const perPerson = Math.round(item.금액 / headcount);
    if (perPerson > POLICY_RULES.MEAL.MAX_PER_PERSON) {
      return {
        article: POLICY_RULES.MEAL.ARTICLE,
        reason: `1인당 12,000원 한도 초과 (1인당 ${perPerson.toLocaleString()}원)`,
      };
    }
  }
  return null;
}

/**
 * 개별 경비 항목에 대한 제6조 (교통비) 검증
 */
export function checkTransportRule(item: ExpenseItem): Violation | null {
  const itemType = item.항목.trim();
  if (itemType === "택시" || itemType.includes("택시")) {
    const time = item.사용시각.trim();
    const memo = item.메모.trim();
    const isAfterNight = time >= POLICY_RULES.TRANSPORT.NIGHT_TIME_START;
    const isOffWork = memo.includes("퇴근");
    const isWorkMove =
      POLICY_RULES.TRANSPORT.WORK_MOVE_KEYWORDS.test(memo) && !isOffWork;

    if (isOffWork && !isAfterNight) {
      return {
        article: POLICY_RULES.TRANSPORT.ARTICLE,
        reason: `오후 10시(22:00) 이전 퇴근 택시비 불인정 (${time} 사용)`,
      };
    }

    if (!isOffWork && !isAfterNight && !isWorkMove) {
      return {
        article: POLICY_RULES.TRANSPORT.ARTICLE,
        reason: "업무상 이동 목적 또는 심야(22시 이후) 퇴근 미확인",
      };
    }
  }
  return null;
}

/**
 * 개별 경비 항목에 대한 제7조 (증빙) 검증
 */
export function checkReceiptRule(item: ExpenseItem): Violation | null {
  const proof = item.증빙.trim();
  if (proof === "간이영수증" && item.금액 >= POLICY_RULES.RECEIPT.MAX_SIMPLE_RECEIPT) {
    return {
      article: POLICY_RULES.RECEIPT.ARTICLE,
      reason: `간이영수증 한도(30,000원 미만) 초과 (${item.금액.toLocaleString()}원 지출)`,
    };
  }
  return null;
}

/**
 * 개별 경비 항목에 대한 제8조 (접대비) 검증
 */
export function checkEntertainmentRule(item: ExpenseItem): Violation | null {
  const itemType = item.항목.trim();
  const preApprovalNo = item.품의번호.trim();
  if (
    itemType === "접대비" &&
    item.금액 > POLICY_RULES.ENTERTAINMENT.PRE_APPROVAL_THRESHOLD &&
    !preApprovalNo
  ) {
    return {
      article: POLICY_RULES.ENTERTAINMENT.ARTICLE,
      reason: "30만원 초과 접대비 사전 품의번호 누락",
    };
  }
  return null;
}

/**
 * 개별 경비 항목에 대한 제9조 ①항 (제출 기한 30일 이내) 검증
 */
export function checkSubmissionDeadlineRule(item: ExpenseItem): Violation | null {
  const useDate = item.사용일.trim();
  const submitDate = item.제출일.trim();

  if (useDate && submitDate) {
    const useTime = new Date(useDate).getTime();
    const submitTime = new Date(submitDate).getTime();
    if (!isNaN(useTime) && !isNaN(submitTime)) {
      const diffDays = Math.floor((submitTime - useTime) / (1000 * 60 * 60 * 24));
      if (diffDays > POLICY_RULES.SUBMISSION.MAX_DAYS) {
        return {
          article: POLICY_RULES.SUBMISSION.ARTICLE,
          reason: `사용일로부터 30일 초과 제출 (사용 후 ${diffDays}일 경과)`,
        };
      }
    }
  }
  return null;
}

/**
 * 전체 경비 목록을 대상으로 제5조 ~ 제9조 전체 규정을 검증하는 메인 룰 엔진 함수
 */
export function validateExpenses(items: ExpenseItem[]): ExpenseItem[] {
  // 제9조 ②항: 중복 제출 감지용 인덱스 맵 생성 (키: 사용일_가맹점_금액)
  const duplicateMap = new Map<string, { no: string; index: number }[]>();

  items.forEach((item, idx) => {
    const key = `${item.사용일.trim()}_${item.가맹점.trim()}_${item.금액}`;
    if (!duplicateMap.has(key)) {
      duplicateMap.set(key, []);
    }
    duplicateMap.get(key)!.push({
      no: item.번호 || String(idx + 1),
      index: idx,
    });
  });

  return items.map((item, idx) => {
    const violations: Violation[] = [];

    // 제5조 (식대)
    const mealViolation = checkMealRule(item);
    if (mealViolation) violations.push(mealViolation);

    // 제6조 (교통비)
    const transportViolation = checkTransportRule(item);
    if (transportViolation) violations.push(transportViolation);

    // 제7조 (증빙)
    const receiptViolation = checkReceiptRule(item);
    if (receiptViolation) violations.push(receiptViolation);

    // 제8조 (접대비)
    const entertainmentViolation = checkEntertainmentRule(item);
    if (entertainmentViolation) violations.push(entertainmentViolation);

    // 제9조 ①항 (제출 기한)
    const deadlineViolation = checkSubmissionDeadlineRule(item);
    if (deadlineViolation) violations.push(deadlineViolation);

    // 제9조 ②항 (중복 제출)
    const key = `${item.사용일.trim()}_${item.가맹점.trim()}_${item.금액}`;
    const matches = duplicateMap.get(key) || [];
    if (matches.length > 1 && matches[0].index !== idx) {
      violations.push({
        article: POLICY_RULES.SUBMISSION.ARTICLE,
        reason: `동일 지출 중복 제출 (${matches[0].no}번과 사용일·가맹점·금액 일치)`,
      });
    }

    return {
      ...item,
      violations,
      isViolated: violations.length > 0,
    };
  });
}
