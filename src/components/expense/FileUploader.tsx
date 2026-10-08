"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, AlertCircle, FileSpreadsheet } from "lucide-react";
import { parseExpenseFile } from "@/lib/expense/parser";
import { ExpenseItem } from "@/lib/expense/types";

interface FileUploaderProps {
  onDataLoaded: (items: ExpenseItem[], filename: string) => void;
  currentFilename?: string;
  totalCount?: number;
}

export default function FileUploader({
  onDataLoaded,
  currentFilename,
  totalCount,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isSupported =
      lowerName.endsWith(".csv") ||
      lowerName.endsWith(".xlsx") ||
      lowerName.endsWith(".xls");

    if (!isSupported) {
      setError(".csv 또는 .xlsx/.xls 엑셀 파일만 업로드할 수 있습니다.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { items, error: parseError } = await parseExpenseFile(file);
      if (parseError) {
        setError(parseError);
      } else if (items.length === 0) {
        setError("파일에 유효한 경비 내역 데이터가 없습니다.");
      } else {
        onDataLoaded(items, file.name);
        setError(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "파일 파싱 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
    // 동일 파일 재선택이 가능하도록 input value 리셋
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isExcel = currentFilename
    ? currentFilename.endsWith(".xlsx") || currentFilename.endsWith(".xls")
    : false;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100/60"
        }`}
      >
        <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
        <p className="text-base font-medium text-slate-700 mb-1 text-center">
          경비 내역 파일(CSV 또는 엑셀 XLSX)을 드래그하여 놓거나 파일을 선택하세요
        </p>
        <p className="text-xs text-slate-500 mb-4 text-center">
          .csv, .xlsx, .xls 모든 파일 형식 자동 지원 (9월_경비내역.csv 등)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-xs text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {loading ? "파싱 분석 중..." : "파일 찾아보기"}
          </button>
        </div>
      </div>

      {currentFilename && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600 bg-slate-100 px-4 py-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            {isExcel ? (
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            ) : (
              <FileText className="w-4 h-4 text-blue-600" />
            )}
            <span className="font-medium text-slate-800">
              업로드된 파일: {currentFilename}
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${
                isExcel
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {isExcel ? "Excel" : "CSV"}
            </span>
          </div>
          {totalCount !== undefined && (
            <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
              총 {totalCount}건 로드됨
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
