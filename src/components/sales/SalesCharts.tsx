'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { SaleRecord, HolidayMap, BRANCH_LIST, BRANCH_COLORS } from '@/lib/sales/types';
import { BarChart3, TrendingUp, CalendarDays } from 'lucide-react';

interface SalesChartsProps {
  records: SaleRecord[];
  holidays: HolidayMap;
  availableMonths: string[];
}

export default function SalesCharts({
  records,
  holidays,
  availableMonths,
}: SalesChartsProps) {
  // 1. 차트 1 데이터 생성: 월별 전사 총매출액 및 공휴일 수
  const comboChartData = availableMonths.map((m) => {
    const monthRecords = records.filter((r) => r.월 === m);
    const totalSales = monthRecords.reduce(
      (sum, r) => sum + Number(r.매출액 || 0),
      0
    );
    const holidayInfo = holidays[m];
    const holidayCount = holidayInfo?.count ?? 0;
    const holidayNames = holidayInfo?.holidays ?? [];

    return {
      month: m,
      totalSales,
      salesInTenMillion: Number((totalSales / 10000000).toFixed(2)),
      holidayCount,
      holidayNames,
    };
  });

  // 2. 차트 2 데이터 생성: 월별 5개 지점별 매출 추이
  const multiLineData = availableMonths.map((m) => {
    const monthRecords = records.filter((r) => r.월 === m);
    const row: Record<string, any> = { month: m };

    BRANCH_LIST.forEach((b) => {
      const match = monthRecords.find((r) => r.지점 === b);
      row[b] = match ? Number(match.매출액 || 0) : 0;
    });

    return row;
  });

  // 차트 1 커스텀 툴팁
  const CustomComboTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-800">
            📅 {label} 실적 & 공휴일
          </p>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                전사 총매출액:
              </span>
              <span className="font-bold text-slate-900">
                {Number(data.totalSales).toLocaleString('ko-KR')}원
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                법정공휴일 일수:
              </span>
              <span className="font-bold text-slate-900">
                {data.holidayCount}일
              </span>
            </div>
            {data.holidayNames && data.holidayNames.length > 0 && (
              <div className="mt-1.5 border-t border-slate-100 pt-1 text-[11px] text-slate-500">
                공휴일 목록: {data.holidayNames.join(', ')}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // 차트 2 커스텀 툴팁
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="border-b border-slate-100 pb-1 text-xs font-bold text-slate-800">
            ☕ {label} 지점별 매출
          </p>
          <div className="mt-2 space-y-1.5 text-xs">
            {payload.map((entry: any) => (
              <div
                key={entry.name}
                className="flex items-center justify-between gap-4"
              >
                <span
                  className="flex items-center gap-1.5 font-medium"
                  style={{ color: entry.color }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-slate-900">
                  {Number(entry.value).toLocaleString('ko-KR')}원
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* [차트 1] 전사 월별 총매출 & 공휴일 수 상관관계 복합 차트 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    전사 총매출 & 공휴일 일수 상관관계
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    좌측 막대: 매출(천만원 단위) | 우측 꺾은선: 법정공휴일 일수
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                <CalendarDays className="h-3 w-3" /> 한국천문연구원 API
              </span>
            </div>

            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={comboChartData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  {/* 좌측 Y축: 전사 매출액 (천만원 단위) */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    unit="천만"
                  />
                  {/* 우측 Y축: 공휴일 일수 */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#f43f5e' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    domain={[0, 10]}
                    unit="일"
                  />
                  <Tooltip content={<CustomComboTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="salesInTenMillion"
                    name="총매출액(천만원)"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="holidayCount"
                    name="공휴일 수(일)"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f43f5e', strokeWidth: 1, stroke: '#fff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            * 마우스를 올리면 해당 월의 상세 매출액 및 공휴일 명칭을 확인할 수 있습니다.
          </p>
        </div>

        {/* [차트 2] 5개 지점별 월별 매출 추이 비교 멀티 라인 차트 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    5개 직영점 월별 매출 추이 비교
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    지점별 매출 흐름 및 성장/하락 추세 직관 비교 (단위: 원)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={multiLineData}
                  margin={{ top: 15, right: 15, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 10000).toLocaleString('ko-KR')}만`}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                  />
                  {BRANCH_LIST.map((branch) => (
                    <Line
                      key={branch}
                      type="monotone"
                      dataKey={branch}
                      name={branch}
                      stroke={BRANCH_COLORS[branch]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: BRANCH_COLORS[branch] }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            * 용산역점(주황), 삼각지점(파랑), 이태원점(초록), 효창공원점(보라), 한남점(빨강)
          </p>
        </div>
      </div>
    </div>
  );
}
