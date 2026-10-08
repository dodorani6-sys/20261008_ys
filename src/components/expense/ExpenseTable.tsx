"use client";

import React, { useState, useMemo } from "react";
import { ExpenseItem } from "@/lib/expense/types";
import { Search, ArrowUpDown, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { exportExpensesToExcel } from "@/lib/expense/exportExcel";

interface ExpenseTableProps {
  items: ExpenseItem[];
}

type SortField = "번호" | "사용일" | "금액" | "제출자" | "항목";
type SortOrder = "asc" | "desc";

export default function ExpenseTable({ items }: ExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyViolations, setShowOnlyViolations] = useState(false);
  const [sortField, setSortField] = useState<SortField>("번호");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const totalViolationsCount = useMemo(
    () => items.filter((item) => item.isViolated).length,
    [items]
  );

  // 검색 및 정렬
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // "위반 건만 보기" 필터링 (PRD 3.4)
    if (showOnlyViolations) {
      result = result.filter((item) => item.isViolated);
    }

    // 검색어 필터링
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.제출자.toLowerCase().includes(term) ||
          item.부서.toLowerCase().includes(term) ||
          item.항목.toLowerCase().includes(term) ||
          item.가맹점.toLowerCase().includes(term) ||
          item.메모.toLowerCase().includes(term) ||
          item.증빙.toLowerCase().includes(term) ||
          item.품의번호.toLowerCase().includes(term) ||
          (item.violations &&
            item.violations.some(
              (v) =>
                v.article.toLowerCase().includes(term) ||
                v.reason.toLowerCase().includes(term)
            ))
      );
    }

    // 정렬
    result.sort((a, b) => {
      let comp = 0;
      if (sortField === "번호") {
        comp = parseInt(a.번호, 10) - parseInt(b.번호, 10);
      } else if (sortField === "사용일") {
        comp = (a.사용일 + a.사용시각).localeCompare(b.사용일 + b.사용시각);
      } else if (sortField === "금액") {
        comp = a.금액 - b.금액;
      } else if (sortField === "제출자") {
        comp = a.제출자.localeCompare(b.제출자);
      } else if (sortField === "항목") {
        comp = a.항목.localeCompare(b.항목);
      }
      return sortOrder === "asc" ? comp : -comp;
    });

    return result;
  }, [items, showOnlyViolations, searchTerm, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 테이블 상단 컨트롤 바 */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            경비 정산 상세 검사 내역
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            총 {items.length}건 중 {filteredAndSortedItems.length}건 표시 (
            {showOnlyViolations ? "위반 건만 필터링됨" : "전체 보기"})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 위반 건만 보기 토글 버튼 (PRD 3.4) */}
          <button
            type="button"
            onClick={() => setShowOnlyViolations(!showOnlyViolations)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
              showOnlyViolations
                ? "bg-red-600 text-white border-red-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-xs"
            }`}
          >
            <AlertTriangle
              className={`w-3.5 h-3.5 ${
                showOnlyViolations ? "text-white" : "text-red-500"
              }`}
            />
            <span>위반 건만 보기</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                showOnlyViolations
                  ? "bg-red-800 text-white"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {totalViolationsCount}
            </span>
          </button>

          {/* 엑셀 다운로드 버튼 */}
          <button
            type="button"
            onClick={() => exportExpensesToExcel(filteredAndSortedItems, showOnlyViolations)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>엑셀 다운로드 (.xlsx)</span>
          </button>

          {/* 검색 인풋 */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="제출자, 가맹점, 항목, 사유 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-52 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* 실시간 반응형 데이터 그리드 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold select-none">
              <th
                onClick={() => toggleSort("번호")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors w-16"
              >
                <div className="flex items-center gap-1">
                  <span>번호</span>
                  {getSortIcon("번호")}
                </div>
              </th>
              <th className="py-3 px-4 w-28">결과</th>
              <th
                onClick={() => toggleSort("제출자")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors w-24"
              >
                <div className="flex items-center gap-1">
                  <span>제출자</span>
                  {getSortIcon("제출자")}
                </div>
              </th>
              <th className="py-3 px-4 w-24">부서</th>
              <th
                onClick={() => toggleSort("사용일")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors w-28"
              >
                <div className="flex items-center gap-1">
                  <span>사용일시</span>
                  {getSortIcon("사용일")}
                </div>
              </th>
              <th
                onClick={() => toggleSort("항목")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors w-20"
              >
                <div className="flex items-center gap-1">
                  <span>항목</span>
                  {getSortIcon("항목")}
                </div>
              </th>
              <th className="py-3 px-4 min-w-[140px]">가맹점</th>
              <th
                onClick={() => toggleSort("금액")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors text-right w-28"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>금액 (인원)</span>
                  {getSortIcon("금액")}
                </div>
              </th>
              <th className="py-3 px-4 w-24">증빙</th>
              <th className="py-3 px-4 min-w-[120px]">품의번호</th>
              <th className="py-3 px-4 min-w-[200px]">위반 사유 / 규정 조항</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  조건에 일치하는 경비 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map((item) => {
                const isViolated = item.isViolated;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isViolated
                        ? "bg-red-50/40 hover:bg-red-50/70 border-l-4 border-l-red-500"
                        : "hover:bg-slate-50/80 border-l-4 border-l-transparent"
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {item.번호}
                    </td>
                    <td className="py-3 px-4">
                      {isViolated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          위반
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          정상
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.제출자}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.부서}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700">
                        {item.사용일}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {item.사용시각}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {item.항목}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium truncate max-w-[180px]">
                      {item.가맹점}
                      {item.메모 && (
                        <div className="text-[11px] text-slate-400 font-normal truncate">
                          💬 {item.메모}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-slate-900 font-mono">
                        {item.금액.toLocaleString()}원
                      </div>
                      {item.인원 > 1 && (
                        <div className="text-[11px] text-slate-400">
                          {item.인원}명 (인당{" "}
                          {Math.round(item.금액 / item.인원).toLocaleString()}원)
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          item.증빙 === "간이영수증"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.증빙}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {item.품의번호 || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {isViolated && item.violations && item.violations.length > 0 ? (
                        <div className="space-y-1">
                          {item.violations.map((v, vIdx) => (
                            <div
                              key={vIdx}
                              className="text-red-700 font-medium flex items-start gap-1"
                            >
                              <span className="font-bold bg-red-100 px-1 py-0.2 rounded text-[10px] whitespace-nowrap">
                                {v.article}
                              </span>
                              <span className="text-[11px] leading-tight">
                                {v.reason}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          특이사항 없음
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
