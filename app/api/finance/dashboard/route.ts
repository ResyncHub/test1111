import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [todayJobs, unpaidJobs, openJobs, monthRevenue, monthCosts] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact" }).gte("scheduled_at", startOfDay).lt("scheduled_at", endOfDay),
    supabase.from("jobs").select("id", { count: "exact" }).eq("status", "zakonczone"),
    supabase.from("jobs").select("id", { count: "exact" }).in("status", ["nowe", "w_trakcie"]),
    supabase.from("jobs").select("revenue").gte("scheduled_at", startOfMonth).in("status", ["zakonczone", "oplacone"]),
    supabase.from("job_costs").select("amount, job:jobs!inner(scheduled_at)").gte("job.scheduled_at", startOfMonth),
  ]);

  const revenue = (monthRevenue.data ?? []).reduce((s, j) => s + Number(j.revenue), 0);
  const costs   = (monthCosts.data ?? []).reduce((s, c) => s + Number(c.amount), 0);

  return NextResponse.json({
    todayJobsCount:  todayJobs.count ?? 0,
    unpaidJobsCount: unpaidJobs.count ?? 0,
    openJobsCount:   openJobs.count ?? 0,
    monthRevenue:    revenue,
    monthCosts:      costs,
    monthProfit:     revenue - costs,
  });
}
