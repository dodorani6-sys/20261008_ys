import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RawReview } from './types';

export interface ParseResult {
  success: boolean;
  reviews: RawReview[];
  errors: string[];
  totalRows: number;
}

/**
 * Normalizes header string to standard property name
 */
function normalizeHeader(header: string): string {
  const clean = String(header).trim().toLowerCase().replace(/[\s_]/g, '');
  if (clean === '번호' || clean === 'reviewno' || clean === 'no' || clean === 'id') {
    return 'review_no';
  }
  if (clean === '작성일' || clean === 'writtenon' || clean === 'date' || clean === '날짜' || clean === '등록일') {
    return 'written_on';
  }
  if (clean === '별점' || clean === 'rating' || clean === 'score' || clean === '점수' || clean === '평점') {
    return 'rating';
  }
  if (clean === '리뷰' || clean === 'reviewtext' || clean === 'review' || clean === '내용' || clean === '본문' || clean === '리뷰내용') {
    return 'review_text';
  }
  return String(header).trim();
}

/**
 * Reads file with appropriate encoding (UTF-8 with EUC-KR fallback)
 */
export async function readFileText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
  const text = utf8Decoder.decode(buffer);

  if (text.includes('\uFFFD')) {
    try {
      const euckrDecoder = new TextDecoder('euc-kr', { fatal: false });
      const euckrText = euckrDecoder.decode(buffer);
      if (!euckrText.includes('\uFFFD')) {
        return euckrText;
      }
    } catch {
      // Fallback
    }
  }

  return text;
}

/**
 * Parses Excel (.xlsx, .xls) buffer into RawReview array
 */
export async function parseReviewExcel(file: File): Promise<ParseResult> {
  const errors: string[] = [];
  const reviews: RawReview[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return {
        success: false,
        reviews: [],
        errors: ['엑셀 파일 내에 시트가 존재하지 않습니다.'],
        totalRows: 0,
      };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

    let rowIdx = 0;
    for (const rawRow of rawData) {
      rowIdx++;
      // Map normalized headers
      const row: Record<string, string> = {};
      for (const [key, value] of Object.entries(rawRow)) {
        const normKey = normalizeHeader(key);
        row[normKey] = String(value ?? '').trim();
      }

      const rawNo = row.review_no;
      const rawDate = row.written_on;
      const rawRating = row.rating;
      const rawText = row.review_text;

      if (!rawText || rawText.trim().length === 0) {
        continue;
      }

      const reviewNo = rawNo ? parseInt(rawNo.trim(), 10) : rowIdx;
      const writtenOn = rawDate ? rawDate.trim() : new Date().toISOString().split('T')[0];
      const rating = rawRating ? parseFloat(rawRating.trim()) : 0;
      const reviewText = rawText.trim();

      if (isNaN(reviewNo)) {
        errors.push(`행 ${rowIdx}: 유효하지 않은 리뷰 번호 "${rawNo}"`);
        continue;
      }

      if (isNaN(rating)) {
        errors.push(`행 ${rowIdx}: 유효하지 않은 별점 "${rawRating}"`);
        continue;
      }

      reviews.push({
        review_no: reviewNo,
        written_on: writtenOn,
        rating,
        review_text: reviewText,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '엑셀 파싱 중 오류 발생';
    errors.push(message);
  }

  if (reviews.length === 0 && errors.length === 0) {
    errors.push('유효한 리뷰 데이터를 찾을 수 없습니다. 컬럼명(번호, 작성일, 별점, 리뷰)을 확인해 주세요.');
  }

  return {
    success: errors.length === 0 && reviews.length > 0,
    reviews,
    errors,
    totalRows: reviews.length,
  };
}

/**
 * Parses CSV text into RawReview array
 */
export function parseReviewCsv(csvText: string): ParseResult {
  const errors: string[] = [];
  const reviews: RawReview[] = [];

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header: string) => normalizeHeader(header),
  });

  if (parsed.errors.length > 0) {
    for (const err of parsed.errors) {
      errors.push(`CSV 파싱 오류 (행 ${err.row ?? '?'}) : ${err.message}`);
    }
  }

  const rows = parsed.data;
  let rowIdx = 0;

  for (const row of rows) {
    rowIdx++;
    const rawNo = row.review_no;
    const rawDate = row.written_on;
    const rawRating = row.rating;
    const rawText = row.review_text;

    if (!rawText || rawText.trim().length === 0) {
      continue;
    }

    const reviewNo = rawNo ? parseInt(rawNo.trim(), 10) : rowIdx;
    const writtenOn = rawDate ? rawDate.trim() : new Date().toISOString().split('T')[0];
    const rating = rawRating ? parseFloat(rawRating.trim()) : 0;
    const reviewText = rawText.trim();

    if (isNaN(reviewNo)) {
      errors.push(`행 ${rowIdx}: 유효하지 않은 리뷰 번호 "${rawNo}"`);
      continue;
    }

    if (isNaN(rating)) {
      errors.push(`행 ${rowIdx}: 유효하지 않은 별점 "${rawRating}"`);
      continue;
    }

    reviews.push({
      review_no: reviewNo,
      written_on: writtenOn,
      rating,
      review_text: reviewText,
    });
  }

  if (reviews.length === 0 && errors.length === 0) {
    errors.push('유효한 리뷰 데이터를 찾을 수 없습니다. 컬럼명(번호, 작성일, 별점, 리뷰)을 확인해 주세요.');
  }

  return {
    success: errors.length === 0 && reviews.length > 0,
    reviews,
    errors,
    totalRows: reviews.length,
  };
}

/**
 * Universal file parser supporting both CSV and Excel (.xlsx, .xls)
 */
export async function parseReviewFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseReviewExcel(file);
  } else if (fileName.endsWith('.csv')) {
    const text = await readFileText(file);
    return parseReviewCsv(text);
  } else {
    return {
      success: false,
      reviews: [],
      errors: ['지원되지 않는 파일 형식입니다. (.csv, .xlsx, .xls 지원)'],
      totalRows: 0,
    };
  }
}
