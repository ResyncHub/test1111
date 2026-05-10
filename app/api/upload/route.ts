import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { jobId, fileName } = await req.json();

  const path = `${jobId}/${Date.now()}-${fileName}`;
  const { data, error } = await supabase.storage
    .from("job-photos")
    .createSignedUploadUrl(path);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const publicUrl = supabase.storage.from("job-photos").getPublicUrl(path).data.publicUrl;

  return NextResponse.json({ uploadUrl: data.signedUrl, path, publicUrl });
}
