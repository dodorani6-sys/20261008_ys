import React from 'react';
import { SaleRecord } from '@/lib/sales/types';
import { DollarSign, Users, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface KpiCardsProps {
  records: SaleRecord[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export default function KpiCards({
  records,
  selectedMonth,
  onMonthChange,
  availableMonths,
}: KpiCardsProps) {
  // 당월 데이터 필터링
  const currentMonthRecords = records.filter((r) => r.월 === selectedMonth);
  const currentTotalSales = currentMonthRecords.reduce(
    (sum, r) => sum + Number(r.매출액 || 0),
    0
  );
  const currentTotalGuests = currentMonthRecords.reduce(
    (sum, r) => sum + Number(r.객수 || 0),
    0
  );

  // 평균 객단가 = 매출액 합계 / 객수 합계
  const averageSpend =
    currentTotalGuests > 0
      ? Math.round(currentTotalSales / currentTotalGuests)
      : 0;

  // 전월 데이터 계산
  const currentIdx = availableMonths.indexOf(selectedMonth);
  const prevMonth = currentIdx > 0 ? availableMonths[currentIdx - 1] : null;

  let momChange: number | null = null;
  let prevTotalSales = 0;

  if (prevMonth) {
    const prevMonthRecords = records.filter((r) => r.월 === prevMonth);
    prevTotalSales = prevMonthRecords.reduce(
      (sum, r) => sum + Number(r.매출액 || 0),
      0
    );
    if (prevTotalSales > 0) {
      momChange =
        ((currentTotalSales - prevTotalSales) / prevTotalSales) * 100;
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            📊 핵심 경영 성과 지표 (KPI)
          </h2>
          <p className="text-xs text-slate-500">
            선택하신 기준 월의 전사 실적 요약입니다.
          </p>
        </div>

        {/* 기준 월 선택 드롭다운 */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">기준 월:</span>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* 카드 1: 당월 총매출액 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              당월 총매출액 ({selectedMonth})
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {currentTotalSales.toLocaleString('ko-KR')}
              <span className="ml-1 text-base font-medium text-slate-600">원</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              5개 지점 합산 (객수 {currentTotalGuests.toLocaleString('ko-KR')}명)
            </p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500" />
        </div>

        {/* 카드 2: 전사 평균객단가 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              전사 평균 객단가
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {averageSpend.toLocaleString('ko-KR')}
              <span className="ml-1 text-base font-medium text-slate-600">원</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              매출액 합계 ÷ 총 객수 (원 단위 반올림)
            </p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500" />
        </div>

        {/* 카드 3: 전월 대비 증감률(MoM) */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              전월 대비 증감률 (MoM)
            </span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                momChange === null
                  ? 'bg-slate-100 text-slate-600'
                  : momChange >= 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              {momChange === null ? (
                <Minus className="h-5 w-5" />
              ) : momChange >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
            </div>
          </div>
          <div className="mt-3">
            {momChange !== null ? (
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-extrabold sm:text-3xl ${
                    momChange >= 0 ? 'text-rose-600' : 'text-blue-600'
                  }`}
                >
                  {momChange >= 0 ? `▲ +${momChange.toFixed(1)}%` : `▼ ${momChange.toFixed(1)}%`}
                </span>
                <span className="text-xs text-slate-400">
                  vs {prevMonth} ({prevTotalSales.toLocaleString('ko-KR')}원)
                </span>
              </div>
            ) : (
              <div className="text-2xl font-extrabold text-slate-400 sm:text-3xl">
                -
                <span className="ml-2 text-xs font-normal text-slate-400">
                  (비교 가능한 전월 데이터 없음)
                </span>
              </div>
            )}
            <p className="mt-1 text-xs text-slate-500">
              전월 대비 매출 증감 비율 (소수점 1자리)
            </p>
          </div>
          <div
            className={`absolute bottom-0 left-0 h-1 w-full ${
              momChange === null
                ? 'bg-slate-300'
                : momChange >= 0
                ? 'bg-rose-500'
                : 'bg-blue-500'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
