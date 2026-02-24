import { NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; season: string }> },
) {
  const { id, season } = await params;

  if (!API_KEY) {
    return new NextResponse("TMDB_API_KEY environment variable is not set.", {
      status: 500,
    });
  }

  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/tv/${id}/season/${season}?language=en-US`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        xDontStealMyApiKey:
          "this isnt my key and i found it the same way you did so feel free to take it",
        Authorization: `Bearer ${API_KEY}`,
        accept: "application/json",
      },
    });

    if (!res.ok) {
      return new NextResponse(
        `Failed to fetch episodes for season ${season}. Status: ${res.status}`,
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new NextResponse(
        `An error occurred while fetching episodes for season ${season}: ${error.message}`,
        { status: 500 },
      );
    } else {
      return new NextResponse(
        "An unknown error occurred while fetching episodes.",
        { status: 500 },
      );
    }
  }
}
