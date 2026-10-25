/* shared by storefront + admin */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TYPES = {
  course: { n: 'Courses', one: 'Course', e: '🎓', c: '#0FB5A0', c2: '#0A6F8F', d: 'Full video batches with tests & support' },
  lecture: { n: 'Recorded Lectures', one: 'Recorded Lecture', e: '🎬', c: '#6C5CE7', c2: '#3B2F9E', d: 'Watch any topic, any time' },
  notes: { n: 'Notes', one: 'Notes', e: '📒', c: '#F5A623', c2: '#D9600F', d: 'Neat, exam-focused PDFs' },
  test: { n: 'Test Series', one: 'Test Series', e: '📝', c: '#E5484D', c2: '#A3243B', d: 'Practice papers with solutions' },
  stationery: { n: 'Stationery', one: 'Stationery', e: '✏️', c: '#2D9CDB', c2: '#1B5E9E', d: 'Notebooks, posters & more' },
  kit: { n: 'Lab & Kits', one: 'Lab Kit', e: '🧪', c: '#27AE60', c2: '#1B7A43', d: 'Models and experiment kits' }
};
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const disc = p => p.mrp > p.price && p.price > 0 ? Math.round((1 - p.price / p.mrp) * 100) : 0;
async function api(url, method = 'GET', body) {
  const r = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Something went wrong'); return j;
}
const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { } } };
/* auto-generated cover art when no photo is uploaded */
function art(p) {
  const t = TYPES[p.type] || TYPES.course, id = 'g' + String(p.id || Math.random()).replace(/\W/g, '');
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.c}"/><stop offset="1" stop-color="${t.c2}"/></linearGradient></defs><rect width="400" height="300" fill="url(#${id})"/><g fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2"><path d="M300 40l40 23v46l-40 23-40-23V63z"/><path d="M340 120l30 17v35l-30 17-30-17v-35z"/><path d="M60 190l30 17v35l-30 17-30-17v-35z"/></g><circle cx="320" cy="250" r="60" fill="#fff" fill-opacity=".07"/><text x="36" y="150" font-size="76">${t.e}</text><text x="36" y="205" fill="#fff" font-family="Sora,sans-serif" font-weight="700" font-size="21">${esc((p.title || '').slice(0, 26))}</text><text x="36" y="232" fill="#fff" fill-opacity=".8" font-family="Sora,sans-serif" font-size="14">${esc(t.one)}${p.classes && p.classes.length ? ' · Class ' + esc(p.classes.slice().sort((a, b) => a - b).join(', ')) : ''}</text></svg>`;
}
const cover = p => (p.images && p.images[0]) ? `<img src="${esc(p.images[0])}" alt="${esc(p.title)}" loading="lazy">` : art(p);
function embed(url) {
  if (!url) return '<div style="color:#fff;display:grid;place-items:center;height:100%;padding:20px;text-align:center">Video link not added yet — coming soon.</div>';
  let m;
  if ((m = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(url))) return `<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1" allow="accelerometer;autoplay;encrypted-media;picture-in-picture;fullscreen" allowfullscreen></iframe>`;
  if ((m = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url))) return `<iframe src="https://player.vimeo.com/video/${m[1]}" allow="autoplay;fullscreen" allowfullscreen></iframe>`;
  if ((m = /drive\.google\.com\/file\/d\/([^/?]+)/.exec(url))) return `<iframe src="https://drive.google.com/file/d/${m[1]}/preview" allowfullscreen></iframe>`;
  if (/^\/media\/|\.(mp4|webm|ogg)(\?|$)/i.test(url)) return `<video controls controlsList="nodownload" playsinline src="${esc(url)}"></video>`;
  return `<iframe src="${esc(url)}" allowfullscreen></iframe>`;
}
let _tt; function toast(msg) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); } t.textContent = msg; t.classList.add('on'); clearTimeout(_tt); _tt = setTimeout(() => t.classList.remove('on'), 2800); }
function applyTheme(c) { if (!c) return; const r = document.documentElement.style; if (c.ink) r.setProperty('--ink', c.ink); if (c.accent) r.setProperty('--accent', c.accent); if (c.warm) r.setProperty('--warm', c.warm); }
const MARK = '<svg viewBox="0 0 48 48" fill="none"><path d="M24 3.5 42 14v20L24 44.5 6 34V14z" stroke="var(--ink)" stroke-width="2.4" stroke-linejoin="round"/><path d="M15.5 31.5v-14L24 27l8.5-9.5v14" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="42" cy="14" r="3.4" fill="var(--warm)"/></svg>';
