import React, { useState } from 'react';
import { AnalyzedReview, SentimentType, COMPLAINT_CATEGORIES } from '@/lib/reviews/types';
import { Search, ShieldAlert, MessageSquare, Edit3, Check, X, Tag } from 'lucide-react';

interface ReviewsListProps {
  reviews: AnalyzedReview[];
  onUpdateReview?: (updated: AnalyzedReview) => void;
}

export default function ReviewsList({ reviews, onUpdateReview }: ReviewsListProps) {
  const [filterSentiment, setFilterSentiment] = useState<SentimentType | 'all' | 'safety' | 'edited'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingReview, setEditingReview] = useState<AnalyzedReview | null>(null);
  const [editSentiment, setEditSentiment] = useState<SentimentType>('중립');
  const [editCategories, setEditCategories] = useState<string[]>([]);

  const handleOpenEdit = (review: AnalyzedReview) => {
    setEditingReview(review);
    setEditSentiment(review.sentiment);
    setEditCategories([...review.categories]);
  };

  const handleSaveEdit = () => {
    if (!editingReview) return;

    const updated: AnalyzedReview = {
      ...editingReview,
      sentiment: editSentiment,
      categories: editCategories.length > 0 ? editCategories : ['기타'],
      is_edited: true,
    };

    if (onUpdateReview) {
      onUpdateReview(updated);
    }

    setEditingReview(null);
  };

  const toggleCategory = (cat: string) => {
    if (editCategories.includes(cat)) {
      setEditCategories(editCategories.filter((c) => c !== cat));
    } else {
      setEditCategories([...editCategories, cat]);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filterSentiment === 'safety') {
      if (!r.is_safety_issue) return false;
    } else if (filterSentiment === 'edited') {
      if (!r.is_edited) return false;
    } else if (filterSentiment !== 'all') {
      if (r.sentiment !== filterSentiment) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inText = r.review_text.toLowerCase().includes(q);
      const inReq = r.improvement_request?.toLowerCase().includes(q) ?? false;
      const inCat = r.categories.some((c) => c.toLowerCase().includes(q));
      if (!inText && !inReq && !inCat) return false;
    }

    return true;
  });

  const getSentimentBadge = (sentiment: SentimentType) => {
    switch (sentiment) {
      case '긍정':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case '부정':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case '중립':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case '광고':
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">분석 리뷰 상세 내역</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filtered.length} / {reviews.length}건
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            개별 리뷰의 판정 결과(감성, 유형 태그)를 확인하고 필요시 직접 수정할 수 있습니다.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="리뷰 내용 / 태그 / 번호 검색"
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48"
            />
          </div>

          {/* Sentiment Filter buttons */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterSentiment('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSentiment === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setFilterSentiment('긍정')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSentiment === '긍정' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              긍정
            </button>
            <button
              type="button"
              onClick={() => setFilterSentiment('부정')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSentiment === '부정' ? 'bg-white text-rose-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              부정
            </button>
            <button
              type="button"
              onClick={() => setFilterSentiment('중립')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSentiment === '중립' ? 'bg-white text-slate-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              중립
            </button>
            <button
              type="button"
              onClick={() => setFilterSentiment('광고')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSentiment === '광고' ? 'bg-white text-amber-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              광고
            </button>
            <button
              type="button"
              onClick={() => setFilterSentiment('safety')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                filterSentiment === 'safety' ? 'bg-rose-50 text-rose-700 font-bold shadow-xs' : 'text-rose-600'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              안전이슈
            </button>
            <button
              type="button"
              onClick={() => setFilterSentiment('edited')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                filterSentiment === 'edited' ? 'bg-amber-50 text-amber-800 font-bold shadow-xs' : 'text-amber-700'
              }`}
            >
              수정됨
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-16">No</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-24">작성일 / 별점</th>
              <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-24">감성</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-44">유형 태그</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">리뷰 본문 / 개선 요구</th>
              <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-20">수정</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  해당 조건의 리뷰가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.review_no}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.is_safety_issue ? 'bg-rose-50/30' : item.is_edited ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <td className="px-3 py-3 text-center font-medium text-slate-500 whitespace-nowrap">
                    #{item.review_no}
                  </td>
                  <td className="px-3 py-3 text-left whitespace-nowrap">
                    <div className="text-slate-800 font-medium">{item.written_on}</div>
                    <div className="text-amber-500 font-bold mt-0.5">★ {item.rating}</div>
                  </td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-bold ${getSentimentBadge(
                          item.sentiment
                        )}`}
                      >
                        {item.sentiment}
                      </span>
                      {item.is_edited && (
                        <span className="inline-block px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          수정됨
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-left">
                    <div className="flex flex-wrap gap-1">
                      {item.categories.map((c) => (
                        <span
                          key={c}
                          className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        >
                          {c}
                        </span>
                      ))}
                      {item.is_safety_issue && (
                        <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          안전이슈
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left leading-relaxed">
                    <p className="text-slate-800">{item.review_text}</p>
                    {item.improvement_request && (
                      <p className="text-blue-700 font-medium mt-1 text-[11px] bg-blue-50/70 px-2 py-0.5 rounded border border-blue-100 inline-block">
                        요구: {item.improvement_request}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors text-[11px]"
                      title="감성 및 카테고리 수정"
                    >
                      <Edit3 className="w-3 h-3" />
                      수정
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <h4 className="text-base font-bold text-slate-900">
                  리뷰 #{editingReview.review_no}번 분류 수정
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Review text preview */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900 block mb-1">리뷰 본문:</span>
              &ldquo;{editingReview.review_text}&rdquo;
            </div>

            {/* Sentiment Selector */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                감성 분류 변경:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['긍정', '부정', '중립', '광고'] as SentimentType[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditSentiment(st)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      editSentiment === st
                        ? st === '긍정'
                        : st === '부정'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : st === '중립'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                        : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    } ${
                      editSentiment === '긍정' && st === '긍정'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : ''
                    } ${
                      editSentiment !== st
                        ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        : ''
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Selector */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  유형 태그 선택 (다중 선택):
                </label>
                <span className="text-[11px] text-slate-400">
                  선택됨: {editCategories.length}개
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50/50">
                {COMPLAINT_CATEGORIES.map((cat) => {
                  const isSelected = editCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notice */}
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-4 leading-relaxed">
              💡 수정 완료 시 해당 리뷰에 <strong>[수정됨]</strong> 표시가 추가되며, 상단 요약 카드의 비율과 집계 통계에도 즉시 반영됩니다.
            </p>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                수정 적용하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
