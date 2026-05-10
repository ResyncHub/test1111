import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_costs")
    .select("*")
    .eq("job_id", id)
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("job_costs")
    .insert({ job_id: id, description: body.description, amount: body.amount, cost_date: body.cost_date ?? new Date().toISOString().split("T")[0] })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const costId = searchParams.get("costId");
  if (!costId) return NextResponse.json({ error: "costId required" }, { status: 400 });
  const { error } = await supabase.from("job_costs").delete().eq("id", costId).eq("job_id", jobId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
