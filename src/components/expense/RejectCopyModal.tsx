"use client";

import React, { useState } from "react";
import { ExpenseItem } from "@/lib/expense/types";
import { Copy, Check, MessageSquare, Users } from "lucide-react";

interface RejectCopyModalProps {
  items: ExpenseItem[];
}

interface SubmitterViolationGroup {
  name: string;
  department: string;
  items: ExpenseItem[];
}

export default function RejectCopyModal({ items }: RejectCopyModalProps) {
  const [copiedKey, setCopiedKey] = useState<string>("");

  // 위반 건만 필터링
  const violatedItems = items.filter((item) => item.isViolated);

  if (violatedItems.length === 0) {
    return null;
  }

  // 제출자별 그룹화
  const submitterMap = new Map<string, SubmitterViolationGroup>();

  violatedItems.forEach((item) => {
    const submitter = item.제출자 || "이름 없음";
    if (!submitterMap.has(submitter)) {
      submitterMap.set(submitter, {
        name: submitter,
        department: item.부서 || "",
        items: [],
      });
    }
    submitterMap.get(submitter)!.items.push(item);
  });

  const submitterGroups = Array.from(submitterMap.values());

  // 클립보드 복사 헬퍼 함수
  const copyToClipboard = (text: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedKey(key);
          setTimeout(() => setCopiedKey(""), 2000);
        })
        .catch(() => {
          fallbackCopy(text, key);
        });
    } else {
      fallbackCopy(text, key);
    }
  };

  const fallbackCopy = (text: string, key: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    } catch (e) {
      console.error("클립보드 복사 실패", e);
    }
    document.body.removeChild(textarea);
  };

  // 1. 개별 제출자 반려 문구 생성
  const generateSubmitterText = (group: SubmitterViolationGroup) => {
    let text = `[경비 정산 반려 안내 - ${group.name} 님]\n`;
    group.items.forEach((item) => {
      const violationsStr =
        item.violations?.map((v) => `[${v.article}] ${v.reason}`).join(" / ") ||
        "";
      const amountStr = item.금액 ? `${item.금액.toLocaleString()}원` : item.원래금액;
      text += `- ${item.번호}번 (${item.항목} / ${item.가맹점} / ${amountStr}): ${violationsStr}\n`;
    });
    return text;
  };

  // 2. 전체 제출자 일괄 반려 문구 생성
  const handleCopyAll = () => {
    let text = `[경비 정산 전체 위반 내역 요약]\n\n`;
    submitterGroups.forEach((group) => {
      text += `■ ${group.name} 님 (${group.department})\n`;
      group.items.forEach((item) => {
        const violationsStr =
          item.violations?.map((v) => `[${v.article}] ${v.reason}`).join(" / ") ||
          "";
        const amountStr = item.금액 ? `${item.금액.toLocaleString()}원` : item.원래금액;
        text += `  - ${item.번호}번 (${item.항목} / ${item.가맹점} / ${amountStr}): ${violationsStr}\n`;
      });
      text += `\n`;
    });

    copyToClipboard(text, "ALL");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
      {/* 영역 상단 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-semibold text-slate-800">
              제출자별 반려 사유 복사
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              총 {submitterGroups.length}명 위반
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            직원에게 돌려보낼 때 사내 메신저(카카오톡, Slack 등)나 메일에 바로 붙여넣을 수 있는 정형화된 텍스트입니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-xs"
        >
          {copiedKey === "ALL" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              전체 복사 완료!
            </>
          ) : (
            <>
              <Users className="w-3.5 h-3.5" />
              전체 위반자 일괄 복사
            </>
          )}
        </button>
      </div>

      {/* 제출자별 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {submitterGroups.map((group) => {
          const isCopied = copiedKey === group.name;
          const textToCopy = generateSubmitterText(group);

          return (
            <div
              key={group.name}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex flex-col justify-between space-y-3 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm">
                    {group.name}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      ({group.department})
                    </span>
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    위반 {group.items.length}건
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-600 bg-white/80 p-2 rounded border border-slate-200/60"
                    >
                      <p className="font-medium text-slate-800">
                        • {item.번호}번 ({item.항목} / {item.가맹점} /{" "}
                        {item.금액.toLocaleString()}원)
                      </p>
                      <p className="text-red-600 text-xs mt-0.5 pl-2">
                        {item.violations?.map((v) => v.reason).join(" / ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => copyToClipboard(textToCopy, group.name)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-xs"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      복사 완료!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      안내 문구 복사
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
