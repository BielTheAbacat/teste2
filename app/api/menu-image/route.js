import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { dataDir, isOwner, readDb, writeDb } from "../../../lib/db";
export const dynamic = "force-dynamic";
const img = path.join(dataDir, "menu-image.bin");

export async function GET() {
  const d = readDb();
  if (!d.image || !fs.existsSync(img)) return new Response(null, { status: 404 });
  return new Response(fs.readFileSync(img), { headers: { "Content-Type": d.image.type, "Cache-Control": "no-cache" } });
}

export async function POST(req) {
  if (!isOwner(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const f = (await req.formData()).get("file");
  if (!f || !f.type.startsWith("image/")) return NextResponse.json({ ok: false }, { status: 400 });
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(img, Buffer.from(await f.arrayBuffer()));
  const d = readDb();
  d.image = { type: f.type, v: Date.now() };
  writeDb(d);
  return NextResponse.json({ ok: true });
}
