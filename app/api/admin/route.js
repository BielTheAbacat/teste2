import { NextResponse } from "next/server";
import { PASSWORD, token, isOwner, readDb, writeDb } from "../../../lib/db";

export async function POST(req) {
  const b = await req.json();
  if (b.action === "login") {
    if (b.password !== PASSWORD) return NextResponse.json({ ok: false }, { status: 401 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("owner", token(), { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }
  if (!isOwner(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const d = readDb();
  d.items = b.items; d.drinks = b.drinks; d.prices = b.prices;
  writeDb(d);
  return NextResponse.json({ ok: true });
}
