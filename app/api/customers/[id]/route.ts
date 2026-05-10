import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [customerRes, jobsRes] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("jobs").select("id,title,status,scheduled_at,revenue").eq("customer_id", id).order("scheduled_at", { ascending: false }),
  ]);

  if (customerRes.error) return NextResponse.json({ error: customerRes.error.message }, { status: 404 });
  return NextResponse.json({ ...customerRes.data, jobs: jobsRes.data ?? [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("customers")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
