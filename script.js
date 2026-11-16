/* =========================================================
   Undangan Metatah - script.js
   ========================================================= */
/* =========================================================
   ATUR ISI UNDANGAN DI SINI
   Ganti teks di bawah. Untuk foto, isi alamat (URL) file foto
   kamu, misalnya "foto/cover.jpg". Biarkan "" untuk kotak kosong.
   ========================================================= */
const CONFIG = {
  modeTamu:     true,                          // true = versi untuk tamu: foto tidak bisa diklik/diganti
  judulAcara:   "Metatah Nama Panggilan",
  jenisAcara:   "Metatah",
  namaPanggilan:"Nama Panggilan",
  namaLengkap:  "Nama Lengkap Anak",
  sebutan:      "putri",                       // putri / putra
  urutanAnak:   "Merupakan Putri Pertama dari Pasangan",
  namaAyah:     "Nama Ayah",
  namaIbu:      "Nama Ibu",
  namaSesi:     "RESEPSI",
  hariTanggal:  "SABTU, 1 MEI 2027",
  jam:          "14.00 WITA – SELESAI",
  waktuAcara:   "2027-05-01T14:00:00+08:00",   // untuk hitung mundur (WITA = +08:00)
  alamat:       "Nama Banjar, Desa, Kecamatan",
  linkMaps:     "https://maps.google.com",
  vendor:       "Nama Fotografer",
  kontakVendor: "08xx xxxx xxxx",
  musik:        "",                            // contoh: "musik/lagu.mp3"
  foto: {
    cover:"", hero:"", profil:"", acara:"", penutup:"",
    galeri:[   // 40 foto (10 per baris di bawah); tambah/kurangi sesuai jumlah foto
      "","","","","","","","","","",
      "","","","","","","","","","",
      "","","","","","","","","","",
      "","","","","","","","","",""
    ]
  }
};
/* ========================================================= */

const $ = s => document.querySelector(s);
const store = {get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

// Teks
document.querySelectorAll("[data-text]").forEach(el => { el.textContent = CONFIG[el.dataset.text] ?? ""; });
$("#maps").href = CONFIG.linkMaps;

// Nama tamu dari ?to=Nama atau #Nama
(() => {
  let n = new URLSearchParams(location.search).get("to");
  if (!n && location.hash.length > 1) n = decodeURIComponent(location.hash.slice(1)).replace(/[-_+]/g," ");
  if (n) $("#guest").textContent = n;
})();

// Galeri
const grid = $("#grid");
CONFIG.foto.galeri.forEach((src,i) => {
  const d = document.createElement("div");
  d.className = "ph"; d.dataset.slot = "galeri-" + i; d.dataset.label = "Galeri " + (i+1);
  d.setAttribute("role","button"); d.tabIndex = 0;
  grid.appendChild(d);
});

// Placeholder foto: isi dari CONFIG, atau ketuk untuk mencoba foto sendiri
const camSvg = '<svg><use href="#i-cam"/></svg>';
function fill(el, src){ el.style.backgroundImage = 'url("'+src+'")'; el.classList.add("filled"); }
const TAMU = !!CONFIG.modeTamu;
if (TAMU) document.body.classList.add("tamu");
document.querySelectorAll(".ph").forEach(el => {
  if (TAMU) { el.removeAttribute("role"); el.removeAttribute("tabindex"); }
  else el.insertAdjacentHTML("beforeend", '<div class="ph-hint">'+camSvg+'<span>'+el.dataset.label+'</span></div>');
  const slot = el.dataset.slot;
  const src = slot.startsWith("galeri-") ? CONFIG.foto.galeri[+slot.split("-")[1]] : CONFIG.foto[slot];
  if (src) fill(el, src);
});
let target = null;
const picker = $("#picker");
if (TAMU) picker.remove();
else {
  const choose = el => { target = el; picker.value = ""; picker.click(); };
  document.addEventListener("click", e => { const el = e.target.closest(".ph"); if (el) choose(el); });
  document.addEventListener("keydown", e => { const el = e.target.closest && e.target.closest(".ph"); if (el && (e.key==="Enter"||e.key===" ")) { e.preventDefault(); choose(el); } });
  picker.addEventListener("change", () => {
    const f = picker.files[0]; if (!f || !target) return;
    const r = new FileReader(); r.onload = () => fill(target, r.result); r.readAsDataURL(f);
  });
}

// Buka undangan + musik
const audio = $("#audio"), mBtn = $("#music");
document.body.classList.add("locked");
$("#btnOpen").addEventListener("click", () => {
  $("#cover").classList.add("open");
  document.body.classList.remove("locked");
  document.body.classList.add("opened");
  if (!TAMU) { const tip = $("#tip"); tip.classList.remove("hide"); setTimeout(()=>tip.classList.add("hide"), 4500); }
  if (CONFIG.musik) {
    audio.src = CONFIG.musik; mBtn.hidden = false;
    audio.play().then(()=>mBtn.classList.add("spin")).catch(()=>setIcon(false));
  }
});
function setIcon(playing){ mBtn.querySelector("use").setAttribute("href", playing ? "#i-pause" : "#i-play"); mBtn.classList.toggle("spin", playing); }
mBtn.addEventListener("click", () => { if (audio.paused) { audio.play().then(()=>setIcon(true)).catch(()=>{}); } else { audio.pause(); setIcon(false); } });

// Hitung mundur
const target0 = new Date(CONFIG.waktuAcara).getTime();
const pad2 = n => String(n).padStart(2,"0");
function tick(){
  let s = Math.max(0, Math.floor((target0 - Date.now())/1000));
  $("#cd-d").textContent = pad2(Math.floor(s/86400)); s%=86400;
  $("#cd-h").textContent = pad2(Math.floor(s/3600)); s%=3600;
  $("#cd-m").textContent = pad2(Math.floor(s/60));
  $("#cd-s").textContent = pad2(s%60);
}
tick(); setInterval(tick, 1000);

// Ucapan (contoh + yang dikirim dari perangkat ini)
const examples = TAMU ? [] : [
  {n:"Contoh Tamu", a:"Hadir", m:"Rahajeng untu anyar, semoga acaranya berjalan lancar.", ex:true},
  {n:"Contoh Teman", a:"Tidak Hadir", m:"Selamat metatah! Mohon maaf belum bisa hadir, doa terbaik untuk keluarga.", ex:true}
];
const list = $("#wishList");
function render(){
  const mine = store.get("ucapan") || [];
  list.innerHTML = "";
  [...mine, ...examples].forEach(w => {
    const row = document.createElement("div"); row.className = "wish";
    const av = document.createElement("div"); av.className = "avatar"; av.textContent = (w.n.trim()[0]||"?").toUpperCase();
    const b = document.createElement("div"); b.className = "bubble";
    const who = document.createElement("div"); who.className = "who"; who.textContent = w.n;
    const badge = document.createElement("span"); badge.className = "badge" + (w.a==="Tidak Hadir" ? " no" : ""); badge.textContent = w.a;
    who.appendChild(badge);
    if (w.ex) { const e = document.createElement("span"); e.className = "badge ex"; e.textContent = "contoh"; who.appendChild(e); }
    const p = document.createElement("p"); p.textContent = w.m;
    b.append(who, p); row.append(av, b); list.appendChild(row);
  });
}
render();
$("#wishForm").addEventListener("submit", e => {
  e.preventDefault();
  const n = $("#w-name").value.trim(), m = $("#w-msg").value.trim(), a = $("#w-att").value;
  const st = $("#wishStatus");
  if (!n || !m || !a) { st.textContent = "Isi nama, pesan, dan konfirmasi kehadiran dulu."; return; }
  const mine = store.get("ucapan") || []; mine.unshift({n, m, a}); store.set("ucapan", mine);
  e.target.reset(); st.textContent = "Ucapan terkirim. Terima kasih!"; render();
});
