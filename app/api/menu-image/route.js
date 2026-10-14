import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isOwner, readDb, writeDb, NO_STORE } from "../../../lib/db";

export async function POST(req) {
  if (!isOwner(req)) return NextResponse.json({ ok: false }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ ok: false, error: NO_STORE }, { status: 500 });
  try {
    const f = (await req.formData()).get("file");
    if (!f || !f.type.startsWith("image/")) return NextResponse.json({ ok: false, error: "Escolha uma imagem." }, { status: 400 });
    const blob = await put("cardapio.jpg", f, { access: "public", addRandomSuffix: true, contentType: f.type });
    const d = await readDb();
    const old = d.image?.url;
    d.image = { url: blob.url, v: Date.now() };
    await writeDb(d);
    if (old) { try { await del(old); } catch {} }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível enviar a imagem. Tente de novo." }, { status: 500 });
  }
}
