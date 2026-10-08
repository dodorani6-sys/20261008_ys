import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

interface ModelBadgeProps {
  modelUsed: string;
}

export default function ModelBadge({ modelUsed }: ModelBadgeProps) {
  const isFallback = modelUsed.includes('lite');

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-all shadow-xs bg-white border-slate-200">
      <Cpu className={`w-4 h-4 ${isFallback ? 'text-amber-500' : 'text-indigo-600'}`} />
      <span className="text-slate-600">분석 수행 모델:</span>
      <span className={`font-semibold ${isFallback ? 'text-amber-700' : 'text-indigo-700'}`}>
        {modelUsed}
      </span>
      {isFallback ? (
        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
          503 폴백 적용
        </span>
      ) : (
        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> 기본 모델
        </span>
      )}
    </div>
  );
}
