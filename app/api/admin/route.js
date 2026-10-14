import { NextResponse } from "next/server";
import { PASSWORD, token, isOwner, readDb, writeDb, NO_STORE } from "../../../lib/db";

export async function POST(req) {
  const b = await req.json();
  if (b.action === "login") {
    if (b.password !== PASSWORD) return NextResponse.json({ ok: false }, { status: 401 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("owner", token(), { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }
  if (!isOwner(req)) return NextResponse.json({ ok: false }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ ok: false, error: NO_STORE }, { status: 500 });
  try {
    const d = await readDb();
    d.items = b.items; d.drinks = b.drinks; d.prices = b.prices;
    await writeDb(d);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível salvar. Tente de novo." }, { status: 500 });
  }
}
