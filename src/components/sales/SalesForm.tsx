'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BRANCH_LIST, BranchName, SaleRecord } from '@/lib/sales/types';
import { Send, CheckCircle2, AlertCircle, FileText, Sparkles, Edit3 } from 'lucide-react';

interface SalesFormProps {
  onSuccess: () => void;
  records?: SaleRecord[];
}

// 9월 지점장 단톡방 보고 참고 데이터
const SEP_PRESETS: Record<string, { sales: number; guests: number; notes: string }> = {
  용산역점: { sales: 54320000, guests: 6820, notes: '' },
  삼각지점: { sales: 32480000, guests: 4011, notes: '' },
  이태원점: { sales: 45870000, guests: 5690, notes: '추석 연휴 3일 단축 영업했습니다' },
  효창공원점: { sales: 18900000, guests: 2380, notes: '공사 아직 안 끝났어요' },
  한남점: { sales: 46100000, guests: 5520, notes: '' },
};

export default function SalesForm({ onSuccess, records = [] }: SalesFormProps) {
  const [month, setMonth] = useState('2026-09');
  const [branch, setBranch] = useState<BranchName>('용산역점');
  const [salesRaw, setSalesRaw] = useState('');
  const [guestsRaw, setGuestsRaw] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 현재 선택된 월/지점에 이미 데이터가 존재하는지 확인
  const existingRecord = records.find((r) => r.월 === month && r.지점 === branch);

  // 숫자 입력 시 천 단위 쉼표 포맷 핸들러
  const handleSalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setSalesRaw(rawVal ? Number(rawVal).toLocaleString('ko-KR') : '');
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setGuestsRaw(rawVal ? Number(rawVal).toLocaleString('ko-KR') : '');
  };

  // 9월 보고 프리셋 자동 채우기 도우미
  const applySepPreset = (selectedBranch: BranchName) => {
    const preset = SEP_PRESETS[selectedBranch];
    if (preset) {
      setMonth('2026-09');
      setBranch(selectedBranch);
      setSalesRaw(preset.sales.toLocaleString('ko-KR'));
      setGuestsRaw(preset.guests.toLocaleString('ko-KR'));
      setNotes(preset.notes);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const salesNum = Number(salesRaw.replace(/,/g, ''));
    const guestsNum = Number(guestsRaw.replace(/,/g, ''));

    if (!month || !branch) {
      setMessage({ type: 'error', text: '마감 월과 지점을 선택해 주세요.' });
      return;
    }

    if (isNaN(salesNum) || salesNum < 0) {
      setMessage({ type: 'error', text: '올바른 매출액을 입력해 주세요.' });
      return;
    }

    if (isNaN(guestsNum) || guestsNum < 0) {
      setMessage({ type: 'error', text: '올바른 객수를 입력해 주세요.' });
      return;
    }

    const isUpdating = Boolean(existingRecord);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('sales').upsert(
        {
          월: month,
          지점: branch,
          매출액: salesNum,
          객수: guestsNum,
          비고: notes.trim() || null,
        } as any,
        { onConflict: '월,지점' }
      );

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: isUpdating
          ? `[${month} / ${branch}] 데이터가 성공적으로 수정(덮어쓰기)되었습니다! 테이블에 [수정됨] 배지가 표시됩니다.`
          : `[${month} / ${branch}] 신규 마감 데이터가 성공적으로 등록되었습니다!`,
      });

      // 등록 후 폼 초기화
      setSalesRaw('');
      setGuestsRaw('');
      setNotes('');
      onSuccess();
    } catch (err: any) {
      console.error('Submit error:', err);
      setMessage({
        type: 'error',
        text: `저장 실패: ${err.message || '네트워크 오류가 발생했습니다.'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                지점장 월 마감 간편 등록 폼
              </h3>
              <p className="text-xs text-slate-500">
                별도의 비밀번호 없이 지점을 선택하고 당월 마감 숫자를 입력하세요. (동일 월·지점 입력 시 자동 수정)
              </p>
            </div>
          </div>

          {/* 9월 카톡 보고서 원클릭 프리셋 버튼 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Sparkles className="h-3 w-3 text-amber-500" /> 9월 보고 불러오기:
            </span>
            {BRANCH_LIST.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => applySepPreset(b)}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                {b.replace('점', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        {/* 기존 등록 데이터 감지 안내 */}
        {existingRecord && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800">
            <Edit3 className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">기존 등록 내역 확인:</span> [{month} / {branch}] 데이터가 이미 등록되어 있습니다.{' '}
              (현재 매출: <span className="font-semibold">{Number(existingRecord.매출액).toLocaleString('ko-KR')}원</span>, 객수:{' '}
              <span className="font-semibold">{Number(existingRecord.객수).toLocaleString('ko-KR')}명</span>)
              <br />
              새로운 값을 입력하고 저장하시면 <strong>해당 데이터가 즉시 수정(덮어쓰기)</strong>되며, 테이블에 <strong>[수정됨]</strong> 표시가 부여됩니다.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. 마감 월 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              마감 월 (YYYY-MM) <span className="text-rose-500">*</span>
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* 2. 지점 선택 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              지점 선택 <span className="text-rose-500">*</span>
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value as BranchName)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {BRANCH_LIST.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* 3. 매출액 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              월 매출액 (원) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="예: 48,510,000"
                value={salesRaw}
                onChange={handleSalesChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">
                원
              </span>
            </div>
          </div>

          {/* 4. 객수 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              방문 객수 (명) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="예: 6,107"
                value={guestsRaw}
                onChange={handleGuestsChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">
                명
              </span>
            </div>
          </div>
        </div>

        {/* 5. 비고 */}
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            비고 (영업 특이사항 메모)
          </label>
          <input
            type="text"
            placeholder="예: 추석 연휴 3일 단축 영업, 인근 도로 공사, 프로모션 오픈 등"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* 알림 메시지 */}
        {message && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="mt-5 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
              existingRecord
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
            }`}
          >
            {existingRecord ? <Edit3 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {isSubmitting
              ? '저장 중...'
              : existingRecord
              ? '✏️ 기존 데이터 수정하여 덮어쓰기'
              : '마감 데이터 등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
