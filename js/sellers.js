const RAPIDAPI_KEY = '09b371b4dfmshcf7b6354fab5a31p145354jsnefb6f16fda6a';
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com';

let currentSellers = [];
let isLoading = false;

const PREDEFINED_SELLER_IDS = [
    'A2TZN1IAUP0QBX', // basuka
    'A3P8U6BAN7HQM8', // bixemy
    'AEUY6HMIYEDVE',  // Vendedor verificado
    'A14O54VCEHBKPR', // el oso
    'A1NVUB9DYJXLQ7', // Grupo mayoreo torres
    'AJF9O40DRDTWD',  // KUSU GLOBAL
    'A1L8W32ZILL8QP', // Monatik
    'A25WDH4CPLSC8R', // CC Aries
    'A3RSRUV1GKQJTF', // mas refacciones MX
    'A1X6FK5RDHNB96', // Liverpool
    'A1AT7YVPFBWXBL', // Grupo Salinas
    'ATVPDKIKX0DER',  // Amazon México
    'A2Q3Y263D00KWC', // Sears México
    'A3DWYIK6Y9EEQB', // Coppel
    'A2IRV2LM7QEX7C'  // Elektra
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de vendedores ShopMax cargada - Versión corregida');
    initializeEventListeners();
    loadAllSellers();
});

function initializeEventListeners() {
    setupModalEvents();
    setupFilters();
}

function setupModalEvents() {
    const modal = document.getElementById('sellerModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function setupFilters() {
    const ratingFilter = document.getElementById('ratingFilter');
    if (ratingFilter) {
        ratingFilter.addEventListener('change', applyFilters);
    }
    
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter) {
        locationFilter.addEventListener('change', applyFilters);
    }
    
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', applyFilters);
    }
}

async function loadAllSellers() {
    console.log('Cargando vendedores destacados de ShopMax...');
    const allSellers = [
        {
            id: 'tech_seller_1',
            name: 'TechMart Express México',
            rating: '4.8',
            location: 'Ciudad de México',
            totalRatings: 2450,
            positivePercentage: 98,
            verified: true,
            memberSince: '2018',
            category: 'Tecnología',
            specialties: ['Smartphones', 'Laptops', 'Accesorios'],
            products: generateCategoryProducts('tecnologia'),
            isSearchResult: false
        },
        {
            id: 'tech_seller_2',
            name: 'Digital Store Premium',
            rating: '4.7',
            location: 'Guadalajara',
            totalRatings: 1850,
            positivePercentage: 96,
            verified: true,
            memberSince: '2019',
            category: 'Tecnología',
            specialties: ['Gaming', 'Componentes PC', 'Audio'],
            products: generateCategoryProducts('gaming'),
            isSearchResult: false
        },
        {
            id: 'tech_seller_3',
            name: 'Innovación Digital MX',
            rating: '4.6',
            location: 'Monterrey',
            totalRatings: 1650,
            positivePercentage: 95,
            verified: false,
            memberSince: '2020',
            category: 'Tecnología',
            specialties: ['Smartwatches', 'Tablets', 'Cámaras'],
            products: generateCategoryProducts('smart_devices'),
            isSearchResult: false
        },
        {
            id: 'home_seller_1',
            name: 'Casa & Hogar Plus',
            rating: '4.5',
            location: 'Puebla',
            totalRatings: 1200,
            positivePercentage: 93,
            verified: true,
            memberSince: '2017',
            category: 'Hogar y Jardín',
            specialties: ['Electrodomésticos', 'Decoración', 'Jardín'],
            products: generateCategoryProducts('hogar'),
            isSearchResult: false
        },
        {
            id: 'home_seller_2',
            name: 'Espacios Modernos',
            rating: '4.4',
            location: 'Tijuana',
            totalRatings: 980,
            positivePercentage: 92,
            verified: true,
            memberSince: '2021',
            category: 'Hogar y Jardín',
            specialties: ['Muebles', 'Iluminación', 'Textiles'],
            products: generateCategoryProducts('muebles'),
            isSearchResult: false
        },
        {
            id: 'fashion_seller_1',
            name: 'Moda & Estilo México',
            rating: '4.6',
            location: 'Ciudad de México',
            totalRatings: 1750,
            positivePercentage: 94,
            verified: true,
            memberSince: '2019',
            category: 'Moda y Belleza',
            specialties: ['Ropa Mujer', 'Accesorios', 'Belleza'],
            products: generateCategoryProducts('moda'),
            isSearchResult: false
        },
        {
            id: 'fashion_seller_2',
            name: 'Belleza Premium Store',
            rating: '4.7',
            location: 'Guadalajara',
            totalRatings: 1450,
            positivePercentage: 96,
            verified: true,
            memberSince: '2020',
            category: 'Moda y Belleza',
            specialties: ['Cosméticos', 'Perfumes', 'Cuidado Personal'],
            products: generateCategoryProducts('belleza'),
            isSearchResult: false
        },
        {
            id: 'sports_seller_1',
            name: 'FitLife México',
            rating: '4.5',
            location: 'Cancún',
            totalRatings: 1100,
            positivePercentage: 93,
            verified: false,
            memberSince: '2021',
            category: 'Deportes y Salud',
            specialties: ['Fitness', 'Suplementos', 'Equipos'],
            products: generateCategoryProducts('deportes'),
            isSearchResult: false
        },
        {
            id: 'sports_seller_2',
            name: 'Vida Saludable Pro',
            rating: '4.6',
            location: 'Mérida',
            totalRatings: 890,
            positivePercentage: 94,
            verified: true,
            memberSince: '2022',
            category: 'Deportes y Salud',
            specialties: ['Nutrición', 'Yoga', 'Outdoor'],
            products: generateCategoryProducts('salud'),
            isSearchResult: false
        },
        {
            id: 'entertainment_seller_1',
            name: 'GameZone México',
            rating: '4.8',
            location: 'Ciudad de México',
            totalRatings: 2100,
            positivePercentage: 97,
            verified: true,
            memberSince: '2018',
            category: 'Entretenimiento',
            specialties: ['Videojuegos', 'Consolas', 'Accesorios Gaming'],
            products: generateCategoryProducts('videojuegos'),
            isSearchResult: false
        },
        {
            id: 'entertainment_seller_2',
            name: 'Libros & Más',
            rating: '4.4',
            location: 'Querétaro',
            totalRatings: 750,
            positivePercentage: 91,
            verified: false,
            memberSince: '2020',
            category: 'Entretenimiento',
            specialties: ['Libros', 'Música', 'Películas'],
            products: generateCategoryProducts('libros'),
            isSearchResult: false
        },
        {
            id: 'auto_seller_1',
            name: 'AutoPartes Pro México',
            rating: '4.5',
            location: 'Tijuana',
            totalRatings: 1350,
            positivePercentage: 92,
            verified: true,
            memberSince: '2017',
            category: 'Automotriz',
            specialties: ['Refacciones', 'Accesorios Auto', 'Herramientas'],
            products: generateCategoryProducts('automotriz'),
            isSearchResult: false
        },
        {
            id: 'baby_seller_1',
            name: 'Bebé & Mamá Store',
            rating: '4.7',
            location: 'Guadalajara',
            totalRatings: 1580,
            positivePercentage: 95,
            verified: true,
            memberSince: '2019',
            category: 'Bebés y Niños',
            specialties: ['Ropa Bebé', 'Juguetes', 'Cuidado Infantil'],
            products: generateCategoryProducts('bebes'),
            isSearchResult: false
        },
        {
            id: 'pet_seller_1',
            name: 'Mascotas Felices MX',
            rating: '4.6',
            location: 'Monterrey',
            totalRatings: 920,
            positivePercentage: 94,
            verified: false,
            memberSince: '2021',
            category: 'Mascotas',
            specialties: ['Alimento', 'Juguetes', 'Accesorios'],
            products: generateCategoryProducts('mascotas'),
            isSearchResult: false
        },
        {
            id: 'kitchen_seller_1',
            name: 'Cocina Gourmet Plus',
            rating: '4.8',
            location: 'Ciudad de México',
            totalRatings: 1890,
            positivePercentage: 97,
            verified: true,
            memberSince: '2018',
            category: 'Cocina',
            specialties: ['Utensilios', 'Electrodomésticos', 'Ingredientes'],
            products: generateCategoryProducts('cocina'),
            isSearchResult: false
        }
    ];

    currentSellers = allSellers;
    displayAllSellers();
    
    console.log(`${currentSellers.length} vendedores cargados exitosamente`);
    showNotification(`¡${currentSellers.length} vendedores destacados cargados!`, 'success');
}

function generateCategoryProducts(category) {
    const productCategories = {
        'tecnologia': [
            { name: 'iPhone 15 Pro Max 256GB', price: 28999, rating: '4.8', asin: 'B0CHX2F5QT' },
            { name: 'Samsung Galaxy S24 Ultra', price: 24999, rating: '4.7', asin: 'B0CMDRCZBX' },
            { name: 'MacBook Air M3 13"', price: 32999, rating: '4.9', asin: 'B0CX23V2ZK' },
            { name: 'iPad Pro 12.9" M2', price: 26999, rating: '4.8', asin: 'B0BJLXMZ6T' }
        ],
        'gaming': [
            { name: 'PlayStation 5 Standard', price: 12999, rating: '4.9', asin: 'B08H95Y452' },
            { name: 'Xbox Series X', price: 11999, rating: '4.8', asin: 'B08H75RTZ8' },
            { name: 'Nintendo Switch OLED', price: 8999, rating: '4.7', asin: 'B098RKWHHZ' },
            { name: 'Control Xbox Elite Series 2', price: 3999, rating: '4.6', asin: 'B07SFKTLZM' }
        ],
        'smart_devices': [
            { name: 'Apple Watch Ultra 2', price: 18999, rating: '4.8', asin: 'B0CHX8SZQS' },
            { name: 'Samsung Galaxy Watch 6', price: 7999, rating: '4.6', asin: 'B0C7B8XRQD' },
            { name: 'iPad Air 5ta Gen', price: 15999, rating: '4.7', asin: 'B09V3HN1KC' },
            { name: 'AirPods Pro 2da Gen', price: 5999, rating: '4.8', asin: 'B0BDHWDR12' }
        ],
        'hogar': [
            { name: 'Refrigerador Samsung 28 pies', price: 18999, rating: '4.5', asin: 'B08GKQCXW9' },
            { name: 'Lavadora LG TurboWash', price: 12999, rating: '4.4', asin: 'B07VQXK4L8' },
            { name: 'Aspiradora Robot Roomba', price: 8999, rating: '4.6', asin: 'B07R5V4X9R' },
            { name: 'Cafetera Nespresso Vertuo', price: 3999, rating: '4.7', asin: 'B077HBQZPX' }
        ],
        'muebles': [
            { name: 'Sofá Seccional Moderno', price: 15999, rating: '4.3', asin: 'B08JCPRM2G' },
            { name: 'Mesa de Comedor 6 personas', price: 8999, rating: '4.4', asin: 'B08KH7Y8M9' },
            { name: 'Colchón Queen Memory Foam', price: 12999, rating: '4.5', asin: 'B075FVK8K4' },
            { name: 'Escritorio Gaming RGB', price: 6999, rating: '4.2', asin: 'B08BHKZQRX' }
        ],
        'moda': [
            { name: 'Reloj Apple Watch SE', price: 6999, rating: '4.4', asin: 'B0BDHB9Y8L' },
            { name: 'Tenis Nike Air Force 1', price: 2799, rating: '4.7', asin: 'B07XQXZXJK' },
            { name: 'Mochila Nike Deportiva', price: 1299, rating: '4.5', asin: 'B083DPKM89' },
            { name: 'Gorra Adidas Original', price: 599, rating: '4.3', asin: 'B07QXBHF3R' }
        ],
        'belleza': [
            { name: 'Plancha Cabello Dyson', price: 12999, rating: '4.9', asin: 'B0B86XVJHG' },
            { name: 'Set Skincare CeraVe', price: 2999, rating: '4.6', asin: 'B078K3WP9T' },
            { name: 'Perfume Versace Eros', price: 3599, rating: '4.8', asin: 'B00J5LXYY6' },
            { name: 'Maquillaje Urban Decay', price: 4999, rating: '4.7', asin: 'B07K7DQZQM' }
        ],
        'deportes': [
            { name: 'Bicicleta MTB Specialized', price: 18999, rating: '4.7', asin: 'B08XQPZ5M2' },
            { name: 'Set Pesas Ajustables', price: 8999, rating: '4.5', asin: 'B07P8QHQXZ' },
            { name: 'Tenis Running Adidas', price: 2899, rating: '4.6', asin: 'B08FZX3H8R' },
            { name: 'Proteína Whey Gold Standard', price: 1599, rating: '4.8', asin: 'B000QSTBNS' }
        ],
        'salud': [
            { name: 'Colchón Memory Foam King', price: 12999, rating: '4.5', asin: 'B075FVK8K4' },
            { name: 'Purificador Aire HEPA', price: 6999, rating: '4.6', asin: 'B07VVK39F7' },
            { name: 'Báscula Inteligente Xiaomi', price: 899, rating: '4.4', asin: 'B07DFZ5KQM' },
            { name: 'Masajeador Percusión', price: 3299, rating: '4.3', asin: 'B07R4X6FZJ' }
        ],
        'videojuegos': [
            { name: 'The Legend of Zelda TOTK', price: 1399, rating: '4.9', asin: 'B0BVQ4FZ8G' },
            { name: 'FIFA 24 Xbox Series X', price: 1899, rating: '4.3', asin: 'B0C6J7J9KG' },
            { name: 'God of War Ragnarök PS5', price: 1699, rating: '4.8', asin: 'B0B1H4BFHX' },
            { name: 'Mario Kart 8 Deluxe Switch', price: 1299, rating: '4.7', asin: 'B01N1037CV' }
        ],
        'libros': [
            { name: 'Atomic Habits - James Clear', price: 599, rating: '4.8', asin: 'B01N5AX61W' },
            { name: 'Cien Años de Soledad', price: 399, rating: '4.9', asin: 'B00AP1NGJQ' },
            { name: 'El Arte de la Guerra', price: 299, rating: '4.6', asin: 'B00GQLR0G0' },
            { name: 'Sapiens - Yuval Harari', price: 699, rating: '4.7', asin: 'B00LDDOYFG' }
        ],
        'automotriz': [
            { name: 'Filtro de Aceite K&N', price: 299, rating: '4.4', asin: 'B000C9TEBC' },
            { name: 'Llantas Michelin 225/60R16', price: 8999, rating: '4.7', asin: 'B01MXVO3NY' },
            { name: 'Batería Bosch S5', price: 2599, rating: '4.5', asin: 'B07XKPKQX8' },
            { name: 'Kit Herramientas Stanley', price: 1899, rating: '4.6', asin: 'B000LDKFW2' }
        ],
        'bebes': [
            { name: 'Carriola Graco 3-en-1', price: 4999, rating: '4.7', asin: 'B07PJVX8Y9' },
            { name: 'Monitor Bebé Motorola', price: 2299, rating: '4.6', asin: 'B07NVXGN4T' },
            { name: 'Silla Auto Chicco', price: 3999, rating: '4.5', asin: 'B07L9NQKFX' },
            { name: 'Pañales Huggies Talla 3', price: 899, rating: '4.4', asin: 'B075Q7DGDL' }
        ],
        'mascotas': [
            { name: 'Alimento Premium Perro Royal Canin', price: 1299, rating: '4.6', asin: 'B00DKLY87M' },
            { name: 'Casa para Perro Grande', price: 2999, rating: '4.5', asin: 'B07BQDV3R2' },
            { name: 'Juguetes Kong para Perro', price: 599, rating: '4.4', asin: 'B0002AR0I8' },
            { name: 'Arena Gato World\'s Best', price: 399, rating: '4.3', asin: 'B000084E1B' }
        ],
        'cocina': [
            { name: 'Olla Express Presto 8L', price: 1899, rating: '4.6', asin: 'B00006ISG6' },
            { name: 'Licuadora Vitamix A3500', price: 8999, rating: '4.8', asin: 'B077HBQZPX' },
            { name: 'Set Cuchillos Wüsthof', price: 2599, rating: '4.7', asin: 'B00005MEX7' },
            { name: 'Freidora de Aire Ninja', price: 3999, rating: '4.5', asin: 'B07VBR68KD' }
        ]
    };
    
    const categoryProducts = productCategories[category] || productCategories['tecnologia'];
    
    return categoryProducts.map(product => ({
        title: product.name,
        price: `$${product.price.toLocaleString()}.00`,
        image: null,
        url: `https://www.amazon.com.mx/dp/${product.asin}`,  // URL CORREGIDA
        rating: product.rating,
        asin: product.asin,
        availability: Math.random() > 0.1 ? 'Disponible' : 'Stock limitado',
        seller_id: PREDEFINED_SELLER_IDS[Math.floor(Math.random() * PREDEFINED_SELLER_IDS.length)],
        category: category
    }));
}

function displayAllSellers() {
    const container = document.querySelector('.sellers-list');
    if (!container) return;
    container.innerHTML = '';
    currentSellers.forEach(seller => {
        const sellerCard = createEnhancedSellerCard(seller);
        container.appendChild(sellerCard);
    });
}

function createEnhancedSellerCard(seller) {
    const card = document.createElement('div');
    card.className = 'seller-card enhanced';
    card.setAttribute('data-seller-id', seller.id);
    
    const topProducts = seller.products.slice(0, 3);
    const productsList = topProducts.length > 0 ? 
        topProducts.map(product => 
            `<li title="${product.title}" data-price="${product.price}">
                <span class="product-name">${truncateText(product.title, 35)}</span>
                <span class="product-price">${product.price}</span>
            </li>`
        ).join('') : 
        '<li>No hay productos disponibles</li>';
    
    const logoUrl = generateLocalAvatar(seller.name);
    const verifiedBadge = seller.verified ? '<span class="verified-badge">✓ Verificado</span>' : '';
    const categoryBadge = `<span class="category-badge">${seller.category}</span>`;
    
    card.innerHTML = `
        <div class="seller-card-header">
            <img src="${logoUrl}" alt="Logo de ${seller.name}" class="seller-logo">
            <div class="seller-badges">
                ${categoryBadge}
                ${verifiedBadge}
            </div>
        </div>
        <h2 title="${seller.name}">${truncateText(seller.name, 28)}</h2>
        <div class="seller-specialties">
            <strong>Especialidades:</strong> ${seller.specialties.join(', ')}
        </div>
        <div class="seller-info">
            <div class="info-row">
                <span>📍 ${seller.location}</span>
                <span>📅 Miembro desde ${seller.memberSince}</span>
            </div>
            <div class="info-row">
                <span class="seller-rating">⭐ ${seller.rating}/5 (${seller.totalRatings.toLocaleString()})</span>
                <span class="positive-percentage">👍 ${seller.positivePercentage}%</span>
            </div>
            <div class="info-row">
                <span><strong>📦 ${seller.products.length} productos</strong></span>
            </div>
        </div>
        <div class="top-products">
            <p><strong>🏆 Productos destacados:</strong></p>
            <ul class="products-preview">${productsList}</ul>
        </div>
        <div class="seller-actions">
            <button class="view-products primary-btn" onclick="showSellerInfo('${seller.id}')" 
                    ${seller.products.length === 0 ? 'disabled' : ''}>
                Ver catálogo completo
            </button>
        </div>
    `;
    
    return card;
}

async function showSellerInfo(sellerId) {
    const modal = document.getElementById('sellerModal');
    const sellerName = document.getElementById('sellerName');
    const productList = document.getElementById('productList');
    
    if (!modal || !sellerName || !productList) {
        console.error('Elementos del modal no encontrados');
        return;
    }

    let seller = currentSellers.find(s => s.id === sellerId);
    
    if (!seller) {
        console.log('Vendedor no encontrado:', sellerId);
        showNotification('Información del vendedor no disponible', 'error');
        return;
    }

    console.log('Mostrando información del vendedor:', seller);

    sellerName.innerHTML = `
        <div class="modal-seller-header">
            <img src="${generateLocalAvatar(seller.name)}" alt="Logo" class="modal-seller-logo">
            <div class="modal-seller-info">
                <h2>${seller.name}</h2>
                <div class="modal-seller-badges">
                    <span class="category-badge">${seller.category}</span>
                    ${seller.verified ? '<span class="verified-badge">✓ Verificado</span>' : ''}
                </div>
                <div class="modal-seller-stats">
                    <span>⭐ ${seller.rating}/5 (${seller.totalRatings.toLocaleString()})</span>
                    <span>📍 ${seller.location}</span>
                    <span>📅 Desde ${seller.memberSince}</span>
                </div>
                <div class="modal-seller-specialties">
                    <strong>Especialidades:</strong> ${seller.specialties.join(', ')}
                </div>
            </div>
        </div>
    `;
    displayModalProducts(seller.products);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function displayModalProducts(products) {
    const productList = document.getElementById('productList');
    
    if (products.length === 0) {
        productList.innerHTML = '<div class="no-products">No hay productos disponibles</div>';
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="product-item-modal">
            <div class="product-info">
                <h4 class="product-title">${product.title}</h4>
                <div class="product-details">
                    <span class="product-price">${product.price}</span>
                    <span class="product-rating">⭐ ${product.rating}</span>
                    <span class="product-availability">${product.availability}</span>
                </div>
            </div>
        <div class="product-actions">
            <a href="${product.url}" target="_blank" rel="noopener noreferrer" class="btn-accent">
            Ver en Amazon
            </a>
       </div>

        </div>
    `).join('');
}

function closeModal() {
    const modal = document.getElementById('sellerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function contactSeller(sellerId) {
    const seller = currentSellers.find(s => s.id === sellerId);
    if (seller) {
        showNotification(`Función de contacto con ${seller.name} próximamente disponible`, 'info');
    }
}

function addToCart(asin, title, price) {
    showNotification(`${truncateText(title, 30)} agregado al carrito`, 'success');
    console.log('Producto agregado:', { asin, title, price });
}

function generateLocalAvatar(name) {
    const initials = name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
    const color = colors[name.length % colors.length];
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(40, 40, 40, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 40, 40);
    
    return canvas.toDataURL();
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

function applyFilters() {
    const ratingFilter = document.getElementById('ratingFilter')?.value || 'all';
    const locationFilter = document.getElementById('locationFilter')?.value || 'all';
    const sortBy = document.getElementById('sortBy')?.value || 'rating';
    
    let filteredSellers = [...currentSellers];
    if (ratingFilter !== 'all') {
        const minRating = parseFloat(ratingFilter);
        filteredSellers = filteredSellers.filter(seller => parseFloat(seller.rating) >= minRating);
    }
    
    if (locationFilter !== 'all') {
        filteredSellers = filteredSellers.filter(seller => 
            seller.location.toLowerCase().includes(locationFilter.toLowerCase())
        );
    }
    
    filteredSellers.sort((a, b) => {
        switch (sortBy) {
            case 'rating':
                return parseFloat(b.rating) - parseFloat(a.rating);
            case 'reviews':
                return b.totalRatings - a.totalRatings;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'location':
                return a.location.localeCompare(b.location);
            default:
                return 0;
        }
    });

    displayFilteredSellers(filteredSellers);

    if (filteredSellers.length === 0) {
        showNotification('No se encontraron vendedores con los filtros aplicados', 'info');
    }
}

function displayFilteredSellers(sellers) {
    const container = document.querySelector('.sellers-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (sellers.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No se encontraron vendedores</h3>
                <p>Intenta ajustar los filtros para ver más resultados</p>
                <button onclick="clearFilters()" class="primary-btn">Limpiar filtros</button>
            </div>
        `;
        return;
    }
    
    sellers.forEach(seller => {
        const sellerCard = createEnhancedSellerCard(seller);
        container.appendChild(sellerCard);
    });
}

function clearFilters() {
    const ratingFilter = document.getElementById('ratingFilter');
    const locationFilter = document.getElementById('locationFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (ratingFilter) ratingFilter.value = 'all';
    if (locationFilter) locationFilter.value = 'all';
    if (sortBy) sortBy.value = 'rating';
    displayAllSellers();
    showNotification('Filtros limpiados', 'success');
}

function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">×</button>
        </div>
    `;
    
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    return icons[type] || icons.info;
}

function closeNotification(closeBtn) {
    const notification = closeBtn.closest('.notification');
    if (notification) {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}


function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayAllSellers();
        return;
    }
    
    const filteredSellers = currentSellers.filter(seller => {
        return seller.name.toLowerCase().includes(searchTerm) ||
               seller.category.toLowerCase().includes(searchTerm) ||
               seller.location.toLowerCase().includes(searchTerm) ||
               seller.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm)) ||
               seller.products.some(product => product.title.toLowerCase().includes(searchTerm));
    });
    
    displayFilteredSellers(filteredSellers);
    
    if (filteredSellers.length > 0) {
        showNotification(`${filteredSellers.length} vendedor(es) encontrado(s)`, 'success');
    } else {
        showNotification('No se encontraron vendedores que coincidan con tu búsqueda', 'info');
    }
}

function updateStats() {
    const totalSellers = currentSellers.length;
    const verifiedSellers = currentSellers.filter(s => s.verified).length;
    const avgRating = (currentSellers.reduce((sum, s) => sum + parseFloat(s.rating), 0) / totalSellers).toFixed(1);
    const totalProducts = currentSellers.reduce((sum, s) => sum + s.products.length, 0);

    const statsElements = {
        'totalSellers': totalSellers,
        'verifiedSellers': verifiedSellers,
        'avgRating': avgRating,
        'totalProducts': totalProducts
    };
    
    Object.entries(statsElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

document.addEventListener('DOMContentLoaded', function() {
    setupSearchFunctionality();
    setTimeout(lazyLoadImages, 1000);
    setTimeout(updateStats, 2000);
    
    console.log('ShopMax Vendedores completamente inicializado');
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.ShopMaxSellers = {
    loadAllSellers,
    showSellerInfo,
    applyFilters,
    clearFilters,
    handleSearch,
    contactSeller
};