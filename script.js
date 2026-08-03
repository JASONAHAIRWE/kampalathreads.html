// ── PWA SERVICE WORKER REGISTRATION ──
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('ServiceWorker registered with scope:', reg.scope))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    });
}

// ── THEME / DARK MODE LOGIC ──
const themeToggleBtn = document.getElementById('theme-toggle');
function initTheme() {
    const savedTheme = localStorage.getItem('kampalaTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggleBtn) {
        themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('kampalaTheme', newTheme);
        themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        showToast(newTheme === 'dark' ? '🌙 Dark Obsidian mode active' : '☀️ Light mode active');
    });
}
initTheme();

// ── PRODUCT DATA ──
const products = [
    { 
        id: 1, 
        name: "Kitenge Wrap Dress", 
        tags: ["women", "modern"], 
        priceNum: 85000, 
        price: "UGX 85,000", 
        badge: "Bestseller", 
        bg: "#E8D5C4", 
        image: "wrap dress.jpeg",
        rating: 4.9,
        reviewsCount: 28,
        sizes: ["S", "M", "L", "XL"],
        description: "Elegant handmade African kitenge wrap dress with vibrant wax print patterns, adjustable waist tie, and side pockets. Perfect for weddings and social events."
    },
    { 
        id: 2, 
        name: "Men's Kitenge Shirt", 
        tags: ["men", "modern"], 
        priceNum: 65000, 
        price: "UGX 65,000", 
        badge: "Popular", 
        bg: "#D4C5B0", 
        image: "mens kitengye.jpeg",
        rating: 4.8,
        reviewsCount: 19,
        sizes: ["M", "L", "XL", "XXL"],
        description: "Tailored short-sleeve button down featuring traditional East African geometric motifs. Soft 100% breathable cotton."
    },
    { 
        id: 3, 
        name: "Classic Gomesi", 
        tags: ["women", "traditional"], 
        priceNum: 120000, 
        price: "UGX 120,000", 
        badge: "Traditional", 
        bg: "#E0CEC0", 
        image: "gomesi.jpeg",
        rating: 5.0,
        reviewsCount: 42,
        sizes: ["Bespoke", "M", "L"],
        description: "Authentic Ugandan Busuuti / Gomesi featuring high pointed shoulders, square neckline, and a matching silk sash."
    },
    { 
        id: 6, 
        name: "Men's Kanzu", 
        tags: ["men", "traditional"], 
        priceNum: 75000, 
        price: "UGX 75,000", 
        badge: "Traditional", 
        bg: "#D8CCBC", 
        image: "kanzu.jpeg",
        rating: 4.9,
        reviewsCount: 31,
        sizes: ["M", "L", "XL"],
        description: "Pure white cream ceremonial tunic adorned with detailed maroon neck embroidery. The national dress for Ugandan men."
    },
    { 
        id: 8, 
        name: "Kids Kitenge Set", 
        tags: ["kids"], 
        priceNum: 45000, 
        price: "UGX 45,000", 
        badge: "Trending", 
        bg: "#E0D5C5", 
        image: "kids kitengye.jpeg",
        rating: 4.7,
        reviewsCount: 14,
        sizes: ["3-4Y", "5-7Y", "8-10Y"],
        description: "Vibrant matching kitenge two-piece set designed for active kids. Durable stitching and comfortable elasticated waist."
    },
    { 
        id: 12, 
        name: "Baby Kitenge Set", 
        tags: ["kids"], 
        priceNum: 32000, 
        price: "UGX 32,000", 
        badge: "Cute", 
        bg: "#E8DDD0", 
        image: "baby's kitengye.jpeg",
        rating: 5.0,
        reviewsCount: 22,
        sizes: ["0-6M", "6-12M", "1-2Y"],
        description: "Soft hypoallergenic organic cotton outfit styled with authentic Ugandan wax prints. Ultra-gentle on tender baby skin."
    }
];

// ── WISHLIST STATE ──
function getWishlist() {
    return JSON.parse(localStorage.getItem('kampalaWishlist') || '[]');
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const idx = wishlist.indexOf(productId);
    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast('❤️ Item removed from Wishlist');
    } else {
        wishlist.push(productId);
        showToast('💖 Saved to your Wishlist!');
    }
    localStorage.setItem('kampalaWishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    renderProducts();
    if (document.getElementById('wishlist-modal').classList.contains('show')) {
        renderWishlistItems();
    }
}

function updateWishlistCount() {
    const wishlist = getWishlist();
    const countEl = document.getElementById('wishlist-count');
    if (countEl) countEl.textContent = wishlist.length;
}

// ── PRODUCT RENDERER ──
function productHTML(p) {
    const tagStr = p.tags.join(',');
    const badgeHTML = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
    const wishlist = getWishlist();
    const isWishlisted = wishlist.includes(p.id);

    return `
        <div class="product-card" data-id="${p.id}" data-tags="${tagStr}" data-price="${p.priceNum}" data-name="${p.name.toLowerCase()}" data-rating="${p.rating}">
            <div class="product-img" style="background:${p.bg};" onclick="openQuickView(${p.id})">
                <img src="${encodeURI(p.image)}"
                     alt="${p.name} - Authentic African fashion"
                     onerror="this.style.display='none'; this.parentElement.innerHTML += '<span style=font-size:3.5rem>📸</span>';">
                ${badgeHTML}
                <div class="product-card-actions" onclick="event.stopPropagation()">
                    <button class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" 
                            title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                            onclick="toggleWishlist(${p.id})">
                        ${isWishlisted ? '❤️' : '🤍'}
                    </button>
                </div>
                <button class="quick-view-badge-btn" onclick="event.stopPropagation(); openQuickView(${p.id})">Quick View 👁️</button>
            </div>
            <div class="product-info">
                <div class="product-category">${p.tags.join(' &middot; ')}</div>
                <div class="product-name" onclick="openQuickView(${p.id})" style="cursor:pointer;">${p.name}</div>
                <div class="product-rating">
                    <span>★ ${p.rating.toFixed(1)}</span>
                    <span class="review-count" onclick="openReviewModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')">(${p.reviewsCount} reviews)</span>
                </div>
                <div class="product-footer">
                    <span class="product-price">${p.price}</span>
                    <button class="add-cart-btn" data-product-id="${p.id}">Add to Cart</button>
                </div>
            </div>
        </div>`;
}

function renderProducts() {
    const featuredContainer = document.getElementById('featured-products');
    const shopContainer = document.getElementById('shop-products');
    if (featuredContainer) featuredContainer.innerHTML = products.slice(0, 4).map(productHTML).join('');
    if (shopContainer) filterAndSortProducts();
}

// ── SEARCH & SORT LOGIC ──
function filterAndSortProducts() {
    const shopContainer = document.getElementById('shop-products');
    if (!shopContainer) return;

    const query = (document.getElementById('shop-search-input')?.value || '').toLowerCase().trim();
    const sortVal = document.getElementById('shop-sort-select')?.value || 'default';
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const catFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

    let filtered = products.filter(p => {
        const matchesCategory = (catFilter === 'all' || p.tags.includes(catFilter));
        const matchesQuery = !query || p.name.toLowerCase().includes(query) || p.tags.some(t => t.toLowerCase().includes(query)) || (p.description && p.description.toLowerCase().includes(query));
        return matchesCategory && matchesQuery;
    });

    if (sortVal === 'price-low') {
        filtered.sort((a, b) => a.priceNum - b.priceNum);
    } else if (sortVal === 'price-high') {
        filtered.sort((a, b) => b.priceNum - a.priceNum);
    } else if (sortVal === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'rating-high') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    if (filtered.length === 0) {
        shopContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color:var(--muted);">No matching garments found. Try adjusting your search query or filter.</div>';
    } else {
        shopContainer.innerHTML = filtered.map(productHTML).join('');
    }
}

// Event listeners for Search & Sort
document.getElementById('shop-search-input')?.addEventListener('input', filterAndSortProducts);
document.getElementById('shop-sort-select')?.addEventListener('change', filterAndSortProducts);

// ── ROUTING & NAV ──
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

    const pg = document.getElementById(pageId);
    const nav = document.getElementById('nav-' + pageId);

    if (pg) pg.classList.add('active');
    if (nav) nav.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleRouting() {
    let hash = window.location.hash.substring(1);
    if (!hash) hash = 'home';
    if (!document.getElementById(hash)) hash = 'home';
    showPage(hash);
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

// Mobile menu toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
}

// Filter buttons
function filterProducts(filter, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }
    filterAndSortProducts();
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter');
        filterProducts(filter, e.target);
    });
});

document.querySelectorAll('.footer-filter-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const filter = e.currentTarget.getAttribute('data-filter');
        const targetBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
        if (targetBtn) filterProducts(filter, targetBtn);
    });
});

// Toast notification helper
function showToast(msg) {
    const t = document.getElementById('toast');
    if (t) {
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2800);
    }
}

// ── QUICK VIEW MODAL LOGIC ──
const qvOverlay = document.getElementById('quick-view-overlay');
const qvModal = document.getElementById('quick-view-modal');
const qvContent = document.getElementById('quick-view-content');

function openQuickView(productId) {
    const item = products.find(p => p.id === productId);
    if (!item) return;

    let selectedSize = item.sizes[0];

    qvContent.innerHTML = `
        <div class="qv-layout">
            <div class="qv-img-box" onclick="openLightbox('${encodeURI(item.image)}', '${item.name.replace(/'/g, "\\'")}')">
                <img src="${encodeURI(item.image)}" alt="${item.name}">
            </div>
            <div class="qv-details">
                <div class="product-category">${item.tags.join(' &middot; ')}</div>
                <h3 class="qv-title">${item.name}</h3>
                <div class="qv-price">${item.price}</div>
                <div class="product-rating" style="margin-bottom:1rem;">★ ${item.rating.toFixed(1)} (${item.reviewsCount} customer reviews)</div>
                <p class="qv-desc">${item.description}</p>
                
                <div class="qv-sizes">
                    <label>Select Size:</label>
                    <div class="size-pills">
                        ${item.sizes.map((s, i) => `<button class="size-pill ${i === 0 ? 'active' : ''}" onclick="selectQvSize(this, '${s}')">${s}</button>`).join('')}
                    </div>
                </div>

                <div style="display:flex; gap:0.8rem;">
                    <button class="btn-primary" style="flex:1;" id="qv-add-cart-btn">Add to Cart 🛒</button>
                    <button class="wishlist-heart-btn" style="width:42px; height:42px; border-radius:6px;" onclick="toggleWishlist(${item.id})">❤️</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('qv-add-cart-btn').addEventListener('click', () => {
        addToCart(item.id, selectedSize);
        closeQuickView();
    });

    qvOverlay.classList.add('show');
    qvModal.classList.add('show');
}

function selectQvSize(btn, size) {
    document.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function closeQuickView() {
    qvOverlay.classList.remove('show');
    qvModal.classList.remove('show');
}

document.getElementById('close-quick-view')?.addEventListener('click', closeQuickView);
qvOverlay?.addEventListener('click', closeQuickView);

// ── IMAGE LIGHTBOX LOGIC ──
const lbOverlay = document.getElementById('lightbox-overlay');
const lbImg = document.getElementById('lightbox-img');
const lbCaption = document.getElementById('lightbox-caption');

function openLightbox(src, caption) {
    lbImg.src = src;
    lbCaption.textContent = caption || '';
    lbOverlay.classList.add('show');
}

function closeLightbox() {
    lbOverlay.classList.remove('show');
}

document.getElementById('close-lightbox')?.addEventListener('click', closeLightbox);
lbOverlay?.addEventListener('click', closeLightbox);

// ── CART LOGIC & QUANTITY CONTROLS ──
const cartModal = document.getElementById('cart-modal');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');

function getCart() {
    return JSON.parse(localStorage.getItem('kampalaCart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('kampalaCart', JSON.stringify(cart));
    updateCartCount();
}

function toggleCart(show) {
    if (show) {
        cartModal.classList.add('show');
        cartOverlay.classList.add('show');
        renderCartItems();
    } else {
        cartModal.classList.remove('show');
        cartOverlay.classList.remove('show');
    }
}

document.getElementById('cart-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleCart(true);
});

document.getElementById('close-cart')?.addEventListener('click', () => toggleCart(false));
cartOverlay?.addEventListener('click', () => toggleCart(false));

function addToCart(productId, size = 'M') {
    let cart = getCart();
    const item = products.find(p => p.id === productId);

    if (item) {
        const existingIdx = cart.findIndex(c => c.id === productId && c.size === size);
        if (existingIdx > -1) {
            cart[existingIdx].qty = (cart[existingIdx].qty || 1) + 1;
        } else {
            cart.push({ ...item, size: size, qty: 1 });
        }
        saveCart(cart);
        showToast('🛒 "' + item.name + '" (' + size + ') added to cart!');
        if (cartModal.classList.contains('show')) renderCartItems();
    }
}

function updateCartQty(index, change) {
    let cart = getCart();
    if (cart[index]) {
        cart[index].qty = (cart[index].qty || 1) + change;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
        renderCartItems();
    }
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartItems();
}

function updateCartCount() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) cartCountEl.textContent = totalCount;
}

function renderCartItems() {
    const cart = getCart();
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty-msg">Your cart is empty.</div>';
        if (cartTotalPrice) cartTotalPrice.textContent = 'UGX 0';
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        const itemQty = item.qty || 1;
        const itemSubtotal = item.priceNum * itemQty;
        total += itemSubtotal;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${encodeURI(item.image)}" class="cart-item-img" alt="${item.name}" onclick="openLightbox('${encodeURI(item.image)}', '${item.name.replace(/'/g, "\\'")}')">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name} <span class="cart-item-size-badge">${item.size || 'M'}</span></div>
                <div class="cart-item-price">UGX ${itemSubtotal.toLocaleString()}</div>
                <div class="cart-qty-ctrl">
                    <button class="qty-btn" onclick="updateCartQty(${index}, -1)">-</button>
                    <span class="qty-val">${itemQty}</span>
                    <button class="qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
                    <button class="cart-item-remove" style="margin-left:auto;" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    if (cartTotalPrice) cartTotalPrice.textContent = 'UGX ' + total.toLocaleString();
}

// Global click event delegation for Add to Cart buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-cart-btn')) {
        const productId = parseInt(e.target.getAttribute('data-product-id'));
        addToCart(productId);
    }
});

// ── WISHLIST MODAL LOGIC ──
const wishlistModal = document.getElementById('wishlist-modal');
const wishlistOverlay = document.getElementById('wishlist-overlay');
const wishlistItemsContainer = document.getElementById('wishlist-items-container');

function toggleWishlistDrawer(show) {
    if (show) {
        wishlistModal.classList.add('show');
        wishlistOverlay.classList.add('show');
        renderWishlistItems();
    } else {
        wishlistModal.classList.remove('show');
        wishlistOverlay.classList.remove('show');
    }
}

document.getElementById('wishlist-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleWishlistDrawer(true);
});

document.getElementById('close-wishlist')?.addEventListener('click', () => toggleWishlistDrawer(false));
wishlistOverlay?.addEventListener('click', () => toggleWishlistDrawer(false));

function renderWishlistItems() {
    const wishlistIds = getWishlist();
    wishlistItemsContainer.innerHTML = '';

    if (wishlistIds.length === 0) {
        wishlistItemsContainer.innerHTML = '<div class="cart-empty-msg">Your wishlist is empty. Tap ❤️ on any garment to save it!</div>';
        return;
    }

    wishlistIds.forEach((id) => {
        const item = products.find(p => p.id === id);
        if (!item) return;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${encodeURI(item.image)}" class="cart-item-img" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price}</div>
                <div style="display:flex; gap:0.5rem; margin-top:0.4rem;">
                    <button class="add-cart-btn" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="addToCart(${item.id})">+ Cart</button>
                    <button class="cart-item-remove" onclick="toggleWishlist(${item.id})">Remove</button>
                </div>
            </div>
        `;
        wishlistItemsContainer.appendChild(itemEl);
    });
}

document.getElementById('wishlist-add-all-btn')?.addEventListener('click', () => {
    const wishlistIds = getWishlist();
    wishlistIds.forEach(id => addToCart(id));
    toggleWishlistDrawer(false);
    showToast('🛒 Added all wishlist items to cart!');
});

// ── CHECKOUT WIZARD & MOBILE MONEY SIMULATOR ──
const coOverlay = document.getElementById('checkout-overlay');
const coModal = document.getElementById('checkout-modal');

let currentStep = 1;
let currentOrderDetails = {};

function openCheckoutModal() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty! Please add items before checking out.");
        return;
    }
    toggleCart(false);
    setWizardStep(1);
    coOverlay.classList.add('show');
    coModal.classList.add('show');
}

function closeCheckoutModal() {
    coOverlay.classList.remove('show');
    coModal.classList.remove('show');
}

document.getElementById('cart-checkout-btn')?.addEventListener('click', openCheckoutModal);
document.getElementById('close-checkout')?.addEventListener('click', closeCheckoutModal);

function setWizardStep(step) {
    currentStep = step;
    document.querySelectorAll('.wizard-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));

    document.getElementById(`wizard-step-${step}`)?.classList.add('active');
    document.getElementById(`step-dot-${step}`)?.classList.add('active');

    if (step === 2) updateCheckoutTotals();
}

document.getElementById('goto-step-2')?.addEventListener('click', () => {
    const name = document.getElementById('co-name').value.trim();
    const phone = document.getElementById('co-phone').value.trim();
    const address = document.getElementById('co-address').value.trim();

    if (!name || !phone || !address) {
        alert("Please fill in all required delivery fields (Name, Phone, and Address).");
        return;
    }
    setWizardStep(2);
});

document.getElementById('goto-step-1')?.addEventListener('click', () => setWizardStep(1));
document.getElementById('goto-step-2-back')?.addEventListener('click', () => setWizardStep(2));

function updateCheckoutTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.priceNum * (item.qty || 1)), 0);
    const regionFee = parseInt(document.getElementById('co-region').value || '5000');
    const grandTotal = subtotal + regionFee;

    document.getElementById('co-subtotal').textContent = 'UGX ' + subtotal.toLocaleString();
    document.getElementById('co-delivery-fee').textContent = 'UGX ' + regionFee.toLocaleString();
    document.getElementById('co-grand-total').textContent = 'UGX ' + grandTotal.toLocaleString();
}

document.getElementById('co-region')?.addEventListener('change', updateCheckoutTotals);

// Payment step 2 -> 3
document.getElementById('goto-step-3')?.addEventListener('click', () => {
    const cart = getCart();
    const name = document.getElementById('co-name').value.trim();
    const phone = document.getElementById('co-phone').value.trim();
    const address = document.getElementById('co-address').value.trim();
    const subtotal = cart.reduce((sum, item) => sum + (item.priceNum * (item.qty || 1)), 0);
    const regionFee = parseInt(document.getElementById('co-region').value || '5000');
    const grandTotal = subtotal + regionFee;
    const payMethod = document.querySelector('input[name="paymethod"]:checked')?.value || 'momo';

    currentOrderDetails = {
        ref: 'KT-' + Math.floor(10000 + Math.random() * 90000),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        name, phone, address, cart, subtotal, regionFee, grandTotal, payMethod
    };

    document.getElementById('momo-phone-display').textContent = phone;
    document.getElementById('momo-amount-display').textContent = 'UGX ' + grandTotal.toLocaleString();

    setWizardStep(3);
});

// Step 3 PIN simulate payment
document.getElementById('sim-confirm-pay')?.addEventListener('click', () => {
    const pin = document.getElementById('sim-pin-input').value;
    if (!pin || pin.length < 4) {
        alert("Please enter a valid 4-digit PIN for simulation.");
        return;
    }

    const spinner = document.getElementById('stk-spinner');
    const btn = document.getElementById('sim-confirm-pay');
    if (spinner) spinner.style.display = 'block';
    if (btn) btn.style.display = 'none';

    setTimeout(() => {
        if (spinner) spinner.style.display = 'none';
        generateInvoice(currentOrderDetails);
        setWizardStep(4);
        saveCart([]); // clear cart
        showToast('🎉 Order Placed Successfully!');
    }, 1800);
});

// Step 4 Invoice generation
function generateInvoice(order) {
    document.getElementById('inv-ref').textContent = order.ref;
    document.getElementById('inv-date').textContent = order.date;
    document.getElementById('inv-cust-name').textContent = order.name;
    document.getElementById('inv-cust-phone').textContent = order.phone;
    document.getElementById('inv-cust-addr').textContent = order.address;

    const tbody = document.getElementById('inv-items-body');
    if (tbody) {
        tbody.innerHTML = order.cart.map(item => `
            <tr>
                <td>${item.name} (${item.size || 'M'})</td>
                <td>${item.qty || 1}</td>
                <td>UGX ${(item.priceNum * (item.qty || 1)).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    document.getElementById('inv-subtotal').textContent = 'UGX ' + order.subtotal.toLocaleString();
    document.getElementById('inv-delivery').textContent = 'UGX ' + order.regionFee.toLocaleString();
    document.getElementById('inv-total').textContent = 'UGX ' + order.grandTotal.toLocaleString();
}

document.getElementById('print-invoice-btn')?.addEventListener('click', () => {
    window.print();
});

document.getElementById('close-checkout-finish')?.addEventListener('click', () => {
    closeCheckoutModal();
});

// ── BESPOKE TAILORING MODAL LOGIC ──
const bespokeOverlay = document.getElementById('bespoke-overlay');
const bespokeModal = document.getElementById('bespoke-modal');

function openBespokeModal() {
    bespokeOverlay.classList.add('show');
    bespokeModal.classList.add('show');
}
function closeBespokeModal() {
    bespokeOverlay.classList.remove('show');
    bespokeModal.classList.remove('show');
}

document.getElementById('open-bespoke-btn')?.addEventListener('click', openBespokeModal);
document.getElementById('close-bespoke')?.addEventListener('click', closeBespokeModal);
bespokeOverlay?.addEventListener('click', closeBespokeModal);

document.getElementById('bespoke-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const bespokeData = {
        name: document.getElementById('bm-name').value,
        phone: document.getElementById('bm-phone').value,
        garment: document.getElementById('bm-garment').value,
        chest: document.getElementById('bm-chest').value,
        waist: document.getElementById('bm-waist').value,
        hips: document.getElementById('bm-hips').value,
        height: document.getElementById('bm-height').value,
        notes: document.getElementById('bm-notes').value,
        timestamp: new Date().toISOString()
    };

    let requests = JSON.parse(localStorage.getItem('bespokeRequests') || '[]');
    requests.push(bespokeData);
    localStorage.setItem('bespokeRequests', JSON.stringify(requests));

    closeBespokeModal();
    showToast('✂️ Custom order request received! An artisan will call you shortly.');
});

// ── PRODUCT REVIEW MODAL LOGIC ──
const reviewOverlay = document.getElementById('review-overlay');
const reviewModal = document.getElementById('review-modal');

function openReviewModal(productId, productName) {
    document.getElementById('review-product-id').value = productId;
    document.getElementById('review-product-title').textContent = `Reviewing: "${productName}"`;
    reviewOverlay.classList.add('show');
    reviewModal.classList.add('show');
}

function closeReviewModal() {
    reviewOverlay.classList.remove('show');
    reviewModal.classList.remove('show');
}

document.getElementById('close-review')?.addEventListener('click', closeReviewModal);
reviewOverlay?.addEventListener('click', closeReviewModal);

// Star selector logic
document.querySelectorAll('#star-rating-select span').forEach(star => {
    star.addEventListener('click', (e) => {
        const val = parseInt(e.target.getAttribute('data-star'));
        document.getElementById('rev-rating').value = val;
        document.querySelectorAll('#star-rating-select span').forEach((s, idx) => {
            if (idx < val) s.classList.add('active');
            else s.classList.remove('active');
        });
    });
});

document.getElementById('review-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const productId = parseInt(document.getElementById('review-product-id').value);
    const reviewerName = document.getElementById('rev-name').value;
    const rating = parseInt(document.getElementById('rev-rating').value);
    const comment = document.getElementById('rev-comment').value;

    const targetProduct = products.find(p => p.id === productId);
    if (targetProduct) {
        targetProduct.reviewsCount += 1;
        targetProduct.rating = Number(((targetProduct.rating * (targetProduct.reviewsCount - 1) + rating) / targetProduct.reviewsCount).toFixed(1));
    }

    closeReviewModal();
    renderProducts();
    showToast('⭐ Thank you for your review!');
});

// ── INITIALIZATION ON LOAD ──
window.addEventListener('load', () => {
    renderProducts();
    updateCartCount();
    updateWishlistCount();
});