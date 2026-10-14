import fs from "fs";
import path from "path";
import { createHash } from "crypto";

export const dataDir = path.join(process.cwd(), "data");
const file = path.join(dataDir, "db.json");
export const PASSWORD = process.env.OWNER_PASSWORD || "1234";
export const token = () => createHash("sha256").update("sabeime:" + PASSWORD).digest("hex");
export const isOwner = (req) => req.cookies.get("owner")?.value === token();

const base = {
  image: null,
  items: ["Arroz", "Feijão", "Farofa", "Macarrão"].map((name, i) => ({ id: "a" + i, name, kind: "acomp", soldOut: false })),
  drinks: [],
  prices: { pf: 24, eco: 15, p: 22, m: 24, g: 26, salada: 8 },
};

export function readDb() {
  try { return { ...base, ...JSON.parse(fs.readFileSync(file, "utf8")) }; }
  catch { return structuredClone(base); }
}
export function writeDb(d) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(d));
}
