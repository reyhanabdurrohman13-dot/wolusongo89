/* ============================================================
   FUTURISTIC PRODUK UI (by 89 Wolusongo Barokah)
   ------------------------------------------------------------
   ✨ Tema: Biru-Hitam Metalik Futuristik
   ✨ Fitur: Filter, Sort, Search, Favorit, Modal, Dark Mode, WA Buy
   ✨ Nomor WA default: 6282337822107
   ============================================================ */
(() => {

    const WA_NUMBER = '6282337822107';

    /* ---------- Utility DOM ---------- */
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);
    const el = (tag, props = {}, children = []) => {
        const e = document.createElement(tag);
        for (const [k, v] of Object.entries(props)) {
            if (k === 'class') e.className = v;
            else if (k === 'html') e.innerHTML = v;
            else if (k === 'text') e.textContent = v;
            else e.setAttribute(k, v);
        }
        children.forEach(c => e.append(c));
        return e;
    };

    /* ---------- Header Menu Auto Inject ---------- */
    const nav = $('header nav ul');
    if (nav && nav.children.length === 0) {
        const menu = [
            { t: 'Beranda', h: 'index.html' },
            { t: 'Katalog', h: '#katalog' },
            { t: 'Tentang', h: '#tentang' },
            { t: 'Alamat', h: '#alamat' },
            { t: 'Kontak', h: '#contact' }
        ];
        menu.forEach(m => {
            nav.append(el('li', {}, [
                el('a', { href: m.h, text: m.t })
            ]));
        });

        // Dark mode toggle
        const darkBtn = el('button', { class: 'nav-btn', text: '🌗' });
        darkBtn.title = 'Toggle Dark Mode';
        darkBtn.onclick = () => {
            document.documentElement.classList.toggle('dark');
            toast(document.documentElement.classList.contains('dark') ? '🌙 Dark mode aktif' : '☀️ Light mode aktif');
        };
        nav.append(el('li', {}, [darkBtn]));
    }

    /* ---------- Wrapper ---------- */
    const section = $('#katalog') || document.body;
    const wrap = el('div', { id: 'produk-ui-wrapper' });
    section.append(wrap);

    /* ---------- Controls ---------- */
    const controls = el('div', { class: 'prod-controls' });
    const categories = ['Semua', 'Propolis', 'Isi Pulsa', 'Token Listrik', 'Transfer', 'Percetakan'];
    const tabs = el('div', { class: 'prod-tabs' }, categories.map(c => el('button', { class: 'tab-btn' + (c === 'Semua' ? ' active' : ''), text: c, 'data-cat': c })));
    const search = el('input', { type: 'search', placeholder: 'Cari produk... (K)', class: 'prod-search' });
    const sort = el('select', { class: 'prod-sort', html: `
        <option value="">Urutkan</option>
        <option value="harga-asc">Harga ↑</option>
        <option value="harga-desc">Harga ↓</option>
        <option value="nama">Nama A–Z</option>` });
    const viewBtn = el('button', { class: 'prod-view', text: 'Compact' });
    const cartBtn = el('button', { class: 'prod-cart', text: 'Cart (0)' });

    controls.append(tabs, search, sort, viewBtn, cartBtn);
    wrap.append(controls);

    /* ---------- Produk Container ---------- */
    const grid = el('div', { class: 'produk-container' });
    wrap.append(grid);

    /* ---------- Produk Data ---------- */
    const data = [
        { id: 'propolis', nama: 'Propolis Murni', harga: 85000, gambar: 'images/propolis.jpg', kategori: 'Propolis' },
        { id: 'pulsa', nama: 'Isi Pulsa', harga: 10000, gambar: 'images/pulsa.jpg', kategori: 'Isi Pulsa' },
        { id: 'token', nama: 'Token Listrik', harga: 20000, gambar: 'images/token.jpg', kategori: 'Token Listrik' },
        { id: 'transfer', nama: 'Transfer & Pembayaran', harga: 5000, gambar: 'images/transfer.jpg', kategori: 'Transfer' },
        { id: 'percetakan', nama: 'Percetakan', harga: 50000, gambar: 'images/percetakan.jpg', kategori: 'Percetakan' },
    ];

    let category = 'Semua';
    let compact = false;
    let cartCount = 0;

    /* ---------- Render Produk ---------- */
    function render(list = data) {
        grid.innerHTML = '';
        const filtered = list.filter(p => category === 'Semua' || p.kategori === category);

        filtered.forEach(p => {
            const card = el('div', { class: 'produk' + (compact ? ' compact' : ''), 'data-id': p.id });
            card.innerHTML = `
                <div class="heart" title="Favorit">❤</div>
                <img src="${p.gambar}" alt="${p.nama}" loading="lazy">
                <h3>${p.nama}</h3>
                <p>Rp ${p.harga.toLocaleString('id-ID')}</p>
                <button class="buy">Beli via WA</button>
            `;
            // interaksi
            card.querySelector('img').onclick = () => modal(`<img src="${p.gambar}" style="max-width:240px;border-radius:10px"><h3>${p.nama}</h3><p>Rp ${p.harga.toLocaleString('id-ID')}</p><button class="modal-buy">Beli via WA</button>`, p.nama);
            card.querySelector('.buy').onclick = () => { beli(p.nama); cartBtn.textContent = `Cart (${++cartCount})`; toast(`${p.nama} ditambahkan ke keranjang`); };
            card.querySelector('.heart').onclick = () => { card.classList.toggle('fav'); toast(card.classList.contains('fav') ? '❤ Favorit ditambahkan' : '💔 Dihapus dari favorit'); };
            grid.append(card);
        });

        if (!filtered.length) grid.innerHTML = `<p style="opacity:.7">Tidak ada produk di kategori ini.</p>`;
    }

    render();

    /* ---------- Toast ---------- */
    function toast(msg) {
        const t = el('div', { class: 'toast', text: msg });
        document.body.append(t);
        setTimeout(() => t.style.opacity = '0', 1400);
        setTimeout(() => t.remove(), 1800);
    }

    /* ---------- Modal ---------- */
    const modalBox = el('div', { class: 'quickmodal' }, [el('div', { class: 'card' })]);
    document.body.append(modalBox);
    modalBox.onclick = e => { if (e.target === modalBox) modalBox.style.display = 'none'; };

    function modal(html, namaProduk) {
        modalBox.querySelector('.card').innerHTML = html;
        modalBox.style.display = 'flex';
        const buyBtn = modalBox.querySelector('.modal-buy');
        if (buyBtn) buyBtn.onclick = () => beli(namaProduk);
    }

    /* ---------- Aksi ---------- */
    const debounce = (fn, ms = 150) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

    search.addEventListener('input', debounce(() => {
        const q = search.value.trim().toLowerCase();
        $$('.produk').forEach(c => c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none');
    }, 120));

    sort.addEventListener('change', () => {
        const val = sort.value;
        const sorted = [...data];
        if (val === 'harga-asc') sorted.sort((a, b) => a.harga - b.harga);
        if (val === 'harga-desc') sorted.sort((a, b) => b.harga - a.harga);
        if (val === 'nama') sorted.sort((a, b) => a.nama.localeCompare(b.nama));
        render(sorted);
    });

    tabs.onclick = e => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        category = btn.dataset.cat;
        render();
        toast(`Filter: ${category}`);
    };

    viewBtn.onclick = () => {
        compact = !compact;
        viewBtn.textContent = compact ? 'Regular' : 'Compact';
        render();
    };

    cartBtn.onclick = () => toast(`Keranjang: ${cartCount} item`);

    window.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        if (key === 'k') { e.preventDefault(); search.focus(); }
        if (key === 'g') viewBtn.click();
        if (key === 'c') cartBtn.click();
    });

    /* ---------- WhatsApp ---------- */
    function beli(nama) {
        const pesan = `Halo! Saya tertarik dengan produk *${nama}* dari 89wolusongo.barokah. Apakah masih tersedia?`;
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank');
    }

})();
