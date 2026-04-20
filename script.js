// ── PRODUCT DATA ──
// To use your own images, change the 'image' URL to your file name, e.g., image: "my-photo.jpg"
const products = [
    { id: 1, name: "Kitenge Wrap Dress", tags: ["women", "modern"], priceNum: 85000, price: "UGX 85,000", badge: "Bestseller", bg: "#E8D5C4", image: "wrap dress.jpeg" },
    { id: 2, name: "Men's Kitenge Shirt", tags: ["men", "modern"], priceNum: 65000, price: "UGX 65,000", badge: "", bg: "#D4C5B0", image: "mens kitengye.jpeg" },
    { id: 3, name: "Classic Gomesi", tags: ["women", "traditional"], priceNum: 120000, price: "UGX 120,000", badge: "Traditional", bg: "#E0CEC0", image: "gomesi.jpeg" },
    { id: 6, name: "Men's Kanzu", tags: ["men", "traditional"], priceNum: 75000, price: "UGX 75,000", badge: "Traditional", bg: "#D8CCBC", image: "kanzu.jpeg" },
    { id: 8, name: "Kids Kitenge Set", tags: ["kids"], priceNum: 45000, price: "UGX 45,000", badge: "", bg: "#E0D5C5", image: "kids kitengye.jpeg" },
    { id: 12, name: "Baby Kitenge Set", tags: ["kids"], priceNum: 32000, price: "UGX 32,000", badge: "Cute", bg: "#E8DDD0", image: "baby's kitengye.jpeg" }
];

// ── RENDER FUNCTIONS ──
function productHTML(p) {
    const tagStr = p.tags.join(',');
    const badgeHTML = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';

    return `
        <div class="product-card" data-tags="${tagStr}">
            <div class="product-img" style="background:${p.bg};">
                <img src="${encodeURI(p.image)}"
                     alt="${p.name} - Authentic African fashion from Kampala Threads"
                     onerror="this.style.display='none'; this.parentElement.innerHTML += '<span style=font-size:3.5rem>&#128248;</span>';">
                ${badgeHTML}
            </div>
            <div class="product-info">
                <div class="product-category">${p.tags.join(' &middot; ')}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-footer">
                    <span class="product-price">${p.price}</span>
                    <button class="add-cart-btn" data-product-id="${p.id}">Add to Cart</button>
                </div>
            </div>
        </div>`;
}

// Populate grids
document.getElementById('featured-products').innerHTML = products.slice(0, 4).map(productHTML).join('');
document.getElementById('shop-products').innerHTML = products.map(productHTML).join('');

// Event delegation for "Add to Cart" buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-cart-btn')) {
        const productId = parseInt(e.target.getAttribute('data-product-id'));
        addToCart(productId);
    }
});

// ── NAVIGATION & ROUTING ──
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

    const pg = document.getElementById(pageId);
    const nav = document.getElementById('nav-' + pageId);

    if (pg) pg.classList.add('active');
    if (nav) nav.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle hash changes for routing
function handleRouting() {
    let hash = window.location.hash.substring(1);
    if (!hash) hash = 'home'; // Default to home

    // Check if the page exists, otherwise default to home
    if (!document.getElementById(hash)) {
        hash = 'home';
    }

    showPage(hash);
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

// ── MOBILE MENU ──
const mobileBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}


// ── FILTER ──
function filterProducts(filter, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }
    document.querySelectorAll('#shop-products .product-card').forEach(card => {
        const tags = (card.dataset.tags || '').split(',');
        card.style.display = (filter === 'all' || tags.includes(filter)) ? 'block' : 'none';
    });
}

// Bind filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter');
        filterProducts(filter, e.target);
    });
});

// Bind footer category links (which also navigate to shop)
document.querySelectorAll('.footer-filter-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const filter = e.currentTarget.getAttribute('data-filter');
        // Update the active state on the shop page filter buttons
        const targetBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
        if (targetBtn) {
            filterProducts(filter, targetBtn);
        }
    });
});

// ── TOAST ──
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

// ── CART MODAL LOGIC ──
const cartModal = document.getElementById('cart-modal');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');

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

document.getElementById('cart-btn').addEventListener('click', (e) => {
    e.preventDefault();
    toggleCart(true);
});

document.getElementById('close-cart').addEventListener('click', () => {
    toggleCart(false);
});

cartOverlay.addEventListener('click', () => {
    toggleCart(false);
});

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('kampalaCart') || '[]');
    const item = products.find(p => p.id === productId);

    if (item) {
        // Simple add: just push the item. (In a real app, check for existing and increment quantity)
        cart.push(item);
        localStorage.setItem('kampalaCart', JSON.stringify(cart));
        updateCartCount();
        showToast('🛒 "' + item.name + '" added to cart! (' + cart.length + ' items)');

        // If modal is open, update it
        if (cartModal.classList.contains('show')) {
            renderCartItems();
        }
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('kampalaCart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('kampalaCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('kampalaCart') || '[]');
    document.getElementById('cart-count').textContent = cart.length;
}

function renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('kampalaCart') || '[]');
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty-msg">Your cart is empty.</div>';
        cartTotalPrice.textContent = 'UGX 0';
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        total += item.priceNum;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${encodeURI(item.image)}" class="cart-item-img" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price}</div>
                <button class="cart-item-remove" data-index="${index}">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    // Format total properly (e.g., 185,000)
    cartTotalPrice.textContent = 'UGX ' + total.toLocaleString();

    // Bind remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            removeFromCart(idx);
        });
    });
}

// ── CONTACT FORM ──
document.getElementById('submit-contact').addEventListener('click', (e) => {
    e.preventDefault(); // prevent form default

    const formData = {
        firstName: document.getElementById('contact-fname').value,
        lastName: document.getElementById('contact-lname').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
        timestamp: new Date().toISOString()
    };

    // Basic validation
    if (!formData.firstName || !formData.email || !formData.message) {
        alert("Please fill in the required fields (First Name, Email, and Message).");
        return;
    }

    let submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    submissions.push(formData);
    localStorage.setItem('formSubmissions', JSON.stringify(submissions));

    // Clear form
    document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select').forEach(el => el.value = '');
    showToast('✅ Message sent! We\'ll reply within 24 hours.');
});

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all others
        document.querySelectorAll('.faq-item.open').forEach(openItem => {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Toggle this one
        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

// ── SITEMAP: Populate Products List ──
const sitemapProductsList = document.getElementById('sitemap-products-list');
if (sitemapProductsList) {
    sitemapProductsList.innerHTML = products.map(p =>
        `<li><a href="#shop">${p.name}</a><span class="sitemap-desc">${p.price} · ${p.tags.join(', ')}</span></li>`
    ).join('');
}

// ── SITEMAP: Category Filter Links ──
document.querySelectorAll('.sitemap-filter-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const filter = e.currentTarget.getAttribute('data-filter');
        const targetBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
        if (targetBtn) {
            filterProducts(filter, targetBtn);
        }
    });
});

// Initialize cart count on load
window.addEventListener('load', updateCartCount);