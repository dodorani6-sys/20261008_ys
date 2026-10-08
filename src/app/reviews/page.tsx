'use client';

import React, { useState } from 'react';
import Header from '@/components/reviews/Header';
import FileUpload from '@/components/reviews/FileUpload';
import ModelBadge from '@/components/reviews/ModelBadge';
import SummaryCards from '@/components/reviews/SummaryCards';
import ComplaintTypesChart from '@/components/reviews/ComplaintTypesChart';
import SafetySection from '@/components/reviews/SafetySection';
import ActionItemsInput from '@/components/reviews/ActionItemsInput';
import HistoryTable from '@/components/reviews/HistoryTable';
import ReviewsList from '@/components/reviews/ReviewsList';
import { RawReview, AnalyzedReview } from '@/lib/reviews/types';
import { insertAnalyzedReviews, updateAnalyzedReview } from '@/lib/reviews/supabase';
import { AlertCircle, CheckCircle, Database } from 'lucide-react';

export default function ReviewsPage() {
  const [analyzedReviews, setAnalyzedReviews] = useState<AnalyzedReview[]>([]);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dbSaveStatus, setDbSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const handleStartAnalysis = async (reviews: RawReview[]) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setDbSaveStatus('idle');

    try {
      // 1. Single prompt request to Gemini API server route
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews }),
      });

      if (!res.ok) {
        // PRD 3.5 #14: 실패 시 "불러오지 못했습니다"
        throw new Error('불러오지 못했습니다');
      }

      const data = await res.json();
      if (data.error || !data.analyzedReviews) {
        throw new Error(data.error || '불러오지 못했습니다');
      }

      const resultReviews: AnalyzedReview[] = data.analyzedReviews;
      const resultModel: string = data.model_used || 'gemini-3.8-flash';

      setAnalyzedReviews(resultReviews);
      setModelUsed(resultModel);

      // 2. Automatically save analyzed reviews to Supabase DB
      setDbSaveStatus('saving');
      const { error: dbError } = await insertAnalyzedReviews(resultReviews);
      if (dbError) {
        console.error('Failed to save to Supabase:', dbError);
        setDbSaveStatus('error');
      } else {
        setDbSaveStatus('saved');
        // Refresh history table
        setLastUpdated(Date.now());
      }
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      // PRD 3.5 #14: 고정 문구 출력
      setErrorMessage('불러오지 못했습니다');
      setAnalyzedReviews([]);
      setModelUsed(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateReview = async (updated: AnalyzedReview) => {
    // 1. Update client state so cards & charts instantly re-calculate
    setAnalyzedReviews((prev) =>
      prev.map((r) => (r.review_no === updated.review_no ? updated : r))
    );

    // 2. Persist update to Supabase DB if already inserted
    const { error } = await updateAnalyzedReview(updated.review_no, updated.analyzed_on, {
      sentiment: updated.sentiment,
      categories: updated.categories,
      is_edited: true,
    });

    if (error) {
      console.warn('Could not update review in DB:', error.message);
    } else {
      // Trigger refresh of history table to reflect adjusted negative/ad ratio
      setLastUpdated(Date.now());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload Section */}
        <section>
          <FileUpload
            onStartAnalysis={handleStartAnalysis}
            isLoading={isAnalyzing}
          />
        </section>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">{errorMessage}</p>
              <p className="text-xs text-rose-700/80 mt-0.5">
                Gemini API 분석 요청 중 오류가 발생했거나 응답을 처리할 수 없습니다. 다시 시도해 주세요.
              </p>
            </div>
          </div>
        )}

        {/* Analysis Results View */}
        {analyzedReviews.length > 0 && (
          <div className="space-y-8">
            {/* Top Bar: Model Badge & DB Save Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                {modelUsed && <ModelBadge modelUsed={modelUsed} />}
                <span className="text-xs text-slate-500 font-medium">
                  분석 대상: {analyzedReviews.length}건
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {dbSaveStatus === 'saving' && (
                  <span className="text-blue-600 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 animate-pulse" /> Supabase DB 적재 중...
                  </span>
                )}
                {dbSaveStatus === 'saved' && (
                  <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Supabase DB 적재 완료
                  </span>
                )}
                {dbSaveStatus === 'error' && (
                  <span className="text-amber-700 font-medium flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> DB 저장 실패 (조회는 화면에서 가능)
                  </span>
                )}
              </div>
            </div>

            {/* 1. Summary Cards (긍정/부정/중립/광고) */}
            <section>
              <SummaryCards reviews={analyzedReviews} />
            </section>

            {/* 2. Complaints Distribution */}
            <section>
              <ComplaintTypesChart reviews={analyzedReviews} />
            </section>

            {/* 3. Safety Section (리뷰 내 안전이슈 vs 소비자원 위해 통계 병렬 노출) */}
            <section>
              <SafetySection reviews={analyzedReviews} />
            </section>

            {/* 4. Action Items Input ("우리가 고칠 것" 수동 3줄 결론 입력) */}
            <section>
              <ActionItemsInput />
            </section>

            {/* 5. Detailed Review List */}
            <section>
              <ReviewsList
                reviews={analyzedReviews}
                onUpdateReview={handleUpdateReview}
              />
            </section>
          </div>
        )}

        {/* Cumulative History Table */}
        <section className="pt-4 border-t border-slate-200">
          <HistoryTable lastUpdatedTimestamp={lastUpdated} />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <p>생활가전 쇼핑몰 「하루살림」 마케팅팀 · 무선 청소기 「클린핏 미니」 정기 리뷰 분석 시스템</p>
      </footer>
    </div>
  );
}
