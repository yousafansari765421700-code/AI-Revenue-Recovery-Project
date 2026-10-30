import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface UnsplashSearchResponse {
  results: Array<{
    id: string;
    urls: { raw: string; full: string; regular: string; small: string; thumb: string };
    alt_description: string | null;
    description: string | null;
  }>;
}

function buildQuery(name: string, category: string): string {
  return [name, category].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const adminGate = req.headers.get("x-admin-token");
  const expected = process.env.BACKFILL_TOKEN;
  if (!expected || adminGate !== expected) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Provide x-admin-token header matching BACKFILL_TOKEN." },
      { status: 403 }
    );
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "UNSPLASH_NOT_CONFIGURED", message: "Set UNSPLASH_ACCESS_KEY in .env.local first." },
      { status: 503 }
    );
  }

  const { data: products, error: listError } = await supabase
    .from("products")
    .select("id, name, category, image_url")
    .is("image_url", null);

  if (listError) {
    return NextResponse.json({ error: "LIST_ERROR", message: listError.message }, { status: 500 });
  }

  const targets = (products || []).filter((p: any) => !p.image_url);
  const results: any[] = [];

  for (const p of targets) {
    const query = buildQuery(p.name || "", p.category || "");
    if (!query) continue;

    try {
      const url = new URL("https://api.unsplash.com/search/photos");
      url.searchParams.set("query", query);
      url.searchParams.set("per_page", "1");
      url.searchParams.set("orientation", "squarish");

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Client-ID ${accessKey}`, "Accept-Version": "v1" },
      });

      if (!res.ok) {
        results.push({ id: p.id, name: p.name, status: "skipped", reason: `unsplash_${res.status}` });
        continue;
      }

      const data = (await res.json()) as UnsplashSearchResponse;
      const first = data.results?.[0];
      if (!first) {
        results.push({ id: p.id, name: p.name, status: "skipped", reason: "no_result" });
        continue;
      }

      const imageUrl = first.urls.regular || first.urls.small || first.urls.thumb;

      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: imageUrl })
        .eq("id", p.id)
        .eq("user_id", user.id);

      if (updateError) {
        results.push({ id: p.id, name: p.name, status: "failed", reason: updateError.message });
      } else {
        results.push({ id: p.id, name: p.name, status: "updated", image_url: imageUrl });
      }
    } catch (err: any) {
      results.push({ id: p.id, name: p.name, status: "failed", reason: err?.message });
    }
  }

  return NextResponse.json({ scanned: targets.length, results });
}
