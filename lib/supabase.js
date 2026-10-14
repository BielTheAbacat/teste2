import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key);
export const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || "dono@sabeime.com";
export const supabase = createClient(url || "http://localhost:54321", key || "sem-chave");

// Lê tudo que o cliente precisa ver e entrega no formato que a página usa
export async function loadAll() {
  const [i, b, s] = await Promise.all([
    supabase.from("menu_items").select("*").order("position"),
    supabase.from("drinks").select("*").order("position"),
    supabase.from("settings").select("*").eq("id", 1).single(),
  ]);
  const e = i.error || b.error || s.error;
  if (e) throw new Error(e.message);
  const path = s.data.image_path;
  return {
    items: i.data.map((r) => ({ id: r.id, name: r.name, kind: r.kind, soldOut: r.sold_out })),
    drinks: b.data.map((r) => ({ id: r.id, name: r.name, price: Number(r.price), soldOut: r.sold_out })),
    prices: s.data.prices,
    image: path ? { path, v: s.data.image_version, url: supabase.storage.from("cardapio").getPublicUrl(path).data.publicUrl } : null,
  };
}
