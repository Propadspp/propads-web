'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';
import type { Product } from '@/app/page';

type CartItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  size: string;
  qty: number;
};

export default function PropadsPage({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('propads_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('propads_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastOn(true);
    setTimeout(() => setToastOn(false), 2000);
  }

  function addToCart(product: Product) {
    const size = sizes[product._id];
    if (!size) { showToast('Veldu stærð fyrst'); return; }
    setCart(prev => {
      const ex = prev.find(i => i.id === product._id && i.size === size);
      if (ex) return prev.map(i => i.id === product._id && i.size === size ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product._id, name: product.name, price: product.price, category: product.category, size, qty: 1 }];
    });
    showToast('Bætt í körfu ✓');
  }

  function updateQty(id: string, size: string, d: number) {
    setCart(prev => prev.map(i => i.id === id && i.size === size ? { ...i, qty: i.qty + d } : i).filter(i => i.qty > 0));
  }

  function removeItem(id: string, size: string) {
    setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  async function checkout() {
    if (!cart.length) return;
    setPaying(true);
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: cart[0].id,
          productName: cart.map(i => `${i.name} (${i.size}) x${i.qty}`).join(', '),
          price: totalPrice,
        }),
      });
      const data = await res.json();
      if (data.payment_link) window.location.href = data.payment_link;
      else showToast('Villa við greiðslu. Reyndu aftur.');
    } catch { showToast('Tenging mistókst.'); }
    finally { setPaying(false); }
  }

  return (
    <>
      {/* NAV */}
      <nav className="nav-glass" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', lineHeight: 1 }}>PROPADS</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="cart-btn" onClick={() => setDrawerOpen(true)} aria-label="Karfa">
              <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </button>
            <a href="#vorur" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.875rem', borderRadius: 10 }}>Verslaðu núna</a>
          </div>
        </div>
      </nav>

      <div className="nav-center">
        <a href="#vorur" className="nav-link">Vörur</a>
        <a href="#legghlif" className="nav-link">Legghlífar</a>
        <a href="#gripsokkar" className="nav-link">Gripsokkar</a>
        <a href="#um-okkur" className="nav-link">Um okkur</a>
        <a href="#hafa-samband" className="nav-link">Hafðu samband</a>
      </div>

      {/* HERO */}
      <section className="hero-bg" style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -60, left: '50%', width: 800, height: 420, background: 'radial-gradient(ellipse,rgba(184,240,58,0.11) 0%,transparent 70%)', pointerEvents: 'none', animation: 'floatY 7s ease-in-out infinite' }} />
        <div className="badge-pill" style={{ marginBottom: 36 }}>
          <span className="badge-label">NÝTT</span>
          <span className="badge-text">Gripsokkar komnir á lagerinn →</span>
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(3.8rem,9.5vw,8.5rem)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.025em', color: '#fff', maxWidth: 940, marginBottom: 28 }}>
          Búðu þig undir<br/>
          <span style={{ color: '#b8f03a' }}>hvern leik.</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.0625rem', lineHeight: 1.75, maxWidth: 460, marginBottom: 44 }}>
          Legghlífar og gripsokkar hannaðar fyrir þær sem þora að keppa. Fáanlegar í S, M og L.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
          <a href="#vorur" className="btn-primary" style={{ padding: '14px 32px' }}>Skoðaðu vörurnar</a>
          <a href="#um-okkur" className="btn-outline" style={{ padding: '14px 32px' }}>Kynntu þér Propads</a>
        </div>
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: 0.28, pointerEvents: 'none' }}>
          <span style={{ fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Fletttu niður</span>
          <svg width="14" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ animation: 'arrowBob 2s ease-in-out infinite' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 0' }}>
        <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { id: 'legghlif', title: 'Legghlífar' },
            { id: 'gripsokkar', title: 'Gripsokkar' },
          ].map(cat => (
            <a key={cat.id} href={`#${cat.id}`} id={cat.id} className="cat-card">
              <div className="cat-img">
                <img src="https://placehold.co/680x320/141414/252525?text=" alt={cat.title} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(184,240,58,0.06) 0%,transparent 55%)', mixBlendMode: 'overlay', zIndex: 2, pointerEvents: 'none' }} />
              </div>
              <div style={{ padding: 28, background: '#101010', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Flokkur</p>
                  <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>{cat.title}</h2>
                </div>
                <span className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0 }}>Sjá vörur →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="vorur" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <p style={{ color: '#b8f03a', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Vörur</p>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem,2.5vw,2.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, color: '#fff' }}>Vinsælar vörur</h2>
          </div>
        </div>
        {products.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Engar vörur fundust — birtu vörur í Sanity Studio.</p>
        ) : (
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {products.map(product => {
              const sel = sizes[product._id];
              return (
                <article key={product._id} className="product-card">
                  <div className="product-img">
                    {product.images?.[0] ? (
                      <Image src={urlFor(product.images[0]).width(380).height(260).url()} alt={product.images[0].alt ?? product.name} fill className="object-cover" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#161616' }} />
                    )}
                    <div className="product-img-tint" />
                  </div>
                  <div className="product-body">
                    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{product.category}</p>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{product.name}</h3>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                      {(['S', 'M', 'L'] as const).map(size => (
                        <button key={size} onClick={() => setSizes(p => ({ ...p, [product._id]: size }))}
                          className={`size-btn${sel === size ? ' active' : ''}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>{product.price.toLocaleString('is-IS')} kr</span>
                      <button className="add-btn" onClick={() => addToCart(product)}>Í körfu</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* UM OKKUR */}
      <section id="um-okkur" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <p style={{ color: '#b8f03a', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Um okkur</p>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem,2.5vw,2.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#fff', marginBottom: 28 }}>Íslenskt. Alvöru.<br/>Fyrir þá sem gefa allt.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'rgba(255,255,255,0.55)', fontSize: '0.9375rem', lineHeight: 1.8 }}>
              <p>Propads er íslenskt fyrirtæki stofnað af fótboltamönnum fyrir fótboltamenn. Við höfnum meðalmáli — öll vara sem ber merkið okkar er hönnuð til að standast þrýsting keppninnar.</p>
              <p>Legghlífarnar okkar veita fulla hlífð án þess að þyngjast. Gripsokkarnar eru hannaðar með anti-slip tækni sem heldur fötunum á réttum stað.</p>
              <p>Við trúum því að íslenskir leikmenn eigi skilið íslenskan stuðning.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[{ val: '100%', label: 'Íslenskt' }, { val: 'S/M/L', label: 'Stærðir' }].map(s => (
                <div key={s.val} style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
                  <p className="font-display" style={{ fontSize: '3rem', fontWeight: 900, color: '#b8f03a', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>{s.val}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
              <p className="font-display" style={{ fontSize: '3rem', fontWeight: 900, color: '#b8f03a', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>Sama dag</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Sending á höfuðborgasvæðinu</p>
            </div>
          </div>
        </div>
      </section>

      {/* UMSAGNIR */}
      <section id="umsagnir" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ color: '#b8f03a', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Umsagnir</p>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem,2.5vw,2.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff' }}>Það sem fólk segir</h2>
        </div>
        <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { text: '"Legghlífarnar eru þær bestu sem ég hef prófað. Léttar, þykkar á réttum stöðum og halda sér á sínum stað á leiktíma."', init: 'S', name: 'Sara Björk', role: 'Leikmaður Breiðabliks' },
            { text: '"Gripsokkarnar eru æðislegar. Fóturinn hreyfist ekki inni í skónum lengur, sem þýðir meiri nákvæmni við blögg og skot."', init: 'K', name: 'Kristján Már', role: 'Leikmaður KR' },
            { text: '"Frábærar vörur á frábæru verði. Sending kom daginn eftir pöntun. Þetta er íslenska gæðin sem við höfðum verið að bíða eftir."', init: 'H', name: 'Hanna Sigríður', role: 'Þjálfari Víkings' },
          ].map((t, i) => (
            <div key={i} className="testimonial-card">
              <div style={{ color: '#b8f03a', fontSize: '1.1rem', letterSpacing: 2 }}>★★★★★</div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem', lineHeight: 1.75, flex: 1 }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(184,240,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#b8f03a', flexShrink: 0 }}>{t.init}</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{t.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ color: '#b8f03a', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>FAQ</p>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem,2.5vw,2.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff' }}>Algengar spurningar</h2>
        </div>
        {[
          { q: 'Hvernig vel ég rétta stærð?', a: 'Legghlífarnar koma í S (fyrir börn 8–12 ára), M (unglinga og létta fullorðna) og L (fullorðna). Gripsokkar: S er skónúmer 34–38, M er 39–42 og L er 43–47.' },
          { q: 'Hversu fljótt fæ ég pöntunina?', a: 'Við sendum alla pöntun samdægurs ef hún berst fyrir kl. 14:00 á virkum degi á höfuðborgasvæðið. Hafðu samband á propadspp@gmail.com ef þú ert utan.' },
          { q: 'Get ég skilað vöru?', a: 'Ónotaðar vörur í upprunalegu ástandi skila sér gegn inneign í búðinni innan 30 daga.' },
          { q: 'Hvernig hef ég samband?', a: 'Sendu okkur tölvupóst á propadspp@gmail.com eða fylgdu okkur á Instagram @propadsiceland.' },
        ].map((item, i) => (
          <details key={i} className="faq-item">
            <summary>{item.q}<span className="faq-arrow">▾</span></summary>
            <p className="faq-body">{item.a}</p>
          </details>
        ))}
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[
            { path: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', title: 'Ókeypis sending', desc: 'Á pantanir yfir 7.000 kr á höfuðborgasvæðinu' },
            { path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: '30 daga skilafrestur', desc: 'Ef þér líkar ekki — skilaðu' },
            { path: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Hraðsending', desc: 'Höfuðborgasvæðið' },
          ].map((item, i) => (
            <div key={i} className={i > 0 ? 'trust-item' : ''} style={{ padding: '36px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ color: '#b8f03a' }}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>{item.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.8125rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HAFA SAMBAND */}
      <section id="hafa-samband" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ color: '#b8f03a', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Samband</p>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem,2.5vw,2.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff' }}>Hafðu samband</h2>
        </div>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem', lineHeight: 1.75, marginBottom: 32 }}>Spurning? Ábending? Samstarf? Sendu okkur línu og við svörum fljótt.</p>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = fd.get('nafn') as string;
              const msg = fd.get('skilabod') as string;
              window.location.href = `mailto:propadspp@gmail.com?subject=${encodeURIComponent('Fyrirspurn frá ' + name)}&body=${encodeURIComponent(msg)}`;
            }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'nafn', label: 'Nafn', type: 'text', placeholder: 'Nafnið þitt' },
                { name: 'netfang', label: 'Netfang', type: 'email', placeholder: 'netfang@dæmi.is' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{f.label}</label>
                  <input name={f.name} type={f.type} required placeholder={f.placeholder} className="form-input" />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Skilaboð</label>
                <textarea name="skilabod" rows={5} required placeholder="Skrifaðu skilaboðin hér..." className="form-input" style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '14px 32px', alignSelf: 'flex-start', border: 'none', cursor: 'pointer' }}>Senda</button>
            </form>
          </div>
          <div>
            <div style={{ background: '#101010', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 24 }}>Tengiliðaupplýsingar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { label: 'Tölvupóstur', value: 'propadspp@gmail.com', href: 'mailto:propadspp@gmail.com' },
                  { label: 'Instagram', value: '@propadsiceland', href: '#' },
                  { label: 'Staðsetning', value: 'Reykjavík, Ísland', href: null },
                ].map(c => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(184,240,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#b8f03a' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{c.label}</p>
                      {c.href ? <a href={c.href} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9375rem' }}>{c.value}</a> : <p style={{ color: '#fff', fontSize: '0.9375rem' }}>{c.value}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 48px' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', display: 'block', marginBottom: 16 }}>PROPADS</span>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', lineHeight: 1.8, maxWidth: 260 }}>Íslensk fótboltavörur. Hannaðar fyrir þá sem gefa 100%.</p>
            </div>
            {[
              { title: 'Vörur', links: [{ href: '#legghlif', label: 'Legghlífar' }, { href: '#gripsokkar', label: 'Gripsokkar' }, { href: '#vorur', label: 'Nýjar vörur' }] },
              { title: 'Fyrirtækið', links: [{ href: '#um-okkur', label: 'Um okkur' }, { href: '#hafa-samband', label: 'Hafðu samband' }, { href: '/skilaregla', label: 'Skilaregla' }] },
              { title: 'Tengiliðir', links: [{ href: 'mailto:propadspp@gmail.com', label: 'propadspp@gmail.com' }, { href: '#', label: '@propadsiceland' }] },
            ].map(col => (
              <div key={col.title}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>{col.title}</h5>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(link => (
                    <li key={link.label}><a href={link.href} className="nav-link">{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.8125rem' }}>© 2026 Propads. Öll réttindi áskilin.</p>
            <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.8125rem' }}>Gert með ♥ á Íslandi</p>
          </div>
        </div>
      </footer>

      {/* CART DRAWER */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />}
      <aside role="dialog" aria-label="Karfa" aria-modal="true" style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 420, maxWidth: '100vw',
        background: '#0c0c0c', borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 201,
        display: 'flex', flexDirection: 'column',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Karfan þín</h2>
          <button onClick={() => setDrawerOpen(false)} aria-label="Loka körfu" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '60px 0', textAlign: 'center' }}>
              <svg width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.18)" strokeWidth="1.4"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9375rem' }}>Karfan þín er tóm</p>
              <button onClick={() => { setDrawerOpen(false); document.getElementById('vorur')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ padding: '10px 24px', background: '#b8f03a', color: '#080808', fontWeight: 600, fontSize: '0.875rem', borderRadius: 12, border: 'none', cursor: 'pointer' }}>Skoða vörur</button>
            </div>
          ) : cart.map(item => (
            <div key={`${item.id}-${item.size}`} style={{ display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff', marginBottom: 3 }}>{item.name}</p>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>{item.category} · Stærð {item.size}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {[-1, 1].map(d => (
                    <button key={d} onClick={() => updateQty(item.id, item.size, d)} style={{ width: 28, height: 28, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d === -1 ? '−' : '+'}</button>
                  ))}
                  <span style={{ minWidth: 22, textAlign: 'center', fontSize: '0.9rem' }}>{item.qty}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                <button onClick={() => removeItem(item.id, item.size)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff' }}>{(item.price * item.qty).toLocaleString('is-IS')} kr</span>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Samtals</span>
              <span className="font-display" style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.025em' }}>{totalPrice.toLocaleString('is-IS')} kr</span>
            </div>
            <button onClick={checkout} disabled={paying} style={{ width: '100%', padding: 14, background: '#b8f03a', color: '#080808', fontWeight: 600, fontSize: '1rem', borderRadius: 12, border: 'none', cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.7 : 1 }}>
              {paying ? 'Hleður...' : 'Klára kaup'}
            </button>
          </div>
        )}
      </aside>

      {/* TOAST */}
      <div role="status" aria-live="polite" style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9000, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: '0.9rem', fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', opacity: toastOn ? 1 : 0, transform: toastOn ? 'translateY(0)' : 'translateY(8px)', pointerEvents: 'none', transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
        {toastMsg}
      </div>
    </>
  );
}
