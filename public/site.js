/* M-zee storefront (hash-routed single page app) */
let S = null, ME = { role: null }, cart = store.get('mz_cart', []), wish = store.get('mz_wish', []);
const app = $('#app'), P = id => S.products.find(p => p.id === id), C = () => S.settings.contact || {};
const show = k => (S.settings.show || {})[k] !== false;
const waNum = () => String(C().whatsapp || '').replace(/\D/g, '');
const IC = { heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/></svg>', wa: '<svg width="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.2.5.2.5.4.1.2.1.8-.2 1.4z"/></svg>' };

/* ---------- boot ---------- */
(async function () {
  app.innerHTML = '<div class="wrap sec"><div class="grid"><div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div></div></div>';
  try { [S, ME] = await Promise.all([api('/api/site'), api('/api/me')]); } catch (e) { app.innerHTML = '<div class="wrap sec center"><h2>Could not load the site</h2><p>' + esc(e.message) + '</p></div>'; return; }
  applyTheme(S.settings.colors); chrome(); window.addEventListener('hashchange', route); route();
  window.addEventListener('scroll', () => { $('#hd').classList.toggle('sc', scrollY > 8); $('#totop').classList.toggle('on', scrollY > 600); }, { passive: true });
  $('#totop').onclick = () => scrollTo({ top: 0, behavior: 'smooth' }); $('#cartb').onclick = openCart; $('#burger').onclick = openMenu;
  $('#ov').onclick = e => { if (e.target.id === 'ov') closeModal(); }; $('#dov').onclick = closeDrawer;
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });
  searchBox();
})();

function chrome() {
  const s = S.settings; document.title = s.name + ' — ' + s.tagline;
  $('#lgm').innerHTML = MARK;
  const links = [['#/', 'Home'], ['#/shop', 'Shop'], ['#/shop?type=course', 'Courses'], ['#/shop?type=lecture', 'Lectures'], ['#/shop?type=notes', 'Notes'], ['#/about', 'About'], ['#/contact', 'Contact']];
  $('#nav').innerHTML = links.map(l => `<a href="${l[0]}">${l[1]}</a>`).join(''); $('#nav').dataset.links = JSON.stringify(links);
  $('#annw').innerHTML = s.announcement && !sessionStorage.getItem('mz_ann') ? `<div class="ann">${esc(s.announcement)}<button aria-label="Close" onclick="sessionStorage.setItem('mz_ann',1);this.parentNode.remove()">✕</button></div>` : '';
  const c = C(); $('#wafab').hidden = !waNum(); $('#wafab').href = waNum() ? 'https://wa.me/' + waNum() : '#/contact'; $('#wafab').target = '_blank';
  const a = $('#acct'); if (ME.role === 'student') { a.textContent = 'My Library'; a.href = '#/library'; } else if (ME.role === 'admin') { a.textContent = 'Admin'; a.href = '/admin'; } else { a.textContent = 'Login'; a.href = '#/login'; }
  badge('#cc', cart.length); badge('#wc', wish.length);
  const qs = (t, v) => `#/shop?type=${t}`;
  $('#ft').innerHTML = `<div class="wrap"><div class="fg"><div><a class="logo" href="#/" style="color:#fff"><span id="lgf">${MARK.replace(/var\(--ink\)/g, '#fff')}</span><span>M<b>-</b>zee</span></a><p style="margin:14px 0;max-width:290px">${esc(s.tagline)} Courses, notes and stationery crafted for Class 8–12 chemistry.</p>${c.instagram ? `<a href="${esc(c.instagram)}" target="_blank" rel="noopener">Instagram</a> ` : ''}${c.youtube ? ` · <a href="${esc(c.youtube)}" target="_blank" rel="noopener">YouTube</a>` : ''}</div>
  <div><h4>Shop</h4><ul>${Object.entries(TYPES).map(([k, t]) => `<li><a href="${qs(k)}">${t.n}</a></li>`).join('')}</ul></div>
  <div><h4>Company</h4><ul><li><a href="#/about">About M-zee</a></li><li><a href="#/contact">Contact</a></li><li><a href="#/login">Student Login</a></li><li><a href="#/library">My Library</a></li></ul></div>
  <div><h4>Reach us</h4><ul>${c.phone ? `<li>📞 <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></li>` : ''}${c.email ? `<li>✉️ <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ''}${c.address ? `<li>📍 ${esc(c.address)}</li>` : ''}${c.hours ? `<li>🕘 ${esc(c.hours)}</li>` : ''}${!c.phone && !c.email && !c.address ? '<li>Send us an enquiry from the Contact page.</li>' : ''}</ul></div></div>
  <div class="fb"><span>© ${new Date().getFullYear()} ${esc(s.name)}. All rights reserved.</span><span>Made for curious chemists ⚗️</span></div></div>`;
}
const badge = (sel, n) => { const e = $(sel); e.textContent = n; e.classList.toggle('on', n > 0); };
const saveCart = () => { store.set('mz_cart', cart); badge('#cc', cart.length); }, saveWish = () => { store.set('mz_wish', wish); badge('#wc', wish.length); };

/* ---------- router ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, ''), [path, qs] = h.split('?'), q = Object.fromEntries(new URLSearchParams(qs || '')), seg = path.split('/');
  closeDrawer(); closeModal();
  const R = { '': home, shop, p: product, about, contact, login, library, wishlist }, fn = R[seg[0]] || home;
  app.innerHTML = ''; const out = fn(seg, q); if (typeof out === 'string') app.innerHTML = out;
  $$('#nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + h || (a.getAttribute('href') === '#/' && h === '')));
  if (!seg[1] || seg[0] !== 'library') scrollTo({ top: 0, behavior: 'instant' }); reveal(); wire();
}
function reveal() { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.dataset.count) count(e.target); } }), { threshold: .12 }); $$('.rv,[data-count]').forEach(e => io.observe(e)); }
function count(el) { const to = +el.dataset.count, suf = el.dataset.s || '', t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = v.toLocaleString('en-IN') + suf; if (k < 1) requestAnimationFrame(f) })(t0); }
function wire() {
  $$('[data-wish]').forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); const id = b.dataset.wish, i = wish.indexOf(id); i > -1 ? wish.splice(i, 1) : wish.push(id); saveWish(); $$(`[data-wish="${id}"]`).forEach(x => x.classList.toggle('on', i < 0)); toast(i < 0 ? 'Saved to wishlist ♥' : 'Removed from wishlist'); });
  $$('[data-add]').forEach(b => b.onclick = () => { const id = b.dataset.add; if (!cart.includes(id)) cart.push(id); saveCart(); toast('Added to your enquiry list'); b.textContent = '✓ Added'; });
  $$('[data-enq]').forEach(b => b.onclick = () => enquire([b.dataset.enq]));
  $$('[data-faq]').forEach(b => b.onclick = () => b.parentNode.classList.toggle('on'));
  $$('[data-chip]').forEach(b => b.onclick = () => { location.hash = '#/shop?cls=' + b.dataset.chip; });
}

/* ---------- cards ---------- */
function card(p) {
  const t = TYPES[p.type] || TYPES.course, d = disc(p);
  return `<article class="card rv"><div class="thumb"><a href="#/p/${p.id}" style="display:block;height:100%">${cover(p)}</a>${p.badge ? `<span class="bdg">${esc(p.badge)}</span>` : ''}<span class="typ">${t.e} ${t.one}</span><button class="heart ${wish.includes(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Wishlist">${IC.heart}</button></div>
  <div class="cb"><span class="cls">${p.classes && p.classes.length ? 'Class ' + p.classes.slice().sort((a, b) => a - b).join(', ') : 'All classes'}</span><h3><a href="#/p/${p.id}">${esc(p.title)}</a></h3><p class="s">${esc(p.short)}</p>
  <div class="pr">${p.price > 0 ? `<b>${money(p.price)}</b>${d ? `<s>${money(p.mrp)}</s><i>${d}% off</i>` : ''}` : '<b style="font-size:16px">Ask for price</b>'}</div>
  <div class="ca"><button class="btn btn-o" data-add="${p.id}">+ List</button><button class="btn btn-a" data-enq="${p.id}">Enquire</button></div></div></article>`;
}
const head = (o, h, l, c = 'center') => `<div class="${c}"><p class="over">${o}</p><h2 class="h2">${h}</h2>${l ? `<p class="lead">${l}</p>` : ''}</div>`;

/* ---------- home ---------- */
function home() {
  const s = S.settings, h = s.hero, feat = S.products.filter(p => p.featured).slice(0, 8), list = feat.length ? feat : S.products.slice(0, 8);
  const title = esc(h.title).replace(/(chemistry|understood|clear)/i, '<em>$1</em>');
  setTimeout(() => { initLab(); initSlider(); }, 0);
  return `<section class="hero"><div class="wrap"><div><p class="over">${esc(h.overline)}</p><h1>${title}</h1><p class="lead">${esc(h.sub)}</p>
  <div class="chips"><span style="align-self:center;font-weight:600;font-size:14px">I study in:</span>${[8, 9, 10, 11, 12].map(c => `<button class="chip" data-chip="${c}">Class ${c}</button>`).join('')}</div>
  <div class="cta"><a class="btn btn-p" href="#/shop">Explore courses →</a><button class="btn btn-o" onclick="demo()">Book a free demo</button></div></div>
  <div class="flask"><svg viewBox="0 0 300 300"><defs><clipPath id="fc"><path d="M118 30h64v85l62 110c9 17-3 38-23 38H79c-20 0-32-21-23-38l62-110z"/></clipPath><linearGradient id="lq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37D6C0"/><stop offset="1" stop-color="#0FB5A0"/></linearGradient></defs>
  <g clip-path="url(#fc)"><g class="wave"><path d="M-20 170q30-14 60 0t60 0 60 0 60 0 60 0 60 0V300H-20z" fill="url(#lq)"/></g>${[[110, 230, 0], [150, 250, .8], [180, 235, 1.6], [135, 215, 2.2], [165, 255, 2.8], [120, 255, 1.2]].map(b => `<circle class="bub" cx="${b[0]}" cy="${b[1]}" r="${5 + b[2] % 3 * 2}" fill="#fff" fill-opacity=".8" style="animation-delay:${b[2]}s"/>`).join('')}</g>
  <path d="M118 30h64v85l62 110c9 17-3 38-23 38H79c-20 0-32-21-23-38l62-110z" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/><path d="M108 30h84" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/></svg>
  <span class="orb float" style="top:6%;left:0">H₂O</span><span class="orb float" style="top:30%;right:-2%;animation-delay:1s">NaCl</span><span class="orb float" style="bottom:12%;left:-4%;animation-delay:2s">C₆H₆</span><span class="orb float" style="bottom:2%;right:6%;animation-delay:.5s">pH 7</span></div></div></section>
  <section class="sec"><div class="wrap">${head('WHAT WE OFFER', 'Everything you need to ace chemistry', 'Pick a category — each one is built to work on its own or together.')}<div class="tiles">${Object.entries(TYPES).map(([k, t]) => `<a class="tile rv" href="#/shop?type=${k}"><div class="ic" style="background:${t.c}22">${t.e}</div><h3>${t.n}</h3><p>${t.d}</p></a>`).join('')}</div></div></section>
  <section class="sec" style="padding-top:0"><div class="wrap">${head('POPULAR RIGHT NOW', 'Students’ favourites', '', 'center')}<div class="grid" style="margin-top:34px">${list.map(card).join('')}</div><div class="center" style="margin-top:34px"><a class="btn btn-p" href="#/shop">View all products</a></div></div></section>
  ${(s.stats || []).length ? `<section class="band sec" style="padding:56px 0"><div class="wrap stats">${s.stats.map(x => `<div><b data-count="${+x.n || 0}" data-s="${esc(x.s || '')}">0</b><span>${esc(x.l)}</span></div>`).join('')}</div></section>` : ''}
  ${show('lab') ? `<section class="sec"><div class="wrap">${head('PLAY WITH CHEMISTRY', 'Your free chemistry lab', 'Explore elements, mix a pH colour and test yourself — right here.')}<div class="tabs" id="labtabs"><button class="tab on" data-t="pt">⚛️ Periodic Table</button><button class="tab" data-t="ph">🧫 pH Lab</button><button class="tab" data-t="qz">🧠 Daily Quiz</button></div><div class="labbox" id="lab"></div></div></section>` : ''}
  ${(s.steps || []).length ? `<section class="sec" style="padding-top:0"><div class="wrap">${head('SIMPLE PROCESS', 'How it works')}<div class="steps">${s.steps.map(x => `<div class="step rv"><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join('')}</div></div></section>` : ''}
  ${show('testimonials') && (s.testimonials || []).length ? `<section class="band sec"><div class="wrap center"><p class="over">LOVED BY STUDENTS</p><h2 class="h2">What our students say</h2><div class="tslide" id="ts"></div><div class="dots" id="td"></div></div></section>` : ''}
  ${show('faq') && (s.faqs || []).length ? `<section class="sec"><div class="wrap">${head('GOT QUESTIONS?', 'Frequently asked')}<div class="faq">${s.faqs.map(f => `<div class="fq rv"><button data-faq>${esc(f.q)}</button><div>${esc(f.a)}</div></div>`).join('')}</div></div></section>` : ''}
  <section class="sec" style="padding-top:0"><div class="wrap"><div class="cta-b rv"><h2 class="h2">Ready to fall in love with chemistry?</h2><p>Try a free demo class — no payment, no pressure.</p><button class="btn" onclick="demo()">Book free demo</button></div></div></section>`;
}
function initSlider() {
  const T = S.settings.testimonials || [], el = $('#ts'); if (!el) return; let i = 0;
  const draw = () => { el.innerHTML = `<p>“${esc(T[i].t)}”</p><small>${esc(T[i].n)} · ${esc(T[i].c)}</small>`; $('#td').innerHTML = T.map((_, k) => `<button class="${k === i ? 'on' : ''}" data-k="${k}" aria-label="Slide ${k + 1}"></button>`).join(''); $$('#td button').forEach(b => b.onclick = () => { i = +b.dataset.k; draw(); }); };
  draw(); const iv = setInterval(() => { if (!document.body.contains(el)) return clearInterval(iv); i = (i + 1) % T.length; draw(); }, 5000);
}

/* ---------- chem lab ---------- */
const ELS = `H|Hydrogen|1.008|nm|Lightest element; powers the Sun and fuel cells.
He|Helium|4.003|ng|Second most abundant element in the universe; fills balloons.
Li|Lithium|6.94|am|Lightest metal; powers phone and EV batteries.
Be|Beryllium|9.012|ae|Light, stiff metal used in aerospace.
B|Boron|10.81|ml|Found in borax and heat-proof glassware.
C|Carbon|12.011|nm|Basis of all life; diamond and graphite are both carbon.
N|Nitrogen|14.007|nm|78% of air; essential for proteins and fertilisers.
O|Oxygen|15.999|nm|We breathe it; makes up 21% of air.
F|Fluorine|18.998|hl|Most electronegative element; in toothpaste as fluoride.
Ne|Neon|20.180|ng|Glows red-orange in signs.
Na|Sodium|22.990|am|Reacts violently with water; part of table salt.
Mg|Magnesium|24.305|ae|Burns with a brilliant white flame.
Al|Aluminium|26.982|pt2|Light, corrosion-resistant metal in cans and planes.
Si|Silicon|28.086|ml|Heart of computer chips and glass.
P|Phosphorus|30.974|nm|In DNA, bones and match heads.
S|Sulfur|32.06|nm|Yellow solid; makes sulfuric acid.
Cl|Chlorine|35.45|hl|Disinfects water; part of table salt.
Ar|Argon|39.948|ng|Inert gas used in light bulbs.
K|Potassium|39.098|am|Vital for nerves; reacts with water explosively.
Ca|Calcium|40.078|ae|Builds bones, teeth and shells.
Sc|Scandium|44.956|tm|Strengthens aluminium alloys.
Ti|Titanium|47.867|tm|Strong, light, biocompatible — used in implants.
V|Vanadium|50.942|tm|Makes steel tough.
Cr|Chromium|51.996|tm|Gives stainless steel its shine.
Mn|Manganese|54.938|tm|Used in steel and dry-cell batteries.
Fe|Iron|55.845|tm|Core of Earth; carries oxygen in blood.
Co|Cobalt|58.933|tm|Gives deep blue colour to glass.
Ni|Nickel|58.693|tm|Used in coins and stainless steel.
Cu|Copper|63.546|tm|Excellent electrical conductor.
Zn|Zinc|65.38|tm|Galvanises iron against rust.
Ga|Gallium|69.723|pt2|Melts in your hand (30 °C).
Ge|Germanium|72.630|ml|Early transistor material.
As|Arsenic|74.922|ml|A famous poison; also a semiconductor dopant.
Se|Selenium|78.971|nm|Trace nutrient used in solar cells.
Br|Bromine|79.904|hl|The only liquid non-metal at room temperature.
Kr|Krypton|83.798|ng|Noble gas used in high-speed photography flashes.`.split('\n').map((l, i) => { const [s, n, m, c, f] = l.split('|'), z = i + 1; const col = z === 1 ? 1 : z === 2 ? 18 : z <= 4 ? z - 2 : z <= 10 ? z + 8 : z <= 12 ? z - 10 : z <= 18 ? z : z - 18; return { s, n, m, c, f, z, col, row: z <= 2 ? 1 : z <= 10 ? 2 : z <= 18 ? 3 : 4 } });
const CATN = { nm: 'Non-metal', ng: 'Noble gas', am: 'Alkali metal', ae: 'Alkaline earth', tm: 'Transition metal', ml: 'Metalloid', pt2: 'Post-transition', hl: 'Halogen' };
const QZ = [['What is the chemical formula of table salt?', ['NaCl', 'KCl', 'NaOH', 'CaCO₃'], 0, 'Sodium chloride — NaCl.'], ['Which gas is most abundant in Earth’s air?', ['Oxygen', 'Nitrogen', 'Argon', 'CO₂'], 1, 'Nitrogen makes up about 78%.'], ['A solution with pH 3 is…', ['Basic', 'Neutral', 'Acidic', 'Salty'], 2, 'pH below 7 is acidic.'], ['The atomic number of Carbon is…', ['4', '6', '8', '12'], 1, 'Carbon has 6 protons.'], ['Which is a noble gas?', ['Chlorine', 'Neon', 'Fluorine', 'Sodium'], 1, 'Neon is in Group 18.'], ['Rusting of iron is an example of…', ['Reduction', 'Neutralisation', 'Oxidation', 'Sublimation'], 2, 'Iron is oxidised by oxygen and water.'], ['Which particle has a negative charge?', ['Proton', 'Neutron', 'Electron', 'Nucleus'], 2, 'Electrons are negative.'], ['Baking soda is chemically…', ['Na₂CO₃', 'NaHCO₃', 'NaOH', 'CaO'], 1, 'Sodium bicarbonate.'], ['Which bond involves sharing of electrons?', ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], 1, 'Covalent bonds share electron pairs.'], ['Avogadro’s number is approximately…', ['6.022×10²³', '3×10⁸', '9.8', '1.6×10⁻¹⁹'], 0, 'Particles in one mole.']];
function initLab() {
  const lab = $('#lab'); if (!lab) return; let tab = 'pt'; $$('#labtabs .tab').forEach(b => b.onclick = () => { $$('#labtabs .tab').forEach(x => x.classList.remove('on')); b.classList.add('on'); tab = b.dataset.t; draw(); });
  const draw = () => ({ pt, ph, qz })[tab]();
  function pt() {
    let f = '', sel = ELS[7];
    lab.innerHTML = `<div class="legend">${Object.entries(CATN).map(([k, v]) => `<button class="${k}" data-c="${k}">${v}</button>`).join('')}</div><div class="ptw"><div class="pt" id="ptg" style="min-width:680px">${ELS.map(e => `<div class="el ${e.c}" data-z="${e.z}" style="grid-column:${e.col};grid-row:${e.row}"><small>${e.z}</small><b>${e.s}</b></div>`).join('')}</div></div><div class="elinfo" id="ei"></div><p style="color:var(--muted);font-size:13px;margin-top:8px">Tap an element. Showing the first 36 elements.</p>`;
    const info = e => { $('#ei').innerHTML = `<div class="big ${e.c}"><small>${e.z}</small><b>${e.s}</b></div><div><h3>${e.n}</h3><p style="color:var(--muted);font-size:14px">Atomic mass ${e.m} · ${CATN[e.c]}</p><p>${e.f}</p></div>`; $$('.el').forEach(x => x.classList.toggle('on', +x.dataset.z === e.z)); };
    $$('.el').forEach(x => { x.onclick = () => info(ELS[x.dataset.z - 1]); x.onmouseenter = () => info(ELS[x.dataset.z - 1]); }); info(sel);
    $$('.legend button').forEach(b => b.onclick = () => { f = f === b.dataset.c ? '' : b.dataset.c; $$('.legend button').forEach(x => x.classList.toggle('on', x.dataset.c === f)); $$('.el').forEach(x => x.classList.toggle('dim', f && !x.classList.contains(f))); });
  }
  function ph() {
    const col = v => { const st = ['#E5282D', '#F26A2E', '#F7A81B', '#F4DC2B', '#B5D334', '#4CB848', '#14A468', '#0FB5A0', '#1D8FCB', '#3F5FB8', '#5B4BA8', '#7B3FA0', '#8E3A98', '#6F2C7F', '#4A1B66']; return st[Math.round(v)]; };
    const ex = v => v < 3 ? 'Stomach acid, lemon juice' : v < 6 ? 'Orange juice, tomato, coffee' : v < 8 ? 'Pure water, milk, blood' : v < 11 ? 'Baking soda, sea water, soap' : 'Bleach, drain cleaner';
    lab.innerHTML = `<div style="max-width:560px;margin:auto;text-align:center"><div class="beaker"><svg viewBox="0 0 130 150"><path id="bk" d="M20 50h90v82a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#0FB5A0"/><path d="M14 18h6v114a14 14 0 0 0 14 14h62a14 14 0 0 0 14-14V18h6" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h3 id="pv" style="font-size:40px;margin-top:8px"></h3><p id="pd" style="color:var(--muted)"></p><div class="phbar"></div><input type="range" id="pr" min="0" max="14" step="1" value="7" aria-label="pH value"><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--muted)"><span>0 Acidic</span><span>7 Neutral</span><span>14 Basic</span></div></div>`;
    const u = () => { const v = +$('#pr').value; $('#bk').setAttribute('fill', col(v)); $('#pv').textContent = 'pH ' + v + ' · ' + (v < 7 ? 'Acid' : v > 7 ? 'Base' : 'Neutral'); $('#pd').textContent = 'Like: ' + ex(v); }; $('#pr').oninput = u; u();
  }
  function qz() {
    const day = Math.floor(Date.now() / 864e5), Q = [0, 1, 2, 3, 4].map(i => QZ[(day * 3 + i * 2) % QZ.length]); let i = 0, sc = 0;
    const q = () => { if (i >= Q.length) { lab.innerHTML = `<div class="center" style="padding:30px"><div style="font-size:60px">${sc >= 4 ? '🏆' : sc >= 2 ? '👏' : '💪'}</div><h3>You scored ${sc} / ${Q.length}</h3><p style="color:var(--muted);margin:8px 0 18px">${sc >= 4 ? 'Brilliant chemist!' : 'Keep practising — our courses can help.'}</p><button class="btn btn-p" id="rq">Try again</button> <a class="btn btn-o" href="#/shop?type=test">Practice tests</a></div>`; $('#rq').onclick = qz; return; }
      const [t, o, a, ex] = Q[i]; lab.innerHTML = `<div style="max-width:600px;margin:auto"><div class="prog"><i style="width:${i / Q.length * 100}%"></i></div><p class="over">QUESTION ${i + 1} OF ${Q.length}</p><h3 style="margin-bottom:12px">${t}</h3>${o.map((x, k) => `<button class="opt" data-k="${k}">${x}</button>`).join('')}<p id="fb" style="margin-top:10px;min-height:24px;font-weight:600"></p></div>`;
      $$('.opt').forEach(b => b.onclick = () => { if ($('.opt.ok')) return; const k = +b.dataset.k; $$('.opt')[a].classList.add('ok'); if (k === a) sc++; else b.classList.add('bad'); $('#fb').textContent = (k === a ? '✅ Correct! ' : '❌ Not quite. ') + ex; setTimeout(() => { i++; q(); }, 1700); });
    }; q();
  }
  draw();
}

/* ---------- shop ---------- */
function shop(seg, q) {
  const st = { type: q.type || '', cls: q.cls || '', q: q.q || '', sort: q.sort || 'rec' };
  const run = () => {
    let l = S.products.filter(p => (!st.type || p.type === st.type) && (!st.cls || (p.classes || []).includes(st.cls) || !(p.classes || []).length) && (!st.q || (p.title + ' ' + p.short + ' ' + p.tag + ' ' + (TYPES[p.type] || {}).n).toLowerCase().includes(st.q.toLowerCase())));
    if (st.sort === 'lo') l.sort((a, b) => a.price - b.price); if (st.sort === 'hi') l.sort((a, b) => b.price - a.price); if (st.sort === 'off') l.sort((a, b) => disc(b) - disc(a));
    $('#sg').innerHTML = l.length ? l.map(card).join('') : `<div class="empty" style="grid-column:1/-1"><div class="em">🧪</div><h3>Nothing matches yet</h3><p>Try clearing a filter — or ask us on WhatsApp.</p></div>`; $('#sc').textContent = l.length + ' item' + (l.length === 1 ? '' : 's');
    history.replaceState(null, '', '#/shop?' + new URLSearchParams(Object.fromEntries(Object.entries(st).filter(([k, v]) => v && v !== 'rec')))); wire(); reveal();
  };
  setTimeout(() => {
    $$('[name=ty]').forEach(r => r.onchange = () => { st.type = r.value; run(); }); $$('[name=cl]').forEach(r => r.onchange = () => { st.cls = r.value; run(); }); $('#ss').onchange = e => { st.sort = e.target.value; run(); };
    $('#sq').oninput = e => { st.q = e.target.value; run(); }; $('#rs').onclick = () => { location.hash = '#/shop'; }; run();
  }, 0);
  const t = TYPES[st.type]; document.title = (t ? t.n : 'Shop') + ' — M-zee';
  return `<div class="wrap sec" style="padding-top:36px"><p class="over">SHOP</p><h1 class="h2">${t ? t.n : 'All products'}</h1><div class="shop"><aside class="filt"><h4>Search</h4><input id="sq" value="${esc(st.q)}" placeholder="Search…" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line)"><h4>Category</h4><label><input type="radio" name="ty" value="" ${!st.type ? 'checked' : ''}> All</label>${Object.entries(TYPES).map(([k, v]) => `<label><input type="radio" name="ty" value="${k}" ${st.type === k ? 'checked' : ''}> ${v.e} ${v.n}</label>`).join('')}<h4>Class</h4><label><input type="radio" name="cl" value="" ${!st.cls ? 'checked' : ''}> All</label>${[8, 9, 10, 11, 12].map(c => `<label><input type="radio" name="cl" value="${c}" ${st.cls == c ? 'checked' : ''}> Class ${c}</label>`).join('')}<button class="btn btn-o btn-sm btn-b" id="rs" style="margin-top:16px">Reset filters</button></aside>
  <div><div class="bar"><b id="sc"></b><select id="ss" aria-label="Sort"><option value="rec">Recommended</option><option value="lo" ${st.sort === 'lo' ? 'selected' : ''}>Price: low to high</option><option value="hi" ${st.sort === 'hi' ? 'selected' : ''}>Price: high to low</option><option value="off" ${st.sort === 'off' ? 'selected' : ''}>Biggest discount</option></select></div><div class="grid" id="sg"></div></div></div></div>`;
}
function wishlist() { const l = S.products.filter(p => wish.includes(p.id)); return `<div class="wrap sec" style="padding-top:36px"><p class="over">YOUR SAVED ITEMS</p><h1 class="h2">Wishlist</h1>${l.length ? `<div class="grid">${l.map(card).join('')}</div>` : '<div class="empty"><div class="em">♡</div><p>Tap the heart on any product to save it here.</p><a class="btn btn-p" style="margin-top:14px" href="#/shop">Browse shop</a></div>'}</div>`; }
function searchBox() {
  const q = $('#q'), sg = $('#sug'); q.oninput = () => { const v = q.value.trim().toLowerCase(); if (!v) return sg.style.display = 'none'; const r = S.products.filter(p => (p.title + p.tag + p.short).toLowerCase().includes(v)).slice(0, 6); sg.innerHTML = r.length ? r.map(p => `<a href="#/p/${p.id}"><span>${TYPES[p.type].e}</span><div>${esc(p.title)}<br><small>${TYPES[p.type].one} · ${money(p.price)}</small></div></a>`).join('') : '<a><small>No match — try “notes” or “class 10”</small></a>'; sg.style.display = 'block'; };
  q.onkeydown = e => { if (e.key === 'Enter') { location.hash = '#/shop?q=' + encodeURIComponent(q.value); sg.style.display = 'none'; } }; document.addEventListener('click', e => { if (!e.target.closest('.sbox')) sg.style.display = 'none'; else if (e.target.closest('.sug a')) { sg.style.display = 'none'; q.value = ''; } });
}

/* ---------- product ---------- */
function product(seg) {
  const p = P(seg[1]); if (!p) return '<div class="wrap sec empty"><div class="em">🔬</div><h2>Product not found</h2><a class="btn btn-p" href="#/shop">Back to shop</a></div>';
  document.title = p.title + ' — M-zee'; const t = TYPES[p.type] || TYPES.course, d = disc(p), owned = ME.role === 'student' && (ME.library || []).includes(p.id);
  const facts = [p.duration && '⏱ ' + p.duration, p.pages && '📄 ' + p.pages, p.lang && p.type !== 'stationery' && p.type !== 'kit' && '🗣 ' + p.lang, p.stock && '📦 ' + p.stock, (p.lectures || []).length && '🎬 ' + p.lectures.length + ' lessons'].filter(Boolean);
  const imgs = p.images && p.images.length ? p.images : [null];
  window.gal = i => { $('#gm').innerHTML = imgs[i] ? `<img src="${esc(imgs[i])}" alt="">` : art(p); $$('#ths>*').forEach((x, k) => x.classList.toggle('on', k === i)); };
  window.pl = i => { const l = p.lectures[i]; if (!l.url) return toast('🔒 Enrol to unlock this lesson'); openModal(`<button class="x" onclick="closeModal()">×</button><h3 style="margin:0 40px 12px 0">${esc(l.title)}</h3><div class="vid">${embed(l.url)}</div>`, true); };
  const rel = S.products.filter(x => x.id !== p.id && (x.type === p.type || (x.classes || []).some(c => (p.classes || []).includes(c)))).slice(0, 4);
  return `<div class="wrap" style="padding-bottom:30px"><p class="crumb"><a href="#/">Home</a> › <a href="#/shop?type=${p.type}">${t.n}</a> › ${esc(p.title)}</p>
  <div class="pd"><div class="gal"><div class="main" id="gm">${imgs[0] ? `<img src="${esc(imgs[0])}" alt="${esc(p.title)}">` : art(p)}</div>${imgs.length > 1 ? `<div class="ths" id="ths">${imgs.map((m, i) => `<div class="${i ? '' : 'on'}" onclick="gal(${i})"><img src="${esc(m)}" alt=""></div>`).join('')}</div>` : '<div id="ths"></div>'}</div>
  <div><span class="cls">${t.e} ${t.one}${p.classes && p.classes.length ? ' · Class ' + p.classes.slice().sort((a, b) => a - b).join(', ') : ''}${p.badge ? ' · ' + esc(p.badge) : ''}</span><h1>${esc(p.title)}</h1><p style="color:var(--muted)">${esc(p.short)}</p>
  <div class="pr" style="margin:16px 0">${p.price > 0 ? `<b>${money(p.price)}</b>${d ? `<s>${money(p.mrp)}</s><i>${d}% off</i>` : ''}` : '<b style="font-size:22px">Ask for price</b>'}</div>
  ${facts.length ? `<div class="facts">${facts.map(f => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
  <div class="pbtns">${owned ? `<a class="btn btn-a" href="#/library/${p.id}">▶ Open in My Library</a>` : `<button class="btn btn-wa" data-enq="${p.id}">${IC.wa} Enquire to buy</button><button class="btn btn-o" data-add="${p.id}">+ Add to list</button>`}<button class="btn btn-o heart-b" data-wish="${p.id}" style="padding:12px 16px">♡ Save</button></div>
  <p style="font-size:13px;color:var(--muted)">💬 Payment is confirmed on WhatsApp. ${p.type === 'course' || p.type === 'lecture' || p.type === 'notes' || p.type === 'test' ? 'After payment it unlocks in your My Library.' : 'Delivery details shared on chat.'}</p></div></div>
  <div class="pd" style="margin-top:34px"><div><h3 style="margin-bottom:10px">About this ${t.one.toLowerCase()}</h3><p style="white-space:pre-line;color:#3C5568">${esc(p.desc)}</p>${(p.highlights || []).length ? `<ul class="ul">${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}</div>
  ${(p.lectures || []).length ? `<div><h3>What’s inside</h3><div class="lec">${p.lectures.map((l, i) => `<a href="javascript:pl(${i})" class="${l.free ? '' : 'lk'}"><span>${l.free ? '▶' : '🔒'}</span>${esc(l.title)}${l.free ? '<em>FREE PREVIEW</em>' : ''}</a>`).join('')}</div></div>` : ''}</div>
  ${rel.length ? `<h3 style="margin:40px 0 16px">You may also like</h3><div class="grid">${rel.map(card).join('')}</div>` : ''}</div>`;
}

/* ---------- enquiry flow (WhatsApp-first, always saved in admin) ---------- */
function enquire(ids, type) {
  const me = store.get('mz_me', {}), items = ids.map(P).filter(Boolean);
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">×</button><p class="over">ENQUIRY</p><h3 style="margin-bottom:6px">${items.length ? 'Enquire about' : 'Talk to us'}</h3>${items.length ? `<div style="margin-bottom:12px">${items.map(p => `<div class="li"><div class="t">${cover(p)}</div><div>${esc(p.title)}<small>${p.price ? money(p.price) : 'Ask for price'}</small></div></div>`).join('')}</div>` : '<p style="color:var(--muted);margin-bottom:12px">Tell us what you need — we’ll reply soon.</p>'}
  <form class="f" id="ef"><div class="r2"><label>Your name<input name="name" required value="${esc(me.name || ME.name || '')}" placeholder="e.g. Aarav"></label><label>Phone / WhatsApp<input name="phone" required value="${esc(me.phone || '')}" placeholder="10-digit number" inputmode="tel"></label></div><div class="r2"><label>Class<select name="cls">${['', 8, 9, 10, 11, 12].map(c => `<option ${me.cls == c ? 'selected' : ''} value="${c}">${c ? 'Class ' + c : 'Select'}</option>`).join('')}</select></label><label>Email (optional)<input name="email" type="email" value="${esc(me.email || '')}"></label></div><label>Message<textarea name="message" rows="2" placeholder="Anything we should know?">${esc(type === 'demo' ? 'I would like to book a free demo class.' : '')}</textarea></label><button class="btn btn-wa btn-b" type="submit">${IC.wa} ${waNum() ? 'Send on WhatsApp' : 'Send enquiry'}</button><p style="font-size:12px;color:var(--muted);text-align:center">Your enquiry is saved with us even if WhatsApp doesn’t open.</p></form>`);
  $('#ef').onsubmit = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); store.set('mz_me', f); const btn = e.target.querySelector('button'); btn.disabled = true;
    try {
      await api('/api/enquiry', 'POST', { ...f, items: items.map(p => p.title + ' (' + (p.price ? money(p.price) : 'ask') + ')'), type: type || 'enquiry' });
      closeModal(); if (!type) { cart = cart.filter(c => !ids.includes(c)); saveCart(); } toast('✅ Enquiry sent! We will contact you shortly.');
      if (waNum()) { const t = (S.settings.waTemplate || 'Hi! I am {name} (Class {cls}). Interested in: {items}').replace('{name}', f.name).replace('{cls}', f.cls || '-').replace('{items}', items.length ? items.map(p => p.title).join(', ') : (type === 'demo' ? 'a free demo class' : 'your courses')); window.open('https://wa.me/' + waNum() + '?text=' + encodeURIComponent(t), '_blank'); }
    } catch (er) { toast(er.message); btn.disabled = false; }
  };
}
window.demo = () => enquire([], 'demo');
function openCart() {
  const l = cart.map(P).filter(Boolean), tot = l.reduce((a, p) => a + (p.price || 0), 0);
  $('#dr').innerHTML = `<header style="position:static"><h3>Enquiry list (${l.length})</h3><button class="x" style="position:static" onclick="closeDrawer()" aria-label="Close">×</button></header><div class="bd">${l.length ? l.map(p => `<div class="li"><div class="t">${cover(p)}</div><div>${esc(p.title)}<small>${TYPES[p.type].one} · ${p.price ? money(p.price) : 'Ask'}</small></div><button onclick="rmCart('${p.id}')" aria-label="Remove" style="font-size:20px;color:var(--muted)">×</button></div>`).join('') : '<div class="empty"><div class="em">🧺</div><p>Your list is empty.<br>Add products and send one enquiry for all.</p></div>'}</div>${l.length ? `<footer><div style="display:flex;justify-content:space-between;margin-bottom:12px"><span>Estimated total</span><b>${money(tot)}</b></div><button class="btn btn-wa btn-b" onclick="enquire(cart)">${IC.wa} Send enquiry</button></footer>` : ''}`;
  $('#dr').classList.add('on'); $('#dov').classList.add('on');
}
window.rmCart = id => { cart = cart.filter(c => c !== id); saveCart(); openCart(); };
function openMenu() { const links = JSON.parse($('#nav').dataset.links); $('#dr').innerHTML = `<header style="position:static"><a class="logo"><span>${MARK}</span><span>M<b>-</b>zee</span></a><button class="x" style="position:static" onclick="closeDrawer()">×</button></header><div class="bd">${links.map(l => `<a href="${l[0]}" style="display:block;padding:14px 4px;font:600 18px var(--head);border-bottom:1px solid var(--line)">${l[1]}</a>`).join('')}<a href="#/wishlist" style="display:block;padding:14px 4px;font:600 18px var(--head)">♡ Wishlist</a></div><footer><button class="btn btn-a btn-b" onclick="demo()">Book free demo</button></footer>`; $('#dr').classList.add('on'); $('#dov').classList.add('on'); }
function closeDrawer() { $('#dr').classList.remove('on'); $('#dov').classList.remove('on'); }
function openModal(h, big) { $('#modal').className = 'modal' + (big ? ' big' : ''); $('#modal').innerHTML = h; $('#ov').classList.add('on'); }
function closeModal() { $('#ov').classList.remove('on'); $('#modal').innerHTML = ''; }

/* ---------- pages ---------- */
function about() { const s = S.settings; return `<div class="wrap sec" style="padding-top:40px;max-width:820px">${head('ABOUT US', 'The story of ' + esc(s.name), '', '')}<p style="white-space:pre-line;font-size:17px;color:#3C5568;margin:18px 0 30px">${esc(s.about)}</p><div class="tiles">${[['🎯', 'Concept first', 'We explain why, not just what.'], ['🧑‍🏫', 'Student friendly', 'Simple language, real examples.'], ['💬', 'Doubt support', 'Ask us on WhatsApp anytime.']].map(x => `<div class="tile rv"><div class="ic" style="background:#E3F4F1">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div><div class="center" style="margin-top:36px"><a class="btn btn-p" href="#/shop">Explore our products</a></div></div>`; }
function contact() {
  const c = C(); setTimeout(() => $('#cf').onsubmit = async e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); try { await api('/api/enquiry', 'POST', { ...f, type: 'contact' }); e.target.reset(); toast('✅ Message sent! We’ll get back to you.'); } catch (er) { toast(er.message); } }, 0);
  const rows = [c.phone && ['📞', 'Call us', `<a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>`], waNum() && ['💬', 'WhatsApp', `<a target="_blank" rel="noopener" href="https://wa.me/${waNum()}">Chat now</a>`], c.email && ['✉️', 'Email', `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`], c.address && ['📍', 'Visit', esc(c.address)], c.hours && ['🕘', 'Hours', esc(c.hours)]].filter(Boolean);
  return `<div class="wrap sec" style="padding-top:40px">${head('GET IN TOUCH', 'We’d love to hear from you', 'Questions about a course, notes or delivery? Send a message.')}<div class="pd" style="margin-top:34px"><div>${rows.length ? rows.map(r => `<div class="li"><div class="t" style="display:grid;place-items:center;font-size:26px;background:#E3F4F1;height:56px;width:56px;border-radius:16px">${r[0]}</div><div>${r[1]}<small style="font-size:15px;color:var(--ink)">${r[2]}</small></div></div>`).join('') : '<p style="color:var(--muted)">Use the form and we’ll contact you.</p>'}</div>
  <form class="f labbox" id="cf"><label>Your name<input name="name" required></label><div class="r2"><label>Phone<input name="phone" required inputmode="tel"></label><label>Class<select name="cls"><option value="">Select</option>${[8, 9, 10, 11, 12].map(c => `<option>${c}</option>`).join('')}</select></label></div><label>Message<textarea name="message" rows="4" required></textarea></label><button class="btn btn-p btn-b">Send message</button></form></div></div>`;
}

/* ---------- student login + My Library ---------- */
function login() {
  if (ME.role === 'student') { location.hash = '#/library'; return ''; }
  let reg = false; const draw = () => { app.innerHTML = `<div class="wrap"><div class="auth"><div class="center"><div style="width:52px;margin:auto">${MARK}</div><h2 style="margin:10px 0 4px">${reg ? 'Create your account' : 'Welcome back'}</h2><p style="color:var(--muted);margin-bottom:18px">${reg ? 'Register to access purchased courses & notes.' : 'Log in to open your My Library.'}</p></div>
  <form class="f" id="af">${reg ? '<label>Full name<input name="name" required></label>' : ''}<label>${reg ? 'Phone number' : 'Phone or email'}<input name="${reg ? 'phone' : 'id'}" required inputmode="tel" autocomplete="username"></label>${reg ? '<label>Class<select name="cls">' + [8, 9, 10, 11, 12].map(c => `<option>${c}</option>`).join('') + '</select></label>' : ''}<label>Password<input name="password" type="password" required minlength="4" autocomplete="${reg ? 'new' : 'current'}-password"></label><button class="btn btn-p btn-b">${reg ? 'Sign up' : 'Log in'}</button></form>
  <p class="center" style="margin-top:16px;font-size:14px">${reg ? 'Have an account?' : 'New here?'} <a href="javascript:void 0" id="sw" style="color:var(--accent);font-weight:600">${reg ? 'Log in' : 'Create account'}</a></p></div></div>`;
    $('#sw').onclick = () => { reg = !reg; draw(); }; $('#af').onsubmit = async e => { e.preventDefault(); try { await api(reg ? '/api/auth/register' : '/api/auth/login', 'POST', Object.fromEntries(new FormData(e.target))); ME = await api('/api/me'); chrome(); toast('Welcome, ' + ME.name + '! 🎉'); location.hash = '#/library'; } catch (er) { toast(er.message); } }; };
  setTimeout(draw, 0); return '';
}
async function library(seg) {
  if (ME.role !== 'student') { location.hash = '#/login'; return ''; }
  app.innerHTML = '<div class="wrap sec"><div class="grid"><div class="skel"></div><div class="skel"></div></div></div>'; let L; try { L = await api('/api/library'); } catch { location.hash = '#/login'; return ''; }
  document.title = 'My Library — M-zee';
  if (seg[1]) { const it = L.find(x => x.id === seg[1]); if (it) return viewItem(it, L); }
  app.innerHTML = `<div class="wrap sec" style="padding-top:36px"><div class="bar"><div><p class="over">MY LIBRARY</p><h1 class="h2" style="margin:0">Hi ${esc(ME.name.split(' ')[0])} 👋</h1></div><button class="btn btn-o btn-sm" id="lo">Log out</button></div>${L.length ? `<div class="grid">${L.map(x => { const t = TYPES[x.type] || TYPES.course; return `<article class="card rv in"><a class="thumb" href="#/library/${x.id}">${cover(x)}<span class="typ">${t.e} ${t.one}</span></a><div class="cb"><h3>${esc(x.title)}</h3><p class="s">${x.lectures.length ? x.lectures.length + ' lessons' : ''}${x.hasFile ? ' 📄 Download available' : ''}</p><a class="btn btn-a" href="#/library/${x.id}">${x.lectures.length ? '▶ Start learning' : 'Open'}</a></div></article>`; }).join('')}</div>` : `<div class="empty"><div class="em">📚</div><h3>Your library is empty</h3><p>After you buy something on WhatsApp, we unlock it here within minutes.</p><a class="btn btn-p" style="margin-top:14px" href="#/shop">Browse products</a></div>`}</div>`;
  $('#lo').onclick = async () => { await api('/api/auth/logout', 'POST'); ME = { role: null }; chrome(); toast('Logged out'); location.hash = '#/'; }; reveal(); wire();
}
function viewItem(it, L) {
  const t = TYPES[it.type] || TYPES.course; let i = 0;
  app.innerHTML = `<div class="wrap sec" style="padding-top:28px"><p class="crumb" style="margin:0 0 10px"><a href="#/library">← My Library</a></p><h1 class="h2">${esc(it.title)}</h1>${it.hasFile ? `<a class="btn btn-p" href="/download/${it.id}" target="_blank" rel="noopener" style="margin-bottom:14px">📄 Open / Download ${t.one}</a>` : ''}${it.lectures.length ? `<div class="player"><div><div class="vid" id="vd"></div><h3 id="vt" style="margin-top:12px"></h3></div><div class="plist" id="pl"></div></div>` : (it.hasFile ? '' : '<p style="color:var(--muted)">Content for this item is being added. Check back soon.</p>')}</div>`;
  if (!it.lectures.length) return; const play = n => { i = n; $('#vd').innerHTML = embed(it.lectures[n].url); $('#vt').textContent = it.lectures[n].title; $$('#pl button').forEach((b, k) => b.classList.toggle('on', k === n)); };
  $('#pl').innerHTML = it.lectures.map((l, k) => `<button><span>▶</span>${esc(l.title)}</button>`).join(''); $$('#pl button').forEach((b, k) => b.onclick = () => play(k)); play(0);
}
