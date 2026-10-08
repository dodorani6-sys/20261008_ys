import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, FileSpreadsheet } from 'lucide-react';
import { RawReview } from '@/lib/reviews/types';
import { parseReviewFile } from '@/lib/reviews/csv-parser';

interface FileUploadProps {
  onStartAnalysis: (reviews: RawReview[]) => void;
  isLoading: boolean;
}

export default function FileUpload({ onStartAnalysis, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [parsedReviews, setParsedReviews] = useState<RawReview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isCsv = lowerName.endsWith('.csv');
    const isExcel = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');

    if (!isCsv && !isExcel) {
      setErrors(['CSV 또는 엑셀(.xlsx, .xls) 형식의 파일만 업로드할 수 있습니다.']);
      return;
    }

    setIsParsing(true);
    setErrors([]);
    setSelectedFileName(file.name);

    try {
      const result = await parseReviewFile(file);

      if (!result.success && result.reviews.length === 0) {
        setErrors(result.errors.length > 0 ? result.errors : ['유효한 리뷰 데이터를 파싱할 수 없습니다.']);
        setParsedReviews([]);
      } else {
        setParsedReviews(result.reviews);
        if (result.errors.length > 0) {
          setErrors(result.errors);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '파일을 읽는 도중 오류가 발생했습니다.';
      setErrors([message]);
      setParsedReviews([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const isExcelFile = selectedFileName?.toLowerCase().endsWith('.xlsx') || selectedFileName?.toLowerCase().endsWith('.xls');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">리뷰 파일 업로드</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              CSV &amp; 엑셀 지원
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            정기 분석할 CSV 또는 엑셀(.xlsx, .xls) 파일을 드래그하거나 선택해 주세요. (컬럼: 번호, 작성일, 별점, 리뷰)
          </p>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading || isParsing}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {isParsing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              리뷰 파일을 이곳에 드래그하거나{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isParsing}
                className="text-blue-600 hover:underline font-bold disabled:opacity-50"
              >
                컴퓨터에서 찾기
              </button>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              지원 형식: .csv (UTF-8, EUC-KR 자동 감지), .xlsx, .xls
            </p>
          </div>
        </div>
      </div>

      {/* Selected file and parsed count status */}
      {selectedFileName && (
        <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
              {isExcelFile ? <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {selectedFileName}
                {parsedReviews.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {parsedReviews.length}건 인식 완료
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                {isParsing ? '파일 파싱 중...' : `${parsedReviews.length}개의 유효 리뷰 데이터가 준비되었습니다.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartAnalysis(parsedReviews)}
            disabled={isLoading || parsedReviews.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gemini 일괄 분석 중...
              </>
            ) : (
              <>
                Gemini 분석 시작 ({parsedReviews.length}건)
              </>
            )}
          </button>
        </div>
      )}

      {/* Errors display */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            파일 읽기 주의사항
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
