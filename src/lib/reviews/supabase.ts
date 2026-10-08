import { supabase } from '@/lib/supabase';
import { AnalyzedReview, HistorySummary } from './types';

export const TABLE_NAME =
  process.env.NEXT_PUBLIC_REVIEW_TABLE || 'review_analysis_20261007';

/**
 * Insert analyzed reviews into Supabase table.
 * PRD 3.4: 리뷰 건별로 행(Row) 생성
 */
export async function insertAnalyzedReviews(reviews: AnalyzedReview[]): Promise<{ error: Error | null }> {
  try {
    const rows = reviews.map((r) => ({
      analyzed_on: r.analyzed_on,
      review_no: r.review_no,
      written_on: r.written_on,
      rating: r.rating,
      review_text: r.review_text,
      sentiment: r.sentiment,
      categories: Array.isArray(r.categories) ? r.categories.join(', ') : (r.categories || ''),
      improvement_request: r.improvement_request || null,
      is_safety_issue: r.is_safety_issue,
      model_used: r.model_used,
      is_edited: r.is_edited ?? false,
    }));

    // Batch insert
    const { error } = await supabase.from(TABLE_NAME).insert(rows);
    if (error) {
      console.error('Supabase insert error:', error);
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown insert error';
    return { error: new Error(message) };
  }
}

/**
 * Update a specific analyzed review (e.g. user manually changed sentiment or categories).
 */
export async function updateAnalyzedReview(
  review_no: number,
  analyzed_on: string,
  updates: { sentiment?: AnalyzedReview['sentiment']; categories?: string[]; is_edited?: boolean }
): Promise<{ error: Error | null }> {
  try {
    const payload: Record<string, unknown> = {
      is_edited: true,
    };
    if (updates.sentiment) {
      payload.sentiment = updates.sentiment;
    }
    if (updates.categories) {
      payload.categories = Array.isArray(updates.categories)
        ? updates.categories.join(', ')
        : updates.categories;
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('review_no', review_no)
      .eq('analyzed_on', analyzed_on);

    if (error) {
      console.error('Supabase update error:', error);
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown update error';
    return { error: new Error(message) };
  }
}

/**
 * Fetch past analysis history summary.
 * PRD 3.4: 분석일자(analyzed_on)별 총 건수 및 부정 리뷰 비율(광고 제외 기준) 요약
 * 캐시 없이 항상 최신 데이터 실시간 조회
 */
export async function fetchAnalysisHistory(): Promise<{ data: HistorySummary[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('analyzed_on, sentiment, model_used')
      .order('analyzed_on', { ascending: false });

    if (error) {
      console.error('Supabase fetch history error:', error);
      return { data: [], error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    // Group by analyzed_on
    const grouped = new Map<string, {
      total: number;
      negative: number;
      ad: number;
      models: Set<string>;
    }>();

    for (const row of data) {
      const date = row.analyzed_on ? String(row.analyzed_on).split('T')[0] : '미지정';
      if (!grouped.has(date)) {
        grouped.set(date, { total: 0, negative: 0, ad: 0, models: new Set() });
      }
      const entry = grouped.get(date)!;
      entry.total += 1;
      if (row.sentiment === '부정') {
        entry.negative += 1;
      }
      if (row.sentiment === '광고') {
        entry.ad += 1;
      }
      if (row.model_used) {
        entry.models.add(row.model_used);
      }
    }

    const summaries: HistorySummary[] = [];
    grouped.forEach((entry, date) => {
      const nonAd = entry.total - entry.ad;
      const negativeRatio = nonAd > 0 ? (entry.negative / nonAd) * 100 : 0;

      summaries.push({
        analyzed_on: date,
        total_count: entry.total,
        negative_count: entry.negative,
        ad_count: entry.ad,
        non_ad_count: nonAd,
        negative_ratio: Math.round(negativeRatio * 10) / 10,
        model_used: Array.from(entry.models).join(', ') || 'N/A',
      });
    });

    // Sort by analyzed_on descending
    summaries.sort((a, b) => b.analyzed_on.localeCompare(a.analyzed_on));

    return { data: summaries, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown fetch error';
    return { data: [], error: new Error(message) };
  }
}
