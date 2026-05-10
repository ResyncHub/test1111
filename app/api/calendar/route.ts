import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("jobs")
    .select("id,title,status,scheduled_at,scheduled_end_at,customer:customers(full_name)")
    .not("scheduled_at", "is", null);

  if (from) query = query.gte("scheduled_at", from);
  if (to)   query = query.lte("scheduled_at", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
