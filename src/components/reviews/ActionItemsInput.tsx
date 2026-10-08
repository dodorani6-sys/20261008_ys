import React, { useState, useEffect } from 'react';
import { PenTool, Copy, Check, Save } from 'lucide-react';

export default function ActionItemsInput() {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved1 = localStorage.getItem('cleanfit_fix_1');
      const saved2 = localStorage.getItem('cleanfit_fix_2');
      const saved3 = localStorage.getItem('cleanfit_fix_3');
      if (saved1) setLine1(saved1);
      if (saved2) setLine2(saved2);
      if (saved3) setLine3(saved3);
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('cleanfit_fix_1', line1);
      localStorage.setItem('cleanfit_fix_2', line2);
      localStorage.setItem('cleanfit_fix_3', line3);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleCopy = () => {
    const text = `[클린핏 미니 개선 방향 — 우리가 고칠 것 3줄 요약]\n1. ${line1 || '(미작성)'}\n2. ${line2 || '(미작성)'}\n3. ${line3 || '(미작성)'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">우리가 고칠 것</h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
              실무자 직접 작성
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            담당자가 분석 대시보드를 종합하여 회의 및 보고용으로 제출할 3줄 결론을 직접 작성합니다. (AI 자동 생성 미적용)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-slate-500" />}
            {saved ? '저장됨' : '임시 저장'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!line1 && !line2 && !line3}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-slate-200 disabled:text-slate-400"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '복사 완료' : '3줄 결론 복사'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Row 1 */}
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 border border-blue-200">
            1
          </span>
          <input
            type="text"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="첫 번째 개선 결론을 입력해 주세요 (예: 충전 어댑터 발열 관련 부품 전수 점검 및 KC 인증 재검토)"
            className="flex-1 text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 border border-blue-200">
            2
          </span>
          <input
            type="text"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            placeholder="두 번째 개선 결론을 입력해 주세요 (예: 상세페이지 내 배터리 작동시간 표기 정정 및 강모드 안내 보강)"
            className="flex-1 text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Row 3 */}
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 border border-blue-200">
            3
          </span>
          <input
            type="text"
            value={line3}
            onChange={(e) => setLine3(e.target.value)}
            placeholder="세 번째 개선 결론을 입력해 주세요 (예: 한글 설명서 동봉 패키징 변경 및 거치대 기본 포함 옵션 신설)"
            className="flex-1 text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}
