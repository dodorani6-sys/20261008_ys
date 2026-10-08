import React, { useEffect, useState, useCallback } from 'react';
import { HistorySummary } from '@/lib/reviews/types';
import { fetchAnalysisHistory } from '@/lib/reviews/supabase';
import { History, RefreshCw, AlertTriangle, Database } from 'lucide-react';

interface HistoryTableProps {
  lastUpdatedTimestamp?: number;
}

export default function HistoryTable({ lastUpdatedTimestamp }: HistoryTableProps) {
  const [history, setHistory] = useState<HistorySummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await fetchAnalysisHistory();
      if (error) {
        throw error;
      }
      setHistory(data);
    } catch (err: unknown) {
      console.error('Failed to load analysis history:', err);
      // PRD 3.5 #14: 실패 시 '불러오지 못했습니다' 문구
      setErrorMsg('불러오지 못했습니다');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, lastUpdatedTimestamp]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">과거 분석 이력 및 월별 추이</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supabase DB에 적재된 분석일자(analyzed_on)별 집계 데이터 (광고 제외 부정 비율 기준 추적)
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          이력 새로고침
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          분석 이력을 조회 중입니다...
        </div>
      ) : errorMsg ? (
        <div className="p-6 rounded-lg bg-rose-50 border border-rose-200 text-center">
          <AlertTriangle className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
          <p className="text-sm font-bold text-rose-700">{errorMsg}</p>
          <p className="text-xs text-rose-600 mt-0.5">
            데이터베이스 연결 상태를 확인해 주세요.
          </p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 rounded-lg bg-slate-50 border border-slate-200 text-center">
          <Database className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">누적된 분석 이력이 없습니다.</p>
          <p className="text-xs text-slate-500 mt-1">
            위에서 리뷰 CSV 파일을 업로드하여 첫 번째 분석을 진행해 보세요.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  분석 일자 (analyzed_on)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                  총 리뷰 건수
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                  광고 제외 실리뷰
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                  부정 리뷰 건수
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                  부정 리뷰 비율 (광고 제외)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  분석 모델
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {history.map((row) => (
                <tr key={row.analyzed_on} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    {row.analyzed_on}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">
                    {row.total_count}건
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 whitespace-nowrap">
                    {row.non_ad_count}건{' '}
                    <span className="text-[11px] text-slate-400">(광고 {row.ad_count}건)</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-rose-600 whitespace-nowrap">
                    {row.negative_count}건
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded bg-rose-50 border border-rose-100">
                      {row.negative_ratio}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {row.model_used || 'gemini-3.8-flash'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
