import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.GAS_WEBAPP_URL;

// POST /api/loan — Submit a new model loan request
export async function POST(req: NextRequest) {
  if (!GAS_URL) {
    return NextResponse.json(
      { error: "GAS_WEBAPP_URL is not configured. See .env.local.example." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();

    const gasRes = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submitLoan", payload: body }),
    });

    if (!gasRes.ok) {
      const text = await gasRes.text();
      console.error("[loan POST] GAS error:", text);
      return NextResponse.json(
        { error: "Google Sheets write failed." },
        { status: 502 }
      );
    }

    const data = await gasRes.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error("[loan POST] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// GET /api/loan?email=xxx — Check loan status for an email address
export async function GET(req: NextRequest) {
  if (!GAS_URL) {
    return NextResponse.json(
      { error: "GAS_WEBAPP_URL is not configured." },
      { status: 503 }
    );
  }

  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { error: "email query param is required." },
      { status: 400 }
    );
  }

  try {
    const gasRes = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getLoanStatus", email }),
    });

    if (!gasRes.ok) {
      return NextResponse.json(
        { error: "Google Sheets read failed." },
        { status: 502 }
      );
    }

    const data = await gasRes.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[loan GET] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
