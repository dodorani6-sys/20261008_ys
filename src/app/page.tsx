import React from 'react';
import Link from 'next/link';
import { Receipt, BarChart3, MessageSquareText, ArrowRight, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

export default function Home() {
  const tools = [
    {
      title: '경비 정산 검사기',
      path: '/expense',
      icon: Receipt,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      description: '사내 경비 규정(제5조~제9조)을 기반으로 중복 제출, 한도 초과, 미승인 항목을 자동으로 검증합니다.',
      features: ['CSV/XLSX 파일 검증', '제출자별 반려 사유 복사', '실시간 규정 검사 엔진'],
      badge: '사내 규정 검사',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      title: '지점 매출 관리판',
      path: '/sales',
      icon: BarChart3,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      description: '5개 지점(용산, 삼각지, 이태원, 효창공원, 한남)의 월 매출/객수 관리 및 법정공휴일 상관관계를 분석합니다.',
      features: ['실시간 핵심 KPI 대시보드', '지점별 추이 & 공휴일 복합 차트', '지점장 간편 등록 폼'],
      badge: '매출 & 공휴일',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: '리뷰 분석기',
      path: '/reviews',
      icon: MessageSquareText,
      iconColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      hoverBorder: 'hover:border-violet-400',
      description: '고객 리뷰를 Gemini AI로 일괄 분석하여 감성/유형 분류, 안전 이슈 탐지 및 소비자원 위해 통계를 제공합니다.',
      features: ['Gemini 3.8 Flash AI 분석', '소비자원 위해정보 API 연동', '과거 분석 이력 누적'],
      badge: 'Gemini AI 분석',
      badgeColor: 'bg-violet-100 text-violet-700',
    },
  ];

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>업무 효율을 높이는 통합 도구 포털</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          내 업무 도구함
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600">
          흩어져 있던 세 가지 핵심 업무 도구를 하나의 링크에서 편리하게 확인하고 관리하세요.
        </p>
      </div>

      {/* 3 Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              href={tool.path}
              className={`group flex flex-col justify-between bg-white rounded-2xl border ${tool.borderColor} ${tool.hoverBorder} p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {tool.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {tool.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 flex items-center justify-between text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                <span>도구 열기</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="mt-12 sm:mt-16 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              안전한 환경변수 및 실시간 데이터 조회
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              비공개 API 키는 안전하게 서버 라우트에서만 실행되며, Supabase 데이터는 캐시 없이 실시간으로 조회됩니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
