"use client";

import React from "react";
import { ExpenseItem } from "@/lib/expense/types";
import { FileSpreadsheet, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

interface SummaryCardsProps {
  items: ExpenseItem[];
}

export default function SummaryCards({ items }: SummaryCardsProps) {
  const totalCount = items.length;
  const violatedItems = items.filter((item) => item.isViolated);
  const violationCount = violatedItems.length;
  const normalCount = totalCount - violationCount;

  // 금액 계산
  const totalAmount = items.reduce((sum, item) => sum + (item.금액 || 0), 0);
  const violationAmount = violatedItems.reduce((sum, item) => sum + (item.금액 || 0), 0);
  const normalAmount = totalAmount - violationAmount;

  // 조항별 위반 건수 집계
  const articleCounts: Record<string, number> = {
    "제5조 (식대)": 0,
    "제6조 (교통비)": 0,
    "제7조 (증빙)": 0,
    "제8조 (접대비)": 0,
    "제9조 (제출)": 0,
  };

  violatedItems.forEach((item) => {
    const articlesInItem = new Set<string>();
    item.violations?.forEach((v) => {
      if (v.article.includes("제5조")) articlesInItem.add("제5조 (식대)");
      if (v.article.includes("제6조")) articlesInItem.add("제6조 (교통비)");
      if (v.article.includes("제7조")) articlesInItem.add("제7조 (증빙)");
      if (v.article.includes("제8조")) articlesInItem.add("제8조 (접대비)");
      if (v.article.includes("제9조")) articlesInItem.add("제9조 (제출)");
    });
    articlesInItem.forEach((art) => {
      if (articleCounts[art] !== undefined) {
        articleCounts[art]++;
      }
    });
  });

  return (
    <div className="space-y-4">
      {/* 1. 핵심 지표 카드 (전체 건수 및 금액, 규정 위반 건수 및 금액, 정상 처리 건수 및 금액) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 전체 검사 건수 & 총 금액 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              전체 검사 내역
            </p>
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {totalCount}
              </span>
              <span className="text-sm font-medium text-slate-500">건</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">총 신청 금액</span>
              <span className="font-bold text-slate-900 text-sm">
                {totalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 규정 위반 건수 & 위반 총 금액 */}
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-xs bg-red-50/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              규정 위반 내역
            </p>
            <div className="p-2.5 bg-red-100 text-red-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-red-600 tracking-tight">
                {violationCount}
              </span>
              <span className="text-sm font-semibold text-red-500">건</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-red-100/70 flex items-center justify-between text-xs">
              <span className="text-red-700 font-medium">위반 총 금액</span>
              <span className="font-bold text-red-600 text-sm">
                {violationAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 정상 처리 건수 & 정상 총 금액 */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              정상 처리 내역
            </p>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-emerald-700 tracking-tight">
                {normalCount}
              </span>
              <span className="text-sm font-semibold text-emerald-600">건</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-emerald-100/70 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-medium">정상 총 금액</span>
              <span className="font-bold text-emerald-700 text-sm">
                {normalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 조항별 위반 통계 배지 칩 카드 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            조항별 규정 위반 현황
          </h3>
          <span className="text-xs text-slate-500">
            (사내 경비 처리 규정 제5조 ~ 제9조 기준)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(articleCounts).map(([article, count]) => {
            const hasViolation = count > 0;
            return (
              <div
                key={article}
                className={`p-3.5 rounded-lg border text-center transition-all ${
                  hasViolation
                    ? "bg-red-50/60 border-red-200 text-red-900 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <p className="text-xs font-medium text-slate-700">
                  {article}
                </p>
                <p
                  className={`text-xl font-bold mt-1.5 ${
                    hasViolation ? "text-red-600" : "text-slate-400"
                  }`}
                >
                  {count}
                  <span className="text-xs font-normal ml-0.5 text-slate-500">
                    건
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
