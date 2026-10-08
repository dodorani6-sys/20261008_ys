'use client';

import React, { useState } from 'react';
import { SaleRecord, BRANCH_LIST, BRANCH_COLORS } from '@/lib/sales/types';
import { Table, Search, RotateCcw, Edit3 } from 'lucide-react';

interface SalesTableProps {
  records: SaleRecord[];
  availableMonths: string[];
}

export default function SalesTable({ records, availableMonths }: SalesTableProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'edited' | 'original'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const totalEditedCount = records.filter((r) => r.수정여부).length;

  // 필터링 적용
  const filteredRecords = records.filter((r) => {
    if (selectedMonth !== 'all' && r.월 !== selectedMonth) return false;
    if (selectedBranch !== 'all' && r.지점 !== selectedBranch) return false;
    if (statusFilter === 'edited' && !r.수정여부) return false;
    if (statusFilter === 'original' && r.수정여부) return false;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchNote = r.비고 ? r.비고.toLowerCase().includes(term) : false;
      const matchBranch = r.지점.toLowerCase().includes(term);
      const matchMonth = r.월.includes(term);
      if (!matchNote && !matchBranch && !matchMonth) return false;
    }
    return true;
  });

  // 필터링된 합계 계산
  const totalSales = filteredRecords.reduce((sum, r) => sum + Number(r.매출액 || 0), 0);
  const totalGuests = filteredRecords.reduce((sum, r) => sum + Number(r.객수 || 0), 0);
  const avgSpend = totalGuests > 0 ? Math.round(totalSales / totalGuests) : 0;

  const handleResetFilters = () => {
    setSelectedMonth('all');
    setSelectedBranch('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Table className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">
                  월별 / 지점별 통합 실적 데이터
                </h3>
                {totalEditedCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                    <Edit3 className="h-3 w-3" /> 수정 내역 {totalEditedCount}건
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                총 {filteredRecords.length}건 조회 (합계 매출:{' '}
                <span className="font-semibold text-slate-800">
                  {totalSales.toLocaleString('ko-KR')}원
                </span>
                )
              </p>
            </div>
          </div>

          {/* 필터 컨트롤 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 상태 필터 (전체 / 수정됨 / 최초등록) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">구분:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="all">전체 상태</option>
                <option value="edited">✏️ 수정된 데이터만 ({totalEditedCount}건)</option>
                <option value="original">최초 등록 데이터만</option>
              </select>
            </div>

            {/* 월 필터 */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">월:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="all">전체 월</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* 지점 필터 */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">지점:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="all">전체 지점</option>
                {BRANCH_LIST.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* 검색창 */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="비고/지점 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-32 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-xs text-slate-700 placeholder-slate-400 transition hover:bg-white focus:w-44 focus:border-indigo-500 focus:bg-white focus:outline-none sm:w-36"
              />
            </div>

            {(selectedMonth !== 'all' || selectedBranch !== 'all' || statusFilter !== 'all' || searchTerm !== '') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                title="필터 초기화"
              >
                <RotateCcw className="h-3 w-3" />
                초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="w-14 px-4 py-3 text-center">번호</th>
              <th className="px-5 py-3 text-center">월</th>
              <th className="px-5 py-3">지점 (상태)</th>
              <th className="px-5 py-3 text-right">매출액 (원)</th>
              <th className="px-5 py-3 text-right">객수 (명)</th>
              <th className="px-5 py-3 text-right">평균 객단가</th>
              <th className="px-5 py-3">비고 (영업 특이사항)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  조건에 해당하는 매출 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredRecords.map((item, idx) => {
                const spend =
                  Number(item.객수) > 0
                    ? Math.round(Number(item.매출액) / Number(item.객수))
                    : 0;
                return (
                  <tr
                    key={item.id ?? `${item.월}-${item.지점}-${idx}`}
                    className={`transition ${item.수정여부 ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-slate-50/70'}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-center font-semibold text-slate-600">
                      {item.월}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-800">
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: BRANCH_COLORS[item.지점] || '#64748b' }}
                          />
                          {item.지점}
                        </span>

                        {/* 수정됨 배지 */}
                        {item.수정여부 && (
                          <span
                            className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300"
                            title={
                              item.updated_at
                                ? `최종 수정 일시: ${new Date(item.updated_at).toLocaleString('ko-KR')}`
                                : '기존 데이터에서 수정됨'
                            }
                          >
                            <Edit3 className="h-2.5 w-2.5" />
                            수정됨
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-bold text-slate-900">
                      {Number(item.매출액).toLocaleString('ko-KR')}원
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right text-slate-600">
                      {Number(item.객수).toLocaleString('ko-KR')}명
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-medium text-slate-500">
                      {spend.toLocaleString('ko-KR')}원
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {item.비고 ? (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                          {item.비고}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredRecords.length > 0 && (
            <tfoot className="border-t border-slate-200 bg-slate-50/80 font-bold text-slate-800">
              <tr>
                <td className="px-4 py-3 text-center text-slate-400">-</td>
                <td className="px-5 py-3 text-center">합계</td>
                <td className="px-5 py-3">선택 범위 전체</td>
                <td className="px-5 py-3 text-right text-indigo-700">
                  {totalSales.toLocaleString('ko-KR')}원
                </td>
                <td className="px-5 py-3 text-right">
                  {totalGuests.toLocaleString('ko-KR')}명
                </td>
                <td className="px-5 py-3 text-right">
                  {avgSpend.toLocaleString('ko-KR')}원
                </td>
                <td className="px-5 py-3 text-slate-400 font-normal">
                  평균 객단가는 합계 기준 계산
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
