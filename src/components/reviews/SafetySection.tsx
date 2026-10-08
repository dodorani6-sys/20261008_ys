import React, { useEffect, useState } from 'react';
import { AnalyzedReview, ConsumerSafetyResponse } from '@/lib/reviews/types';
import { ShieldAlert, AlertTriangle, Building2, Flame, Loader2, RefreshCw, Calendar } from 'lucide-react';

interface SafetySectionProps {
  reviews: AnalyzedReview[];
}

export default function SafetySection({ reviews }: SafetySectionProps) {
  const [safetyData, setSafetyData] = useState<ConsumerSafetyResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchConsumerSafety = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await fetch('/api/consumer-safety');
      if (!res.ok) {
        throw new Error('API request failed');
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSafetyData(data);
    } catch (err) {
      console.error('Failed to fetch consumer safety stats:', err);
      setHasError(true);
      setSafetyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumerSafety();
  }, []);

  // Filter reviews with detected safety issues
  const safetyReviews = reviews.filter((r) => r.is_safety_issue);

  return (
    <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-rose-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              제품 안전성 교차 검증 및 리스크 대응
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">
                중요 모니터링
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              클린핏 미니 고객 리뷰 내 안전 이슈와 한국소비자원 공식 위해 접수 데이터 병렬 비교
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchConsumerSafety}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          title="공공데이터 새로고침"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          위해정보 갱신
        </button>
      </div>

      {/* Parallel Grid (Left: Customer Reviews Safety Issues / Right: Official Consumer Safety Top 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Customer Reviews Safety Issues */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <h4 className="text-sm font-bold text-slate-900">
                고객 리뷰 안전 이슈 검출 ({safetyReviews.length}건)
              </h4>
            </div>
            <span className="text-xs text-slate-500">
              발열, 탄 냄새, 연기, 감전 등 정황 탐지
            </span>
          </div>

          {safetyReviews.length === 0 ? (
            <div className="p-6 rounded-lg bg-emerald-50/50 border border-emerald-200 text-center">
              <p className="text-sm font-semibold text-emerald-800">
                검출된 안전 이슈가 없습니다
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                현재 업로드된 리뷰 데이터에서 발열·화재 등 위해 징후가 감지되지 않았습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {safetyReviews.map((r) => (
                <div
                  key={r.review_no}
                  className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 text-xs space-y-2 hover:bg-rose-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        #{r.review_no}번 리뷰
                      </span>
                      <span className="text-slate-500">{r.written_on}</span>
                    </div>
                    <span className="font-semibold text-slate-700">★ {r.rating}점</span>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed bg-white/80 p-2.5 rounded border border-rose-100">
                    &ldquo;{r.review_text}&rdquo;
                  </p>

                  {r.improvement_request && (
                    <div className="text-rose-800 bg-rose-100/70 px-2.5 py-1 rounded text-[11px]">
                      <strong>개선 요구:</strong> {r.improvement_request}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: 한국소비자원 공식 위해 접수 데이터 (가정용 진공청소기 Top 3) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                한국소비자원 위해정보접수 현황 (Top 3)
              </h4>
            </div>
            <span className="text-xs text-slate-500">
              품목: 가정용 진공청소기
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 rounded-lg bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-600">한국소비자원 위해정보 API 조회 중...</p>
            </div>
          ) : hasError || !safetyData ? (
            /* PRD 3.5 #14: API 응답 실패 시 '불러오지 못했습니다' 문구 고정 출력 */
            <div className="p-8 rounded-lg bg-rose-50 border border-rose-200 text-center">
              <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-rose-700">불러오지 못했습니다</p>
              <p className="text-xs text-rose-600 mt-1">
                공공데이터포털 위해정보접수 API 응답이 원활하지 않거나 인증 오류가 발생했습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* 등록 기간 표시 배너 */}
              {safetyData.periodText && (
                <div className="flex items-center justify-between text-xs bg-blue-50/90 border border-blue-200 px-3 py-2 rounded-lg text-blue-900 shadow-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>
                      접수 등록 기간:{' '}
                      <strong className="text-blue-950 font-bold underline decoration-blue-300 underline-offset-2">
                        {safetyData.periodText}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-700/80 font-mono">최근 3,000건 표본</span>
                </div>
              )}

              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span>
                  청소기 사고 접수 총 <strong className="text-slate-800">{safetyData.totalIncidents}건</strong> 집계
                </span>
                <span className="text-[11px] text-slate-400">24시간 캐시 적용</span>
              </div>

              {safetyData.topReasons.map((item) => {
                const rankColor =
                  item.rank === 1
                    ? 'bg-rose-500 text-white'
                    : item.rank === 2
                    ? 'bg-amber-500 text-white'
                    : 'bg-blue-500 text-white';

                return (
                  <div
                    key={item.rank}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between hover:border-slate-300 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${rankColor}`}>
                        {item.rank}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.reason}</p>
                        <p className="text-[11px] text-slate-400">공식 위해 접수 사유</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900">{item.count}건</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
