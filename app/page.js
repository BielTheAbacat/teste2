"use client";
import { useEffect, useState } from "react";
import { supabase, OWNER_EMAIL, configured, loadAll } from "../lib/supabase";

const WHATS = "554399349260"; // +55 43 9934-9260
const REVIEW = "https://search.google.com/local/writereview?placeid=ChIJpWmHL2g2wpQRylboVUajVrw";
const R = (n) => "R$ " + Number(n || 0).toFixed(2).replace(".", ",");
const TIPOS = [["pf", "Prato feito"], ["eco", "Marmita econômica (1 opção de carne)"], ["p", "Marmita P"], ["m", "Marmita M"], ["g", "Marmita G"]];
const uid = () => crypto.randomUUID();

const Hat = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
    <path d="M18 40a11 11 0 0 1 3-21 13 13 0 0 1 22 0 11 11 0 0 1 3 21z" fill="#fff" stroke="#b3201f" strokeWidth="3" />
    <rect x="18" y="42" width="28" height="10" rx="2" fill="#fff" stroke="#b3201f" strokeWidth="3" />
  </svg>
);

const Step = ({ v, set, min = 0 }) => (
  <span className="step">
    <button type="button" onClick={() => set(Math.max(min, v - 1))} aria-label="Menos">−</button><b>{v}</b>
    <button type="button" onClick={() => set(v + 1)} aria-label="Mais">+</button>
  </span>
);

export default function Home() {
  const [d, setD] = useState(null);
  const [panel, setPanel] = useState(false);
  const [err, setErr] = useState("");
  const load = () => loadAll().then(setD).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  if (!d) return <p style={{ padding: 24 }}>{!configured ? "O site ainda não está ligado ao Supabase. Veja o arquivo README.txt." : err ? "Não foi possível carregar o cardápio: " + err : "Carregando..."}</p>;
  const out = d.items.filter((i) => i.soldOut);
  return (
    <>
      <button className="hat" onClick={() => setPanel(true)} aria-label="Área do dono"><Hat /></button>
      <header className="hero"><div className="in">
        <div>
          <h1>Comida caseira, feita com amor pra você e pra sua família.</h1>
          <p>Veja o cardápio de hoje, monte seu pedido em poucos toques e envie direto para o nosso WhatsApp.</p>
          <div className="cta"><a className="btn gold" href="#pedido">Montar pedido</a><a className="btn ghost" href="#cardapio">Ver cardápio</a></div>
        </div>
        <img className="logo" src="/logo.png" alt="Restaurante Sabeime - Comida caseira" />
      </div></header>
      <main>
        <section id="cardapio" className="sec"><div className="in">
          <h2>Cardápio de hoje</h2>
          <div className="frame">
            {d.image ? <img className="menu" src={d.image.url} alt="Cardápio do dia" /> : <p className="empty">O cardápio de hoje ainda não foi publicado.</p>}
          </div>
          {out.length > 0 && <p className="warn">Estamos sem {out.map((i) => i.name).join(", ")}</p>}
        </div></section>
        <Order d={d} />
        <section className="review">
          <h2>Gostou da nossa comida?</h2>
          <p>Sua avaliação ajuda muito o restaurante.</p>
          <a className="btn gold" href={REVIEW} target="_blank" rel="noreferrer">Avalie-nos no Google</a>
        </section>
      </main>
      <footer>Restaurante Sabeime · Comida caseira</footer>
      {panel && <Panel d={d} reload={load} close={() => { setPanel(false); load(); }} />}
    </>
  );
}

function Order({ d }) {
  const [tipo, setTipo] = useState("pf");
  const [qtd, setQtd] = useState(1);
  const [mist, setMist] = useState([]);
  const [sem, setSem] = useState([]);
  const [salada, setSalada] = useState(0);
  const [beb, setBeb] = useState({});
  const [obs, setObs] = useState("");
  const [nome, setNome] = useState("");
  const tg = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const misturas = d.items.filter((i) => i.kind === "mistura");
  const acomp = d.items.filter((i) => i.kind === "acomp");
  const drinks = d.drinks.filter((b) => !b.soldOut);

  const semTxt = sem.map((s) => "sem " + s.toLowerCase()).join(" e ");
  const lines = [[`${qtd}x ${TIPOS.find((t) => t[0] === tipo)[1]}${semTxt ? " " + semTxt : ""}`, d.prices[tipo] * qtd]];
  if (mist.length) lines.push(["Mistura: " + mist.join(", ")]);
  if (salada) lines.push([`${salada}x Salada`, d.prices.salada * salada]);
  drinks.forEach((b) => { const n = beb[b.id] || 0; if (n) lines.push([`${n}x ${b.name}`, b.price * n]); });
  const total = lines.reduce((s, l) => s + (l[1] || 0), 0);

  const send = () => {
    if (!nome.trim()) { alert("Digite seu nome para continuar."); document.getElementById("nome")?.focus(); return; }
    const msg = [`Olá! Meu nome é ${nome.trim()} e quero fazer um pedido:`, "", ...lines.map((l) => l[0])];
    if (obs.trim()) msg.push("Obs: " + obs.trim());
    msg.push("", "Total: " + R(total));
    window.open(`https://wa.me/${WHATS}?text=${encodeURIComponent(msg.join("\n"))}`, "_blank");
  };

  return (
    <section id="pedido" className="sec"><div className="in">
      <h2>Monte seu pedido</h2>
      <p className="sub">Escolha como você quer e envie direto para o nosso WhatsApp.</p>
      <div className="order">
        <div className="card">
          <div className="grp"><h3>Escolha seu prato</h3>
            <div className="choices">
              {TIPOS.map(([k, n]) => (
                <label key={k} className="choice"><span><input type="radio" name="tipo" checked={tipo === k} onChange={() => setTipo(k)} />{n}</span><b>{R(d.prices[k])}</b></label>
              ))}
            </div>
            <div className="line"><span>Quantidade</span><Step v={qtd} set={setQtd} min={1} /></div>
          </div>
          {misturas.length > 0 && (
            <div className="grp"><h3>Mistura</h3><div className="choices">
              {misturas.map((i) => (
                <label key={i.id} className={"choice" + (i.soldOut ? " off" : "")}><span>
                  <input type="checkbox" disabled={i.soldOut} checked={mist.includes(i.name)} onChange={() => tg(mist, setMist, i.name)} />{i.name}</span>{i.soldOut && <b>Esgotado</b>}</label>
              ))}
            </div></div>
          )}
          {acomp.length > 0 && (
            <div className="grp"><h3>Quer tirar alguma coisa?</h3><div className="choices">
              {acomp.map((i) => (
                <label key={i.id} className={"choice" + (i.soldOut ? " off" : "")}><span>
                  <input type="checkbox" disabled={i.soldOut} checked={sem.includes(i.name)} onChange={() => tg(sem, setSem, i.name)} />Sem {i.name.toLowerCase()}</span></label>
              ))}
            </div></div>
          )}
          <div className="grp"><h3>Extras</h3>
            <div className="line"><span>Salada · {R(d.prices.salada)}</span><Step v={salada} set={setSalada} /></div>
            {drinks.map((b) => (
              <div key={b.id} className="line"><span>{b.name} · {R(b.price)}</span><Step v={beb[b.id] || 0} set={(n) => setBeb({ ...beb, [b.id]: n })} /></div>
            ))}
          </div>
          <div className="grp"><h3>Seus dados</h3>
            <input id="nome" type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <textarea rows={2} placeholder="Alguma observação? (ex.: carne bem passada)" value={obs} onChange={(e) => setObs(e.target.value)} />
          </div>
        </div>
        <aside className="card sum">
          <h3>Seu pedido</h3>
          <ul>{lines.map((l, i) => <li key={i}><span>{l[0]}</span>{l[1] != null && <b>{R(l[1])}</b>}</li>)}</ul>
          <div className="total"><span>Total</span><span>{R(total)}</span></div>
          <button className="btn full" onClick={send}>Enviar pelo WhatsApp</button>
        </aside>
      </div>
      <div className="bar"><div><small>Total</small><br /><b>{R(total)}</b></div><button className="btn" onClick={send}>Enviar pedido</button></div>
    </div></section>
  );
}

function Panel({ d, reload, close }) {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [s, setS] = useState({ items: d.items, drinks: d.drinks, prices: d.prices });
  const [msg, setMsg] = useState("");
  useEffect(() => { supabase.auth.getSession().then(({ data }) => data.session && setOk(true)); }, []);
  const login = async () => {
    const r = await supabase.auth.signInWithPassword({ email: OWNER_EMAIL, password: pw });
    r.error ? alert("Senha incorreta.") : setOk(true);
  };
  const logout = async () => { await supabase.auth.signOut(); setOk(false); setPw(""); };
  const sync = async (table, rows) => {
    const old = await supabase.from(table).select("id");
    if (old.error) return old.error;
    const gone = old.data.map((r) => r.id).filter((id) => !rows.some((r) => r.id === id));
    if (gone.length) { const x = await supabase.from(table).delete().in("id", gone); if (x.error) return x.error; }
    return rows.length ? (await supabase.from(table).upsert(rows)).error : null;
  };
  const save = async () => {
    setMsg("Salvando...");
    const named = (a) => a.filter((x) => x.name.trim());
    const errs = [
      await sync("menu_items", named(s.items).map((x, n) => ({ id: x.id, name: x.name.trim(), kind: x.kind, sold_out: x.soldOut, position: n }))),
      await sync("drinks", named(s.drinks).map((x, n) => ({ id: x.id, name: x.name.trim(), price: x.price || 0, sold_out: x.soldOut, position: n }))),
      (await supabase.from("settings").update({ prices: s.prices }).eq("id", 1)).error,
    ].filter(Boolean);
    setMsg(errs.length ? "Não foi possível salvar: " + errs[0].message : "Salvo!"); reload();
  };
  const shrink = (f) => new Promise((res) => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1800 / im.width), c = document.createElement("canvas");
      c.width = im.width * k; c.height = im.height * k;
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      c.toBlob((b) => res(b || f), "image/jpeg", 0.88);
    };
    im.onerror = () => res(f);
    im.src = URL.createObjectURL(f);
  });
  const upload = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    setMsg("Enviando...");
    const path = `cardapio-${Date.now()}.jpg`;
    const up = await supabase.storage.from("cardapio").upload(path, await shrink(f), { contentType: "image/jpeg" });
    if (up.error) return setMsg("Não foi possível enviar a imagem: " + up.error.message);
    const u = await supabase.from("settings").update({ image_path: path, image_version: Date.now() }).eq("id", 1);
    if (u.error) return setMsg("Não foi possível salvar a imagem: " + u.error.message);
    if (d.image?.path) await supabase.storage.from("cardapio").remove([d.image.path]);
    setMsg("Cardápio atualizado!"); reload();
  };
  const edit = (k, id, patch) => setS({ ...s, [k]: s[k].map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const del = (k, id) => setS({ ...s, [k]: s[k].filter((x) => x.id !== id) });
  const add = (k, obj) => setS({ ...s, [k]: [...s[k], { id: uid(), name: "", soldOut: false, ...obj }] });

  return (
    <div className="modal"><div className="panel">
      <div className="top"><h2 style={{ margin: 0 }}>Área do dono</h2><span>{ok && <button className="x" style={{ fontSize: 15, marginRight: 12 }} onClick={logout}>Sair</button>}<button className="x" onClick={close} aria-label="Fechar">✕</button></span></div>
      {!ok ? (
        <>
          <input type="password" placeholder="Senha" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
          <button className="btn" onClick={login}>Entrar</button>
        </>
      ) : (
        <>
          <fieldset><legend>Imagem do cardápio</legend><input type="file" accept="image/*" onChange={upload} /></fieldset>
          <fieldset><legend>Itens do cardápio (misturas e acompanhamentos)</legend>
            {s.items.map((i) => (
              <div className="row" key={i.id}>
                <input type="text" placeholder="Nome (ex.: Almôndegas)" value={i.name} onChange={(e) => edit("items", i.id, { name: e.target.value })} />
                <select value={i.kind} onChange={(e) => edit("items", i.id, { kind: e.target.value })}>
                  <option value="mistura">Mistura</option><option value="acomp">Acompanhamento</option>
                </select>
                <label><input type="checkbox" checked={i.soldOut} onChange={(e) => edit("items", i.id, { soldOut: e.target.checked })} /> Esgotado</label>
                <button className="x" onClick={() => del("items", i.id)} aria-label="Remover">✕</button>
              </div>
            ))}
            <button className="btn gold" onClick={() => add("items", { kind: "mistura" })}>Adicionar item</button>
          </fieldset>
          <fieldset><legend>Bebidas</legend>
            {s.drinks.map((b) => (
              <div className="row" key={b.id}>
                <input type="text" placeholder="Nome (ex.: Coca 2L)" value={b.name} onChange={(e) => edit("drinks", b.id, { name: e.target.value })} />
                <input type="number" step="0.5" min="0" defaultValue={b.price} onChange={(e) => edit("drinks", b.id, { price: Number(e.target.value) })} />
                <label><input type="checkbox" checked={b.soldOut} onChange={(e) => edit("drinks", b.id, { soldOut: e.target.checked })} /> Esgotada</label>
                <button className="x" onClick={() => del("drinks", b.id)} aria-label="Remover">✕</button>
              </div>
            ))}
            <button className="btn gold" onClick={() => add("drinks", { price: 0 })}>Adicionar bebida</button>
          </fieldset>
          <fieldset><legend>Preços</legend>
            {[...TIPOS, ["salada", "Salada"]].map(([k, n]) => (
              <div className="qty" key={k}><span>{n}</span>
                <input type="number" step="0.5" min="0" style={{ width: 110 }} defaultValue={s.prices[k]} onChange={(e) => setS({ ...s, prices: { ...s.prices, [k]: Number(e.target.value) } })} /></div>
            ))}
          </fieldset>
          <button className="btn" onClick={save}>Salvar alterações</button>
          {msg && <p className="ok">{msg}</p>}
        </>
      )}
    </div></div>
  );
}
