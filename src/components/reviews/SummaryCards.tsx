import React from 'react';
import { AnalyzedReview } from '@/lib/reviews/types';
import { ThumbsUp, ThumbsDown, MinusCircle, Megaphone, FileCheck } from 'lucide-react';

interface SummaryCardsProps {
  reviews: AnalyzedReview[];
}

export default function SummaryCards({ reviews }: SummaryCardsProps) {
  const totalCount = reviews.length;
  const adReviews = reviews.filter((r) => r.sentiment === '광고');
  const adCount = adReviews.length;
  const nonAdReviews = reviews.filter((r) => r.sentiment !== '광고');
  const nonAdCount = nonAdReviews.length;

  const positiveReviews = nonAdReviews.filter((r) => r.sentiment === '긍정');
  const negativeReviews = nonAdReviews.filter((r) => r.sentiment === '부정');
  const neutralReviews = nonAdReviews.filter((r) => r.sentiment === '중립');

  const positiveRatio = nonAdCount > 0 ? ((positiveReviews.length / nonAdCount) * 100).toFixed(1) : '0';
  const negativeRatio = nonAdCount > 0 ? ((negativeReviews.length / nonAdCount) * 100).toFixed(1) : '0';
  const neutralRatio = nonAdCount > 0 ? ((neutralReviews.length / nonAdCount) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* Notice regarding exclusion of ads */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 bg-slate-100/70 px-4 py-2.5 rounded-lg border border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-600" />
          <span>
            총 분석 리뷰 <strong className="text-slate-800">{totalCount}건</strong> 중 광고(체험단/원고료 등){' '}
            <strong className="text-amber-700">{adCount}건</strong>을 제외한 실고객 리뷰{' '}
            <strong className="text-slate-900">{nonAdCount}건</strong> 기준 집계입니다.
          </span>
        </div>
        <span className="text-slate-400 font-mono">광고 제외 원칙 적용</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 긍정 */}
        <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">긍정 피드백</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{positiveRatio}%</span>
            <span className="text-xs text-slate-500 font-medium">({positiveReviews.length}건)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">제품 만족 및 추천 리뷰</p>
        </div>

        {/* 부정 */}
        <div className="bg-white rounded-xl border border-rose-100 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">부정 피드백</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <ThumbsDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">{negativeRatio}%</span>
            <span className="text-xs text-slate-500 font-medium">({negativeReviews.length}건)</span>
          </div>
          <p className="text-xs text-rose-600/80 mt-2 font-medium">개선 필요 불만 및 반어법 포함</p>
        </div>

        {/* 중립 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-slate-400" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">중립 피드백</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <MinusCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-700">{neutralRatio}%</span>
            <span className="text-xs text-slate-500 font-medium">({neutralReviews.length}건)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">장단점 대등 또는 단순 사용평</p>
        </div>

        {/* 광고 (제외 건수) */}
        <div className="bg-white rounded-xl border border-amber-100 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">체험단 · 광고</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{adCount}건</span>
            <span className="text-xs text-slate-500 font-medium">
              (전체의 {totalCount > 0 ? ((adCount / totalCount) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <p className="text-xs text-amber-700/80 mt-2">신뢰도 확보 위해 통계 제외됨</p>
        </div>
      </div>
    </div>
  );
}
