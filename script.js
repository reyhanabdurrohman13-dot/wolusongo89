/*
 Enhanced interactive produk UI + top menu
 - Injects header menu if empty
 - Renders kategori tabs, search, sort, view, cart
 - Quick view modal, toast, favorites, keyboard shortcuts
 - WA buy uses nomor 6282337822107
*/
(() => {
    const WA_NUMBER = '6282337822107';

    // --- helper DOM utilities
    const $ = sel => document.querySelector(sel);
    const create = (tag, props = {}, children = []) => {
        const el = document.createElement(tag);
        Object.entries(props).forEach(([k, v]) => {
            if (k === 'class') el.className = v;
            else if (k === 'html') el.innerHTML = v;
            else if (k === 'text') el.textContent = v;
            else el.setAttribute(k, v);
        });
        children.forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
        return el;
    };

    // --- inject top menu if header nav empty
    const headerNavUl = document.querySelector('header nav ul');
    if (headerNavUl && headerNavUl.children.length === 0) {
        const items = [
            { text: 'Beranda', href: '89.html' },
            { text: 'Katalog', href: 'katalog.html' },
            { text: 'Tentang', href: '#tentang' },
            { text: 'Alamat', href: '#alamat' },
            { text: 'Contact Person', href: '#contact-person' },
            { text: 'Kontak', href: '#kontak' },
        ];
        items.forEach(it => {
            const li = create('li');
            const a = create('a', { href: it.href, text: it.text });
            li.appendChild(a);
            headerNavUl.appendChild(li);
        });
        // small extra controls
        const darkToggleLi = create('li');
        const darkBtn = create('button', { class: 'nav-btn', text: '🌙' });
        darkBtn.title = 'Toggle dark';
        darkBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            showToast(document.documentElement.classList.contains('dark') ? 'Dark mode ON' : 'Dark mode OFF');
        });
        darkToggleLi.appendChild(darkBtn);
        headerNavUl.appendChild(darkToggleLi);
    }

    // --- ensure produk container wrapper
    let produkContainer = document.querySelector('.produk-container');
    const katalogSection = document.getElementById('katalog');
    const mountParent = katalogSection || document.body;
    const wrapper = create('div', { id: 'produk-ui-wrapper' });
    wrapper.style.margin = '18px';
    mountParent.appendChild(wrapper);

    // controls row
    const controls = create('div', { class: 'prod-controls', role: 'region', 'aria-label': 'Kontrol produk' });
    wrapper.appendChild(controls);

    // category tabs
    const categories = ['Semua', 'Propolis', 'Isi Pulsa', 'Token Listrik', 'Transfer', 'Percetakan'];
    const tabs = create('div', { class: 'prod-tabs' });
    categories.forEach(cat => {
        const btn = create('button', { class: 'tab-btn', text: cat, 'data-cat': cat });
        if (cat === 'Semua') btn.classList.add('active');
        tabs.appendChild(btn);
    });
    controls.appendChild(tabs);

    // search, sort, view, cart
    const search = create('input', { type: 'search', placeholder: 'Cari produk... (tekan K)', class: 'prod-search', 'aria-label': 'Cari produk' });
    const sort = create('select', { class: 'prod-sort', 'aria-label': 'Urutkan produk', html: '<option value="">Urutkan</option><option value="harga-asc">Harga ↑</option><option value="harga-desc">Harga ↓</option><option value="nama">Nama A–Z</option>' });
    const viewBtn = create('button', { class: 'prod-view', text: 'Compact' });
    const cartBtn = create('button', { class: 'prod-cart', text: 'Cart (0)' });
    controls.appendChild(search);
    controls.appendChild(sort);
    controls.appendChild(viewBtn);
    controls.appendChild(cartBtn);

    // produk container
    if (!produkContainer) {
        produkContainer = create('div', { class: 'produk-container' });
        wrapper.appendChild(produkContainer);
    } else {
        // move existing into wrapper if needed
        wrapper.appendChild(produkContainer);
    }

    // inject styles
    const css = `
        :root{--accent:#0b84ff;--bg:#f7f8fb;--card:#fff}
        .dark { --bg:#0b1220; --card:#071122; --accent:#7cc2ff; color:#e6eef9; background:#071122; }
        #produk-ui-wrapper { background:var(--bg); padding:12px; border-radius:10px; }
        .prod-controls { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:12px; }
        .prod-tabs { display:flex; gap:6px; flex-wrap:wrap; }
        .tab-btn { padding:6px 10px; border-radius:8px; border:1px solid rgba(0,0,0,0.06); background:#fff; cursor:pointer; }
        .tab-btn.active { background:var(--accent); color:#fff; border-color:transparent; }
        .prod-search { padding:8px 10px; border-radius:8px; border:1px solid #ddd; min-width:180px; }
        .prod-sort { padding:8px;border-radius:8px;border:1px solid #ddd; }
        .prod-view, .prod-cart { padding:8px 12px;border-radius:8px;border:none;background:var(--accent);color:#fff;cursor:pointer; }
        .produk-container { display:flex; gap:16px; flex-wrap:wrap; align-items:flex-start; }
        .produk { width:200px; background:var(--card); border-radius:12px; padding:12px; text-align:center; box-shadow:0 8px 20px rgba(2,6,23,0.06); position:relative; transition:transform .18s; }
        .produk.compact { width:140px; padding:10px; }
        .produk img { width:100%; height:120px; object-fit:cover; border-radius:8px; cursor:pointer; }
        .produk h3 { margin:8px 0 6px; font-size:16px; }
        .produk p { margin:0; color:#444; font-weight:600; }
        .produk button.buy { margin-top:10px;padding:8px 10px;border-radius:8px;border:none;background:var(--accent);color:#fff;cursor:pointer; }
        .heart { position:absolute; right:10px; top:10px; font-size:18px; color:#ff4d6d; cursor:pointer; display:none; }
        .produk.fav .heart { display:block; }
        .toast { position:fixed; right:20px; bottom:20px; background:rgba(0,0,0,0.78); color:#fff; padding:10px 14px; border-radius:10px; z-index:9999; opacity:1; transition:opacity .35s; }
        .quickmodal { position:fixed; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); z-index:10000;}
        .quickmodal .card { background:var(--card); color:inherit; padding:16px;border-radius:12px; width:320px; max-width:92%; text-align:center; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // toast helper
    function showToast(text) {
        const t = create('div', { class: 'toast', text });
        document.body.appendChild(t);
        setTimeout(() => t.style.opacity = '0', 1400);
        setTimeout(() => t.remove(), 1800);
    }

    // quick modal for product
    const modal = create('div', { class: 'quickmodal', role: 'dialog', 'aria-hidden': 'true' }, [
        create('div', { class: 'card' }, [])
    ]);
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.style.display = 'none';
    });
    function openModal(html) {
        modal.querySelector('.card').innerHTML = html;
        modal.style.display = 'flex';
    }

    // data produk (sesuaikan gambar file di folder images)
    const produkList = [
        { id: 'propolis', nama: 'Propolis Murni', harga: 85000, gambar: 'images/propolis.jpg', kategori: 'Propolis' },
        { id: 'pulsa', nama: 'Isi Pulsa', harga: 10000, gambar: 'images/pulsa.jpg', kategori: 'Isi Pulsa' },
        { id: 'token', nama: 'Token Listrik', harga: 20000, gambar: 'images/token.jpg', kategori: 'Token Listrik' },
        { id: 'transfer', nama: 'Transfer & Pembayaran', harga: 5000, gambar: 'images/transfer.jpg', kategori: 'Transfer' },
        { id: 'percetakan', nama: 'Percetakan', harga: 50000, gambar: 'images/percetakan.jpg', kategori: 'Percetakan' },
    ];

    // state
    let cartCount = 0;
    let activeCategory = 'Semua';
    let compactMode = false;

    // render produk
    function renderProduk(list = produkList) {
        produkContainer.innerHTML = '';
        const filtered = list.filter(p => activeCategory === 'Semua' || p.kategori === activeCategory);
        filtered.forEach(p => {
            const card = create('div', { class: 'produk', 'data-id': p.id, 'data-kategori': p.kategori });
            card.innerHTML = `
                <div class="heart" title="Favorit">♥</div>
                <img src="${p.gambar}" alt="${p.nama}" loading="lazy">
                <h3>${p.nama}</h3>
                <p>Rp ${p.harga.toLocaleString('id-ID')}</p>
                <button class="buy">Beli via WA</button>
            `;
            if (compactMode) card.classList.add('compact');
            // events
            const img = card.querySelector('img');
            img.addEventListener('click', () => {
                openModal(`<img src="${p.gambar}" style="max-width:220px;border-radius:8px"><h3 style="margin:8px 0">${p.nama}</h3><p>Rp ${p.harga.toLocaleString('id-ID')}</p><div style="margin-top:8px"><button id="modal-buy" style="padding:8px 12px;border-radius:8px;border:none;background:${getComputedStyle(document.documentElement).getPropertyValue('--accent')};color:#fff;cursor:pointer">Beli via WA</button></div>`);
                document.getElementById('modal-buy').addEventListener('click', () => beli(p.nama));
            });
            const buyBtn = card.querySelector('button.buy');
            buyBtn.addEventListener('click', () => {
                cartCount++;
                cartBtn.textContent = `Cart (${cartCount})`;
                showToast(`${p.nama} - Siap dibeli (dibuka WA)`);
                beli(p.nama);
            });
            // favorite toggle double click or heart click
            const heart = card.querySelector('.heart');
            heart.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.toggle('fav');
                showToast(card.classList.contains('fav') ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
            });
            card.addEventListener('dblclick', () => {
                card.classList.toggle('fav');
                showToast(card.classList.contains('fav') ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
            });

            produkContainer.appendChild(card);
        });
        if (filtered.length === 0) {
            produkContainer.innerHTML = '<p style="opacity:.7">Tidak ada produk untuk kategori ini.</p>';
        }
    }

    // initial render
    renderProduk();

    // search filtering (debounced)
    const debounce = (fn, ms = 160) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
    const applySearch = debounce(() => {
        const q = search.value.trim().toLowerCase();
        Array.from(produkContainer.querySelectorAll('.produk')).forEach(card => {
            const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const match = !q || name.includes(q);
            card.style.display = match ? '' : 'none';
        });
    }, 120);
    search.addEventListener('input', applySearch);

    // sort
    sort.addEventListener('change', () => {
        const val = sort.value;
        const items = Array.from(produkContainer.querySelectorAll('.produk')).map(el => {
            const id = el.getAttribute('data-id');
            return produkList.find(p => p.id === id) || null;
        }).filter(Boolean);
        if (val === 'harga-asc') items.sort((a, b) => a.harga - b.harga);
        else if (val === 'harga-desc') items.sort((a, b) => b.harga - a.harga);
        else if (val === 'nama') items.sort((a, b) => a.nama.localeCompare(b.nama));
        renderProduk(items);
    });

    // category tabs event
    tabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-cat') || 'Semua';
        renderProduk();
        showToast(`Filter: ${activeCategory}`);
    });

    // view toggle
    viewBtn.addEventListener('click', () => {
        compactMode = !compactMode;
        viewBtn.textContent = compactMode ? 'Regular' : 'Compact';
        document.querySelectorAll('.produk').forEach(p => p.classList.toggle('compact', compactMode));
        showToast('Tampilan produk diubah');
    });

    // cart button
    cartBtn.addEventListener('click', () => showToast(`Keranjang: ${cartCount} item`));

    // keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'k' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault(); search.focus(); search.select();
        }
        if (e.key.toLowerCase() === 'g') {
            viewBtn.click();
        }
        if (e.key.toLowerCase() === 'c') {
            cartBtn.click();
        }
    });

    // buy -> open WA
    function beli(namaProduk) {
        const pesan = `Halo! Saya tertarik dengan produk *${namaProduk}* dari 89wolusongo.barokah. Apakah masih tersedia?`;
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank');
    }

    // expose small debug API
    window.__produkUI = { renderProduk, beli, setWA: n => { WA_NUMBER = n; } };

    // safe hookup for optional existing "lihatKatalog" button
    const lihatKatalogBtn = document.getElementById('lihatKatalog');
    if (lihatKatalogBtn) lihatKatalogBtn.addEventListener('click', () => {
        (katalogSection || wrapper).scrollIntoView({ behavior: 'smooth' });
    });

})();
