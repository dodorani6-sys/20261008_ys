'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Receipt, BarChart3, MessageSquareText, Home, Heart } from 'lucide-react';

export const NAV_ITEMS = [
  { name: '홈', href: '/', icon: Home },
  { name: '경비 정산', href: '/expense', icon: Receipt },
  { name: '지점 매출', href: '/sales', icon: BarChart3 },
  { name: '리뷰 분석', href: '/reviews', icon: MessageSquareText },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Desktop Layout (md and up): Single Row */}
        <div className="hidden md:flex items-center justify-between h-16">
          {/* Logo / Service Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-slate-900 text-lg lg:text-xl tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-xs">
              <Briefcase className="w-5 h-5" />
            </span>
            <span>내 업무 도구함</span>
          </Link>

          {/* Navigation Tabs & made by 라니 */}
          <div className="flex items-center gap-3 lg:gap-4">
            <nav className="flex items-center space-x-1 lg:space-x-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* made by 라니 버튼 */}
            <button
              type="button"
              onClick={() => {
                alert('✨ made by 라니 ✨\n\n경비 정산 · 지점 매출 · 리뷰 분석을 한 곳에서 편리하게 관리하는 「내 업무 도구함」입니다!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:via-rose-600 hover:to-amber-600 text-white text-xs lg:text-sm font-bold shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 border border-pink-300/30"
              title="제작: 라니 (클릭해 보세요!)"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
              <span className="whitespace-nowrap">made by 라니</span>
            </button>
          </div>
        </div>

        {/* Mobile Layout (< md): 2-Tier Bar without text wrapping */}
        <div className="md:hidden py-2 space-y-2">
          {/* Top Row: Logo & made by 라니 */}
          <div className="flex items-center justify-between px-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-slate-900 text-base tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white shadow-xs">
                <Briefcase className="w-4 h-4" />
              </span>
              <span className="whitespace-nowrap font-bold">내 업무 도구함</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                alert('✨ made by 라니 ✨\n\n경비 정산 · 지점 매출 · 리뷰 분석을 한 곳에서 편리하게 관리하는 「내 업무 도구함」입니다!');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 border border-pink-300/30"
              title="제작: 라니"
            >
              <Heart className="w-3 h-3 fill-current text-white animate-pulse" />
              <span className="whitespace-nowrap">made by 라니</span>
            </button>
          </div>

          {/* Bottom Row: 4 Navigation Tabs */}
          <nav className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center justify-center gap-1 py-1.5 px-0.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-blue-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="whitespace-nowrap tracking-tight">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
