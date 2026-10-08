import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ExpenseItem } from "./types";

/**
 * 엑셀 날짜/시각 필드를 문자열(YYYY-MM-DD 또는 HH:mm)로 정규화하는 헬퍼 함수
 */
function normalizeDateValue(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    // Date 객체일 때 YYYY-MM-DD 포맷
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, "0");
    const date = String(val.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  }
  const str = String(val).trim();
  // ISO 날짜 문자열인 경우 앞 10자리(YYYY-MM-DD)만 추출
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  return str;
}

function normalizeTimeValue(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    const hours = String(val.getHours()).padStart(2, "0");
    const minutes = String(val.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  const str = String(val).trim();
  return str;
}

/**
 * CSV 파싱 및 필드 정규화 유틸리티
 */
export function parseExpenseCSV(fileContent: string): { items: ExpenseItem[]; error?: string } {
  try {
    const result = Papa.parse<Record<string, string>>(fileContent.trim(), {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
    });

    if (result.errors && result.errors.length > 0 && result.data.length === 0) {
      return { items: [], error: "CSV 파싱 중 오류가 발생했습니다: " + result.errors[0].message };
    }

    if (!result.data || result.data.length === 0) {
      return { items: [], error: "CSV 파일에 데이터가 없습니다." };
    }

    const items: ExpenseItem[] = result.data.map((row, index) => {
      const rawAmount = (row["금액"] || "0").replace(/,/g, "").trim();
      const amount = Number(rawAmount) || 0;
      const rawHeadcount = (row["인원"] || "1").trim();
      const headcount = Math.max(1, parseInt(rawHeadcount, 10) || 1);

      return {
        id: `expense-${index + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        번호: (row["번호"] || String(index + 1)).trim(),
        제출자: (row["제출자"] || "").trim(),
        부서: (row["부서"] || "").trim(),
        사용일: normalizeDateValue(row["사용일"]),
        사용시각: normalizeTimeValue(row["사용시각"]),
        항목: (row["항목"] || "").trim(),
        가맹점: (row["가맹점"] || "").trim(),
        금액: amount,
        원래금액: row["금액"] || "0",
        인원: headcount,
        증빙: (row["증빙"] || "").trim(),
        품의번호: (row["품의번호"] || "").trim(),
        제출일: normalizeDateValue(row["제출일"]),
        메모: (row["메모"] || "").trim(),
        raw: row,
      };
    });

    return { items };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    return { items: [], error: message };
  }
}

/**
 * 엑셀(.xlsx, .xls) 파싱 및 필드 정규화 유틸리티
 */
export function parseExpenseExcel(buffer: ArrayBuffer): { items: ExpenseItem[]; error?: string } {
  try {
    const workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
      dateNF: "yyyy-mm-dd",
    });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { items: [], error: "엑셀 파일에 시트가 존재하지 않습니다." };
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    // 헤더 포함 행 객체 배열로 변환
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      raw: false,
      defval: "",
    });

    if (!rawRows || rawRows.length === 0) {
      return { items: [], error: "엑셀 시트에 데이터가 비어 있습니다." };
    }

    const items: ExpenseItem[] = rawRows.map((row, index) => {
      // 헤더 키의 앞뒤 공백 제거 정규화
      const normalizedRow: Record<string, any> = {};
      Object.entries(row).forEach(([k, v]) => {
        normalizedRow[k.trim()] = v;
      });

      const rawAmount = String(normalizedRow["금액"] || "0").replace(/,/g, "").trim();
      const amount = Number(rawAmount) || 0;
      const rawHeadcount = String(normalizedRow["인원"] || "1").trim();
      const headcount = Math.max(1, parseInt(rawHeadcount, 10) || 1);

      return {
        id: `expense-${index + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        번호: String(normalizedRow["번호"] || index + 1).trim(),
        제출자: String(normalizedRow["제출자"] || "").trim(),
        부서: String(normalizedRow["부서"] || "").trim(),
        사용일: normalizeDateValue(normalizedRow["사용일"]),
        사용시각: normalizeTimeValue(normalizedRow["사용시각"]),
        항목: String(normalizedRow["항목"] || "").trim(),
        가맹점: String(normalizedRow["가맹점"] || "").trim(),
        금액: amount,
        원래금액: String(normalizedRow["금액"] || "0"),
        인원: headcount,
        증빙: String(normalizedRow["증빙"] || "").trim(),
        품의번호: String(normalizedRow["품의번호"] || "").trim(),
        제출일: normalizeDateValue(normalizedRow["제출일"]),
        메모: String(normalizedRow["메모"] || "").trim(),
        raw: normalizedRow,
      };
    });

    return { items };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "엑셀 파일을 읽는 도중 오류가 발생했습니다.";
    return { items: [], error: message };
  }
}

/**
 * 파일 확장자(.csv, .xlsx, .xls)에 따라 자동으로 적절한 파서를 호출하는 통합 함수
 */
export async function parseExpenseFile(
  file: File
): Promise<{ items: ExpenseItem[]; error?: string }> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    const text = await file.text();
    return parseExpenseCSV(text);
  } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    return parseExpenseExcel(buffer);
  } else {
    return {
      items: [],
      error: "지원하지 않는 파일 형식입니다. .csv, .xlsx, .xls 파일만 지원합니다.",
    };
  }
}
