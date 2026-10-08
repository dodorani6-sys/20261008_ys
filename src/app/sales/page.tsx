'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/sales/Header';
import KpiCards from '@/components/sales/KpiCards';
import SalesCharts from '@/components/sales/SalesCharts';
import SalesTable from '@/components/sales/SalesTable';
import SalesForm from '@/components/sales/SalesForm';
import { supabase } from '@/lib/supabase';
import { SaleRecord, HolidayMap } from '@/lib/sales/types';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function SalesPage() {
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [holidays, setHolidays] = useState<HolidayMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKpiMonth, setSelectedKpiMonth] = useState<string>('2026-08');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 1. Supabase 데이터 조회 (캐시 없이 최신 데이터 실시간 조회)
  const fetchSalesData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supaErr } = await supabase
        .from('sales')
        .select('*')
        .order('월', { ascending: true })
        .order('지점', { ascending: true });

      if (supaErr) {
        throw supaErr;
      }

      if (data) {
        const typedData = data as unknown as SaleRecord[];
        setRecords(typedData);

        // 데이터 중 가장 최신 월을 KPI 기준 월로 기본 설정
        const months = Array.from(new Set(typedData.map((r) => r.월))).sort();
        if (months.length > 0) {
          setSelectedKpiMonth((prev) => (months.includes(prev) ? prev : months[months.length - 1]));
        }
      }
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Fetch sales error:', err);
      // PRD: 불러오지 못하면 숫자나 내용을 지어내지 말고 「불러오지 못했습니다」
      setError('불러오지 못했습니다');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. 공공데이터포털 공휴일 데이터 조회 (내부 Next.js API 경유)
  const fetchHolidays = useCallback(async () => {
    try {
      const res = await fetch('/api/holidays?year=2026', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setHolidays(json.data);
      }
    } catch (err) {
      console.warn('Holiday fetch warning:', err);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
    fetchHolidays();
  }, [fetchSalesData, fetchHolidays]);

  // 사용 가능한 고유 월 목록 추출 (오름차순)
  const availableMonths = Array.from(new Set(records.map((r) => r.월))).sort();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 상단 서브 헤더 */}
      <Header
        onRefresh={fetchSalesData}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* 오류 안내 배너 */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold">데이터 연동 안내</p>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* 로딩 표시 (최초 로드 시) */}
        {isLoading && records.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-600">
              Supabase 클라우드에서 매출 데이터를 실시간으로 불러오는 중입니다...
            </p>
          </div>
        ) : (
          <>
            {/* 1. 상단 섹션 1: 실시간 핵심 KPI 카드 (3종) */}
            <KpiCards
              records={records}
              selectedMonth={selectedKpiMonth}
              onMonthChange={setSelectedKpiMonth}
              availableMonths={availableMonths}
            />

            {/* 2. 상단 섹션 2: 인터랙티브 차트 (2종) */}
            <SalesCharts
              records={records}
              holidays={holidays}
              availableMonths={availableMonths}
            />

            {/* 3. 중단 섹션: 월별/지점별 통합 데이터 테이블 */}
            <SalesTable
              records={records}
              availableMonths={availableMonths}
            />

            {/* 4. 하단 섹션: 지점장 월 마감 간편 등록 폼 */}
            <SalesForm
              onSuccess={fetchSalesData}
              records={records}
            />
          </>
        )}
      </main>
    </div>
  );
}
