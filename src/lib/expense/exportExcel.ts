import * as XLSX from "xlsx";
import { ExpenseItem } from "./types";

/**
 * 경비 정산 내역 및 검사 결과를 엑셀(.xlsx) 파일로 내보내는 함수
 * @param items 내보낼 경비 항목 목록
 * @param isOnlyViolations 위반 건만 보기 상태인지 여부
 */
export function exportExpensesToExcel(items: ExpenseItem[], isOnlyViolations: boolean) {
  if (!items || items.length === 0) {
    alert("다운로드할 데이터가 없습니다.");
    return;
  }

  // 엑셀 시트에 들어갈 행 데이터 생성
  const excelData = items.map((item) => {
    const violationSummary = item.isViolated && item.violations && item.violations.length > 0
      ? item.violations.map((v) => `[${v.article}] ${v.reason}`).join(" / ")
      : "정상";

    return {
      "번호": Number(item.번호) || item.번호,
      "검사 결과 (규정 위반 여부)": violationSummary,
      "위반 여부": item.isViolated ? "위반" : "정상",
      "제출자": item.제출자,
      "부서": item.부서,
      "사용일": item.사용일,
      "사용시각": item.사용시각,
      "항목": item.항목,
      "가맹점": item.가맹점,
      "금액": item.금액,
      "인원(명)": item.인원,
      "증빙": item.증빙,
      "품의번호": item.품의번호 || "",
      "제출일": item.제출일,
      "메모": item.메모 || "",
    };
  });

  // 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // 컬럼 너비 지정 (글자가 잘리지 않도록)
  worksheet["!cols"] = [
    { wch: 8 },  // 번호
    { wch: 45 }, // 검사 결과 (규정 위반 여부)
    { wch: 10 }, // 위반 여부
    { wch: 12 }, // 제출자
    { wch: 12 }, // 부서
    { wch: 14 }, // 사용일
    { wch: 10 }, // 사용시각
    { wch: 10 }, // 항목
    { wch: 22 }, // 가맹점
    { wch: 14 }, // 금액
    { wch: 10 }, // 인원
    { wch: 12 }, // 증빙
    { wch: 16 }, // 품의번호
    { wch: 14 }, // 제출일
    { wch: 28 }, // 메모
  ];

  // 워크북 생성 및 시트 추가
  const workbook = XLSX.utils.book_new();
  const sheetName = isOnlyViolations ? "규정 위반 내역" : "경비 정산 전체 내역";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 날짜 포맷 (YYYYMMDD)
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  // 파일명 결정
  const filename = isOnlyViolations
    ? `경비정산_규정위반내역_${dateStr}.xlsx`
    : `경비정산_검사결과_전체_${dateStr}.xlsx`;

  // 엑셀 파일 다운로드 실행
  XLSX.writeFile(workbook, filename);
}
