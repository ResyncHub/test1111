import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const year  = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()));
  const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null;

  if (month) {
    const { data, error } = await supabase.rpc("monthly_summary", { p_year: year, p_month: month });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data?.[0] ?? { total_revenue: 0, total_costs: 0, profit: 0, job_count: 0 });
  }

  // Rok: pobierz dane dla każdego miesiąca
  const months = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      supabase.rpc("monthly_summary", { p_year: year, p_month: i + 1 }).then(r => ({ month: i + 1, ...(r.data?.[0] ?? { total_revenue: 0, total_costs: 0, profit: 0, job_count: 0 }) }))
    )
  );
  return NextResponse.json(months);
}
