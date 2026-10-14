import { put } from "@vercel/blob";
import { createHash } from "crypto";

export const PASSWORD = process.env.OWNER_PASSWORD || "1234";
export const token = () => createHash("sha256").update("sabeime:" + PASSWORD).digest("hex");
export const isOwner = (req) => req.cookies.get("owner")?.value === token();
export const NO_STORE = "Falta conectar o armazenamento (Blob) na Vercel. Veja o arquivo README.txt.";

const base = {
  image: null,
  items: ["Arroz", "Feijão", "Farofa", "Macarrão"].map((name, i) => ({ id: "a" + i, name, kind: "acomp", soldOut: false })),
  drinks: [],
  prices: { pf: 24, eco: 15, p: 22, m: 24, g: 26, salada: 8 },
};

// o endereço público do armazenamento vem do próprio token do Blob
const store = () => (process.env.BLOB_READ_WRITE_TOKEN || "").split("_")[3]?.toLowerCase();

export async function readDb() {
  try {
    const r = await fetch(`https://${store()}.public.blob.vercel-storage.com/db.json?t=${Date.now()}`, { cache: "no-store" });
    if (r.ok) return { ...structuredClone(base), ...(await r.json()) };
  } catch {}
  return structuredClone(base);
}

export async function writeDb(d) {
  await put("db.json", JSON.stringify(d), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 });
}
