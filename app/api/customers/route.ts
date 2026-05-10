import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  let dbQuery = supabase.from("customers").select("*").order("full_name").limit(limit);
  if (query) dbQuery = dbQuery.ilike("full_name", `%${query}%`);

  const { data, error } = await dbQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: body.full_name,
      phone:     body.phone ?? null,
      email:     body.email ?? null,
      address:   body.address ?? null,
      city:      body.city ?? null,
      notes:     body.notes ?? null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
