import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.GAS_WEBAPP_URL;

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
      body: JSON.stringify({ action: "submitJob", payload: body }),
    });

    if (!gasRes.ok) {
      const text = await gasRes.text();
      console.error("[submit-job] GAS error:", text);
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
    console.error("[submit-job] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
