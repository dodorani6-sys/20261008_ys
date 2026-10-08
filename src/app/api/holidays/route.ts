import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || '2026';

  const serviceKey =
    process.env.HOLIDAY_API_KEY || process.env.HOLIDAY_API_SERVICE_KEY;

  if (!serviceKey) {
    return NextResponse.json(
      { error: '불러오지 못했습니다' },
      { status: 500 }
    );
  }

  try {
    // Try requesting with decoded key (or encoded if provided)
    const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=${year}&_type=json&numOfRows=100&ServiceKey=${encodeURIComponent(
      serviceKey
    )}`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    const text = await res.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // If the portal returned XML or error page, attempt unencoded query or return empty fallback
      const altUrl = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=${year}&_type=json&numOfRows=100&ServiceKey=${serviceKey}`;
      const altRes = await fetch(altUrl, { next: { revalidate: 86400 } });
      data = await altRes.json();
    }

    const items = data?.response?.body?.items?.item || [];
    const holidayList = Array.isArray(items) ? items : items ? [items] : [];

    const holidayCountMap: Record<string, { count: number; holidays: string[] }> =
      {};

    holidayList.forEach((item: any) => {
      if (item && item.isHoliday === 'Y') {
        const dateStr = String(item.locdate);
        const yyyyMm = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}`;

        if (!holidayCountMap[yyyyMm]) {
          holidayCountMap[yyyyMm] = { count: 0, holidays: [] };
        }
        holidayCountMap[yyyyMm].count += 1;
        holidayCountMap[yyyyMm].holidays.push(item.dateName);
      }
    });

    return NextResponse.json({ success: true, data: holidayCountMap });
  } catch (err: any) {
    console.error('Holiday API Error:', err);
    return NextResponse.json(
      { success: false, error: '불러오지 못했습니다', data: {} },
      { status: 200 }
    );
  }
}
