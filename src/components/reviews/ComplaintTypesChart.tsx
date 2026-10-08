import React, { useState } from 'react';
import { AnalyzedReview, COMPLAINT_CATEGORIES } from '@/lib/reviews/types';
import { BarChart3, Filter } from 'lucide-react';

interface ComplaintTypesChartProps {
  reviews: AnalyzedReview[];
}

export default function ComplaintTypesChart({ reviews }: ComplaintTypesChartProps) {
  const [filterMode, setFilterMode] = useState<'negativeOnly' | 'all'>('negativeOnly');

  // Filter reviews based on user toggle
  const targetReviews = reviews.filter((r) => {
    if (r.sentiment === '광고') return false; // Exclude ads
    if (filterMode === 'negativeOnly') return r.sentiment === '부정';
    return true;
  });

  // Calculate occurrences of each category
  const categoryCounts = new Map<string, number>();
  for (const cat of COMPLAINT_CATEGORIES) {
    categoryCounts.set(cat, 0);
  }

  for (const r of targetReviews) {
    if (Array.isArray(r.categories)) {
      for (const cat of r.categories) {
        if (categoryCounts.has(cat)) {
          categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
        } else {
          categoryCounts.set('기타', (categoryCounts.get('기타') || 0) + 1);
        }
      }
    }
  }

  // Sort descending
  const sortedCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...sortedCategories.map((c) => c.count), 1);
  const totalOccurrences = sortedCategories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">유형별 피드백 발생 건수</h3>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            고객 리뷰에서 언급된 14개 표준 유형별 집계 현황입니다.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 text-xs font-medium border border-slate-200">
          <button
            type="button"
            onClick={() => setFilterMode('negativeOnly')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              filterMode === 'negativeOnly'
                ? 'bg-white text-rose-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-rose-500" />
            부정 리뷰 기준 (불만 집중)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체 유효 리뷰 기준
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedCategories.map((item, idx) => {
          const percentage = ((item.count / maxCount) * 100).toFixed(0);
          const shareOfTotal = totalOccurrences > 0 ? ((item.count / totalOccurrences) * 100).toFixed(1) : '0';
          const isTop3 = idx < 3 && item.count > 0;

          return (
            <div key={item.category} className="group">
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                      isTop3
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={`font-semibold ${isTop3 ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800">{item.count}건</span>
                  <span className="text-slate-400">({shareOfTotal}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isTop3
                      ? 'bg-rose-500'
                      : item.count > 0
                      ? 'bg-indigo-500'
                      : 'bg-slate-200'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
