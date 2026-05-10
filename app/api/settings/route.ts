import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("app_settings").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const settings: Record<string, unknown> = {};
  (data ?? []).forEach(row => { settings[row.key] = row.value; });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const upserts = Object.entries(body).map(([key, value]) => ({
    key,
    value: JSON.stringify(value),
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("app_settings").upsert(upserts, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
