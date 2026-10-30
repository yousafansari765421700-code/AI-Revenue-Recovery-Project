import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: Array<{
    id: string;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
      thumb: string;
    };
    alt_description: string | null;
    description: string | null;
  }>;
}

function buildQuery(name: string | null | undefined, category: string | null | undefined): string {
  const parts: string[] = [];
  if (name && name.trim()) parts.push(name.trim());
  if (category && category.trim()) parts.push(category.trim());
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function pickUrl(result: UnsplashSearchResponse["results"][number]): string {
  return result.urls.regular || result.urls.small || result.urls.thumb || result.urls.full;
}

export async function GET(req: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";
  const category = searchParams.get("category") || "";

  const query = buildQuery(name, category);
  if (!query) {
    return NextResponse.json(
      { error: "MISSING_QUERY", message: "Provide ?name=... and/or ?category=..." },
      { status: 400 }
    );
  }

  if (!accessKey) {
    return NextResponse.json(
      {
        error: "UNSPLASH_NOT_CONFIGURED",
        message:
          "UNSPLASH_ACCESS_KEY is not set in .env.local. Add your Unsplash Access Key to enable dynamic product images. Until then, the local product image system is used.",
      },
      { status: 503 }
    );
  }

  try {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "squarish");
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "UNSPLASH_UPSTREAM_ERROR",
          status: res.status,
          message: `Unsplash API returned ${res.status}`,
        },
        { status: 502 }
      );
    }

    const data = (await res.json()) as UnsplashSearchResponse;
    const first = data.results?.[0];
    if (!first) {
      return NextResponse.json(
        { error: "NO_RESULT", message: `No Unsplash image found for "${query}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      query,
      image_url: pickUrl(first),
      alt: first.alt_description || first.description || query,
    });
  } catch (err: any) {
    console.error("UNSPLASH_SEARCH_ERROR", err);
    return NextResponse.json(
      { error: "INTERNAL", message: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
