"use client";

import React, { useState } from "react";
import FileUploader from "@/components/expense/FileUploader";
import ExpenseTable from "@/components/expense/ExpenseTable";
import { ExpenseItem } from "@/lib/expense/types";
import { parseExpenseCSV } from "@/lib/expense/parser";
import { Sparkles, BarChart3 } from "lucide-react";
import SummaryCards from "@/components/expense/SummaryCards";
import RejectCopyModal from "@/components/expense/RejectCopyModal";
import { validateExpenses } from "@/lib/expense/rules";

// 샘플 9월 경비내역 CSV 데이터 (기본 탑재)
const SAMPLE_CSV = `번호,제출자,부서,사용일,사용시각,항목,가맹점,금액,인원,증빙,품의번호,제출일,메모
1,김지현,설계팀,2026-09-01,12:30,식대,한솥도시락 한강로점,9800,1,법인카드,,2026-09-25,
2,박민수,시공팀,2026-09-02,19:40,식대,김밥천국 용산점,15000,1,법인카드,,2026-09-25,야근
3,이서연,영업팀,2026-09-03,21:50,택시,카카오T,18400,1,법인카드,,2026-09-25,고객사 이동(성수 현장)
4,최유진,경영지원팀,2026-09-03,20:30,택시,카카오T,16200,1,법인카드,,2026-09-25,퇴근
5,정하늘,시공팀,2026-09-04,12:10,식대,백반집 원효로,48000,4,법인카드,,2026-09-25,현장 점심
6,김지현,설계팀,2026-09-05,14:00,소모품,오피스디포 용산점,34500,1,간이영수증,,2026-09-25,제도용 펜
7,한도윤,영업팀,2026-09-05,19:00,접대비,한우명가 삼각지점,420000,5,법인카드,,2026-09-25,거래처 저녁
8,박민수,시공팀,2026-09-08,23:10,택시,카카오T,24300,1,법인카드,,2026-09-25,야근 후 퇴근
9,이서연,영업팀,2026-09-09,12:40,회의비,스타벅스 용산역점,29900,1,간이영수증,,2026-09-25,고객 미팅 음료
10,최유진,경영지원팀,2026-09-10,12:20,식대,한솥도시락 한강로점,9800,1,법인카드,,2026-09-25,
11,정하늘,시공팀,2026-09-10,10:30,교통비,코레일,59800,1,법인카드,,2026-09-25,대전 현장 KTX
12,한도윤,영업팀,2026-09-11,19:30,접대비,일식당 스시겐,280000,4,법인카드,,2026-09-25,거래처 저녁
13,김지현,설계팀,2026-09-12,20:00,식대,맘스터치 용산점,11500,1,법인카드,,2026-09-25,야근
14,박민수,시공팀,2026-09-12,18:50,식대,고깃집 용문,72000,4,법인카드,,2026-09-25,현장 회식
15,이서연,영업팀,2026-08-14,15:00,소모품,다이소 용산점,8900,1,간이영수증,,2026-09-25,샘플 포장
16,최유진,경영지원팀,2026-09-15,12:30,식대,한솥도시락 한강로점,9800,1,법인카드,,2026-09-25,
17,정하늘,시공팀,2026-09-15,21:40,택시,카카오T,19800,1,법인카드,,2026-09-25,퇴근
18,한도윤,영업팀,2026-09-16,11:00,소모품,알파문구 용산점,45000,1,간이영수증,,2026-09-25,제안서 제본
19,김지현,설계팀,2026-09-17,19:20,식대,본죽 한강로점,12000,1,법인카드,,2026-09-25,야근
20,박민수,시공팀,2026-09-18,13:00,자재,한샘자재센터,380000,1,세금계산서,,2026-09-25,샘플 타일
21,이서연,영업팀,2026-09-18,22:30,택시,카카오T,21000,1,법인카드,,2026-09-25,퇴근
22,최유진,경영지원팀,2026-09-19,12:10,식대,한솥도시락 한강로점,9800,1,법인카드,,2026-09-25,
23,정하늘,시공팀,2026-09-19,12:00,식대,백반집 원효로,48000,4,법인카드,,2026-09-25,현장 점심
24,한도윤,영업팀,2026-09-22,19:00,접대비,한우명가 삼각지점,350000,4,법인카드,품의-2026-091,2026-09-25,거래처 저녁(사전 품의)
25,박민수,시공팀,2026-09-08,23:10,택시,카카오T,24300,1,법인카드,,2026-09-25,야근 후 퇴근 택시`;

export default function ExpensePage() {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [filename, setFilename] = useState<string>("");

  const handleDataLoaded = (loadedItems: ExpenseItem[], name: string) => {
    // 룰 엔진 검증 실행
    const validatedItems = validateExpenses(loadedItems);
    setItems(validatedItems);
    setFilename(name);
  };

  const handleLoadSample = () => {
    const { items: sampleItems } = parseExpenseCSV(SAMPLE_CSV);
    // 룰 엔진 검증 실행
    const validatedItems = validateExpenses(sampleItems);
    setItems(validatedItems);
    setFilename("9월_경비내역.csv (샘플 데이터)");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 상단 페이지 헤더 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white p-1.5 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  경비 정산 검사기
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  ✨ 메이드 by 라니
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  v1.0
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                경비 내역 파일(CSV 또는 엑셀 XLSX)을 업로드하면 회사 경비 규정(제5조~제9조) 위반 여부를 자동으로 검사합니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                9월 경비 내역 샘플 불러오기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* CSV 업로더 컴포넌트 */}
        <FileUploader
          onDataLoaded={handleDataLoaded}
          currentFilename={filename}
          totalCount={items.length}
        />

        {/* 데이터가 로드되었을 때 요약 카드 및 테이블 표시 */}
        {items.length > 0 && (
          <div className="space-y-6">
            {/* PRD 3.3 대시보드 요약 (Summary Cards: 핵심 지표 카드 & 조항별 위반 통계 칩) */}
            <SummaryCards items={items} />

            {/* PRD 3.4 제출자별 반려 사유 클립보드 복사 UI */}
            <RejectCopyModal items={items} />

            {/* 실시간 반응형 데이터 그리드 테이블 (위반 건만 보기 필터 지원) */}
            <ExpenseTable items={items} />
          </div>
        )}
      </main>
    </div>
  );
}
