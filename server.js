/* M-zee — chemistry education store + admin. Zero dependencies: `node server.js` */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const UP = path.join(DATA, 'uploads'), PRIV = path.join(DATA, 'private'), DBF = path.join(DATA, 'db.json');
[DATA, UP, PRIV].forEach(d => fs.mkdirSync(d, { recursive: true }));
const PUB = path.join(__dirname, 'public');
const hash = (p, s) => crypto.scryptSync(p, s, 32).toString('hex');
const uid = (n = 6) => crypto.randomBytes(n).toString('hex');

/* ---------- database (single JSON file, atomic save) ---------- */
let db; let timer;
function save(now) {
  const w = () => { fs.writeFileSync(DBF + '.tmp', JSON.stringify(db)); fs.renameSync(DBF + '.tmp', DBF); };
  clearTimeout(timer); now ? w() : timer = setTimeout(w, 200);
}
function load() {
  if (fs.existsSync(DBF)) db = JSON.parse(fs.readFileSync(DBF, 'utf8'));
  else { db = require('./seed')(); const salt = uid(8); db.admin = { user: 'admin', salt, hash: hash('mzee123', salt) }; save(true); }
}
load();

/* ---------- helpers ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon', '.json': 'application/json' };
const send = (res, code, body, type = 'application/json', extra = {}) => { res.writeHead(code, { 'Content-Type': type, ...extra }); res.end(type === 'application/json' ? JSON.stringify(body) : body); };
const readBody = (req, max = 2e6) => new Promise((ok, no) => { let b = '', n = 0; req.on('data', c => { n += c.length; if (n > max) { no(new Error('Too large')); req.destroy(); } else b += c; }); req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch { no(new Error('Bad JSON')); } }); });
const cookie = req => Object.fromEntries((req.headers.cookie || '').split(';').map(s => s.trim().split('=')).filter(a => a[0]).map(a => [a[0], a[1]]));
function who(req) { const t = cookie(req).mz; const s = t && db.sessions[t]; if (!s) return null; if (s.exp < Date.now()) { delete db.sessions[t]; return null; } return s; }
function login(res, role, id) { const t = uid(24); db.sessions[t] = { role, id, exp: Date.now() + 30 * 864e5 }; save(); res.setHeader('Set-Cookie', `mz=${t}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${30 * 86400}`); }
const clean = (s, n = 500) => String(s == null ? '' : s).slice(0, n);
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9@.]/g, '');

/* what the public may see: never private file names or paid lecture links */
function pubProduct(p) {
  const { fileName, fileLink, ...r } = p;
  r.hasFile = !!(fileName || fileLink);
  r.lectures = (p.lectures || []).map(l => ({ title: l.title, free: !!l.free, url: l.free ? (l.url && !l.url.startsWith('private:') ? l.url : '/media/' + p.id + '/' + (p.lectures.indexOf(l))) : '' }));
  return r;
}
const publicSite = () => ({ settings: db.settings, products: db.products.filter(p => p.status !== 'draft').map(pubProduct) });
const canAccess = (s, pid) => s && s.role === 'student' && (db.students.find(x => x.id === s.id) || { library: [] }).library.includes(pid);

function stream(req, res, file, type) {
  if (!fs.existsSync(file)) return send(res, 404, { error: 'Not found' });
  const size = fs.statSync(file).size, r = req.headers.range;
  if (r) {
    const m = /bytes=(\d*)-(\d*)/.exec(r); let a = m[1] ? +m[1] : 0, b = m[2] ? +m[2] : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1 });
    fs.createReadStream(file, { start: a, end: b }).pipe(res);
  } else { res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' }); fs.createReadStream(file).pipe(res); }
}

/* ---------- API ---------- */
async function api(req, res, u) {
  const p = u.pathname, m = req.method, s = who(req);
  if (p === '/api/site' && m === 'GET') return send(res, 200, publicSite());
  if (p === '/api/enquiry' && m === 'POST') {
    const b = await readBody(req);
    if (!clean(b.name) || !clean(b.phone)) return send(res, 400, { error: 'Name and phone are required.' });
    db.enquiries.unshift({ id: uid(4), name: clean(b.name, 80), phone: clean(b.phone, 30), email: clean(b.email, 80), cls: clean(b.cls, 20), message: clean(b.message, 1500), items: (b.items || []).slice(0, 30).map(x => clean(x, 120)), type: clean(b.type, 20) || 'enquiry', status: 'New', note: '', at: new Date().toISOString() });
    save(); return send(res, 200, { ok: true });
  }
  if (p === '/api/auth/register' && m === 'POST') {
    const b = await readBody(req), id = norm(b.phone);
    if (!clean(b.name) || id.length < 6 || String(b.password || '').length < 4) return send(res, 400, { error: 'Enter name, phone/email and a password of 4+ characters.' });
    if (db.students.find(x => x.login === id)) return send(res, 400, { error: 'This phone/email is already registered. Please log in.' });
    const salt = uid(8), st = { id: uid(4), name: clean(b.name, 80), login: id, phone: clean(b.phone, 40), cls: clean(b.cls, 20), salt, hash: hash(String(b.password), salt), library: [], at: new Date().toISOString() };
    db.students.push(st); login(res, 'student', st.id); save(); return send(res, 200, { ok: true });
  }
  if (p === '/api/auth/login' && m === 'POST') {
    const b = await readBody(req);
    if (b.admin) {
      const a = db.admin; if (a.user === clean(b.id, 40) && a.hash === hash(String(b.password || ''), a.salt)) { login(res, 'admin', 'admin'); return send(res, 200, { ok: true }); }
      return send(res, 401, { error: 'Wrong username or password.' });
    }
    const st = db.students.find(x => x.login === norm(b.id));
    if (st && st.hash === hash(String(b.password || ''), st.salt)) { login(res, 'student', st.id); return send(res, 200, { ok: true }); }
    return send(res, 401, { error: 'Wrong phone/email or password.' });
  }
  if (p === '/api/auth/logout') { const t = cookie(req).mz; delete db.sessions[t]; save(); res.setHeader('Set-Cookie', 'mz=; Path=/; Max-Age=0'); return send(res, 200, { ok: true }); }
  if (p === '/api/me') { if (!s) return send(res, 200, { role: null }); if (s.role === 'admin') return send(res, 200, { role: 'admin' }); const st = db.students.find(x => x.id === s.id); return send(res, 200, st ? { role: 'student', name: st.name, cls: st.cls, library: st.library } : { role: null }); }
  if (p === '/api/library') {
    if (!s || s.role !== 'student') return send(res, 401, { error: 'Please log in.' });
    const st = db.students.find(x => x.id === s.id);
    return send(res, 200, st.library.map(id => db.products.find(x => x.id === id)).filter(Boolean).map(x => ({ id: x.id, type: x.type, title: x.title, images: x.images, hasFile: !!(x.fileName || x.fileLink), lectures: (x.lectures || []).map((l, i) => ({ title: l.title, url: l.url && !l.url.startsWith('private:') ? l.url : '/media/' + x.id + '/' + i })) })));
  }
  /* ----- admin only ----- */
  if (!p.startsWith('/api/admin')) return send(res, 404, { error: 'Not found' });
  if (!s || s.role !== 'admin') return send(res, 401, { error: 'Admin login required.' });
  if (p === '/api/admin/all') { const { admin, sessions, ...rest } = db; rest.students = db.students.map(({ salt, hash, ...x }) => x); return send(res, 200, rest); }
  if (p === '/api/admin/settings' && m === 'PUT') { db.settings = { ...db.settings, ...(await readBody(req, 5e6)) }; save(); return send(res, 200, { ok: true }); }
  if (p === '/api/admin/password' && m === 'POST') {
    const b = await readBody(req), a = db.admin;
    if (a.hash !== hash(String(b.current || ''), a.salt)) return send(res, 400, { error: 'Current password is wrong.' });
    if (String(b.password || '').length < 6) return send(res, 400, { error: 'New password needs 6+ characters.' });
    a.salt = uid(8); a.hash = hash(b.password, a.salt); if (b.user) a.user = clean(b.user, 40); save(); return send(res, 200, { ok: true });
  }
  if (p === '/api/admin/upload' && m === 'POST') {
    const priv = u.searchParams.get('private') === '1', ext = path.extname(u.searchParams.get('name') || '').toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 8);
    const fn = uid(8) + ext; const ws = fs.createWriteStream(path.join(priv ? PRIV : UP, fn));
    req.pipe(ws); await new Promise(r => ws.on('finish', r));
    return send(res, 200, { name: fn, url: priv ? 'private:' + fn : '/uploads/' + fn });
  }
  if (p === '/api/admin/backup') return send(res, 200, JSON.stringify(db), 'application/json', { 'Content-Disposition': 'attachment; filename="mzee-backup.json"' });
  if (p === '/api/admin/clear-demo' && m === 'POST') { db.products = db.products.filter(x => !x.demo); db.students = db.students.filter(x => !x.demo); db.enquiries = db.enquiries.filter(x => !x.demo); save(); return send(res, 200, { ok: true }); }
  const mm = /^\/api\/admin\/(products|students|enquiries)(?:\/(\w+))?$/.exec(p);
  if (mm) {
    const col = db[mm[1]];
    if (m === 'DELETE') { const i = col.findIndex(x => x.id === mm[2]); if (i > -1) col.splice(i, 1); if (mm[1] === 'products') db.students.forEach(st => st.library = st.library.filter(x => x !== mm[2])); save(); return send(res, 200, { ok: true }); }
    if (m === 'POST') {
      const b = await readBody(req, 5e6); let it = col.find(x => x.id === b.id);
      if (!it) { it = { id: uid(4), at: new Date().toISOString() }; col.unshift(it); }
      if (mm[1] === 'students') {
        const { password, ...rest } = b; Object.assign(it, rest, { id: it.id, login: norm(b.phone || it.login), library: b.library || it.library || [] });
        if (password) { it.salt = uid(8); it.hash = hash(String(password), it.salt); } if (!it.salt) { it.salt = uid(8); it.hash = hash(uid(4), it.salt); }
        if (db.students.some(x => x !== it && x.login === it.login)) { col.splice(col.indexOf(it), 1); return send(res, 400, { error: 'A student with this phone/email already exists.' }); }
      } else Object.assign(it, b, { id: it.id });
      save(); return send(res, 200, { ok: true, id: it.id });
    }
  }
  return send(res, 404, { error: 'Not found' });
}

/* ---------- server ---------- */
http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x'); let p = decodeURIComponent(u.pathname);
    if (p.startsWith('/api/')) return await api(req, res, u);
    let m;
    if ((m = /^\/media\/(\w+)\/(\d+)$/.exec(p))) {            // protected lecture video
      const pr = db.products.find(x => x.id === m[1]), l = pr && (pr.lectures || [])[+m[2]], s = who(req);
      if (!l || !l.url.startsWith('private:')) return send(res, 404, { error: 'Not found' });
      if (!(l.free || canAccess(s, pr.id) || (s && s.role === 'admin'))) return send(res, 403, { error: 'Not in your library' });
      const f = path.join(PRIV, path.basename(l.url.slice(8))); return stream(req, res, f, MIME[path.extname(f)] || 'application/octet-stream');
    }
    if ((m = /^\/download\/(\w+)$/.exec(p))) {                // protected notes
      const pr = db.products.find(x => x.id === m[1]), s = who(req);
      if (!pr || !(canAccess(s, pr.id) || (s && s.role === 'admin'))) return send(res, 403, '<p>Please log in to My Library to download.</p>', 'text/html');
      if (pr.fileLink) { res.writeHead(302, { Location: pr.fileLink }); return res.end(); }
      const f = path.join(PRIV, path.basename(pr.fileName || '')); res.setHeader('Content-Disposition', `inline; filename="${pr.title.replace(/[^\w ]/g, '')}${path.extname(f)}"`);
      return stream(req, res, f, MIME[path.extname(f)] || 'application/octet-stream');
    }
    if (p.startsWith('/uploads/')) return stream(req, res, path.join(UP, path.basename(p)), MIME[path.extname(p)] || 'application/octet-stream');
    if (p === '/admin' || p === '/admin/') p = '/admin.html'; else if (p === '/') p = '/index.html';
    const f = path.join(PUB, path.normalize(p).replace(/^(\.\.[\/\\])+/, ''));
    if (f.startsWith(PUB) && fs.existsSync(f) && fs.statSync(f).isFile()) return stream(req, res, f, MIME[path.extname(f)] || 'application/octet-stream');
    send(res, 404, '<h1>404</h1><a href="/">Back to M-zee</a>', 'text/html');
  } catch (e) { send(res, 500, { error: e.message }); }
}).listen(process.env.PORT || 3000, () => console.log('\n  M-zee is running →  http://localhost:' + (process.env.PORT || 3000) + '\n  Admin panel      →  /admin   (user: admin · password: mzee123)\n'));
process.on('SIGINT', () => { save(true); process.exit(); }); process.on('SIGTERM', () => { save(true); process.exit(); });
