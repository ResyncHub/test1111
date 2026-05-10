import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const customer_id = searchParams.get("customer_id");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  let query = supabase
    .from("jobs")
    .select("*, customer:customers(id,full_name,phone), category:service_categories(id,name)")
    .order("scheduled_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (customer_id) query = query.eq("customer_id", customer_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title:            body.title,
      customer_id:      body.customer_id ?? null,
      category_id:      body.category_id ?? null,
      description:      body.description ?? null,
      status:           body.status ?? "nowe",
      scheduled_at:     body.scheduled_at ?? null,
      scheduled_end_at: body.scheduled_end_at ?? null,
      address:          body.address ?? null,
      notes:            body.notes ?? null,
      revenue:          body.revenue ?? 0,
    })
    .select("*, customer:customers(id,full_name,phone), category:service_categories(id,name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
