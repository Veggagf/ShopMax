const API_CONFIG = {
    baseURL: 'https://real-time-amazon-data.p.rapidapi.com',
    headers: {
        'X-RapidAPI-Key': '65c9f687acmsh1f46c6ec6f2f10ap14d6c5jsnf43a816b1de5', // Tu API key
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
    }
};

let currentSlides = {
    tech: 0,
    gaming: 0,
    lifestyle: 0
};

const itemsPerPage = 3;
async function searchAmazonProducts(query, options = {}) {
    const {
        country = 'MX',
        category = 'aps',
        page = 1,
        sortBy = 'RELEVANCE',
        minPrice = null,
        maxPrice = null
    } = options;

    const searchParams = new URLSearchParams({
        query: query,
        country: country,
        category_id: category,
        page: page.toString(),
        sort_by: sortBy
    });

    if (minPrice) searchParams.append('min_price', minPrice.toString());
    if (maxPrice) searchParams.append('max_price', maxPrice.toString());

    try {
        console.log('Realizando búsqueda con parámetros:', Object.fromEntries(searchParams));
        const response = await fetch(`${API_CONFIG.baseURL}/search?${searchParams.toString()}`, {
            method: 'GET',
            headers: API_CONFIG.headers
        });

        console.log('Status de respuesta:', response.status);
        console.log('URL completa:', `${API_CONFIG.baseURL}/search?${searchParams.toString()}`);

        if (!response.ok) {
            console.error(`Error ${response.status}: ${response.statusText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Respuesta de la API:', data);

        return processSearchResults(data);

    } catch (error) {
        console.error('Error en la búsqueda de productos:', error);
        console.log('Usando datos de demostración...');
        return getDemoProducts(query);
    }
}

async function getProductDetails(asin, country = 'MX') {
    try {
        const searchParams = new URLSearchParams({
            asin: asin,
            country: country
        });

        const response = await fetch(`${API_CONFIG.baseURL}/product-details?${searchParams.toString()}`, {
            method: 'GET', 
            headers: API_CONFIG.headers
        });

        console.log('Status de respuesta para detalles:', response.status);

        if (!response.ok) {
            console.error(`Error ${response.status}: ${response.statusText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return processProductDetails(data);

    } catch (error) {
        console.error('Error al obtener detalles del producto:', error);
        console.log('Usando detalles de demostración...');
        return getDemoProductDetails(asin);
    }
}

async function searchAmazonProductsAlternative(query, options = {}) {
    const endpoints = [
        '/search',
        '/products/search',
        '/amazon/search',
        '/v1/search'
    ];

    for (const endpoint of endpoints) {
        try {
            const searchParams = new URLSearchParams({
                query: query,
                country: options.country || 'US'
            });

            console.log(`Intentando endpoint: ${endpoint}`);
            
            const response = await fetch(`${API_CONFIG.baseURL}${endpoint}?${searchParams.toString()}`, {
                method: 'GET',
                headers: API_CONFIG.headers
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`Éxito con endpoint: ${endpoint}`);
                return processSearchResults(data);
            } else {
                console.log(`Falló endpoint ${endpoint}: ${response.status}`);
            }
        } catch (error) {
            console.log(`Error en endpoint ${endpoint}:`, error.message);
        }
    }
    console.log('Todos los endpoints fallaron, usando datos demo');
    return getDemoProducts(query);
}

function processSearchResults(data) {
    console.log('Procesando datos:', data);

    let products = [];
    
    if (data && data.data && data.data.products) {
        products = data.data.products;
    } else if (data && data.products) {
        products = data.products;
    } else if (data && Array.isArray(data)) {
        products = data;
    } else if (data && data.results) {
        products = data.results;
    }

    if (!Array.isArray(products) || products.length === 0) {
        console.warn('No se encontraron productos en la respuesta:', data);
        return [];
    }

    return products.map((product, index) => ({
        asin: product.asin || product.id || `demo_${index}`,
        title: product.product_title || product.title || product.name || 'Producto sin título',
        url: product.product_url || product.url || product.link || '',
        image: product.product_photo || product.image || product.product_image || product.thumbnail || '/img/no-image.png',
        price: {
            current: product.product_price || product.price || product.current_price || 'N/A',
            original: product.product_original_price || product.original_price || product.list_price || null
        },
        rating: {
            value: product.product_star_rating || product.rating || product.stars || 0,
            count: product.product_num_ratings || product.reviews_count || product.review_count || 0
        },
        sponsored: product.is_sponsored || product.sponsored || false,
        delivery: product.delivery || product.shipping || null,
        primeEligible: product.is_prime || product.prime || false
    }));
}

function processProductDetails(data) {
    console.log('Procesando detalles:', data);
    
    if (!data) return null;
    const product = data.data || data.product || data;
    
    if (!product) return null;
    const processFeatures = (features) => {
        if (!features) return [];
        
        if (Array.isArray(features)) {
            return features;
        }
        
        if (typeof features === 'object') {
            return Object.entries(features).map(([key, value]) => `${key}: ${value}`);
        }
        
        if (typeof features === 'string') {
            return features.split(/[,\n]/).map(f => f.trim()).filter(f => f.length > 0);
        }
        
        return [];
    };

    return {
        asin: product.asin || product.id,
        title: product.product_title || product.title || product.name,
        url: product.product_url || product.url || product.link,
        image: (product.product_photos && product.product_photos[0]) || 
               product.product_photo || product.image || product.thumbnail || '/img/no-image.png',
        images: product.product_photos || product.images || [],
        price: {
            current: product.product_price || product.price || product.current_price,
            original: product.product_original_price || product.original_price
        },
        rating: {
            value: product.product_star_rating || product.rating || product.stars,
            count: product.product_num_ratings || product.reviews_count
        },
        description: product.product_description || product.description || product.about,
        features: processFeatures(product.product_information || product.features || product.key_features),
        availability: product.product_availability || product.availability || product.stock_status,
        brand: product.brand || product.manufacturer,
        category: product.category || product.department,
        specifications: product.product_details || product.specifications || product.details || {}
    };
}

// Datos de demostración (con imágenes mejoradas)
function getDemoProducts(query) {
    const demoProducts = [
        {
            asin: 'B0CHX1W2K3',
            title: `${query} - Producto Premium de Alta Calidad`,
            url: 'https://amazon.com/dp/B0CHX1W2K3',
            image: 'https://via.placeholder.com/400x400/4a90e2/ffffff?text=Premium+Product',
            price: {
                current: '$99.99',
                original: '$149.99'
            },
            rating: {
                value: 4.5,
                count: 1250
            },
            sponsored: false,
            primeEligible: true
        },
        {
            asin: 'B0CHX1W2K4',
            title: `${query} Profesional - Edición Especial`,
            url: 'https://amazon.com/dp/B0CHX1W2K4',
            image: 'https://via.placeholder.com/400x400/50c878/ffffff?text=Professional+Edition',
            price: {
                current: '$159.99',
                original: '$199.99'
            },
            rating: {
                value: 4.7,
                count: 850
            },
            sponsored: true,
            primeEligible: true
        },
        {
            asin: 'B0CHX1W2K5',
            title: `${query} Básico - Mejor Precio`,
            url: 'https://amazon.com/dp/B0CHX1W2K5',
            image: 'https://via.placeholder.com/400x400/ff6b6b/ffffff?text=Basic+Version',
            price: {
                current: '$49.99'
            },
            rating: {
                value: 4.2,
                count: 450
            },
            sponsored: false,
            primeEligible: false
        }
    ];

    return demoProducts;
}

function getDemoProductDetails(asin) {
    return {
        asin: asin,
        title: 'Producto de Demostración - Alta Calidad',
        url: 'https://amazon.com/dp/' + asin,
        image: 'https://via.placeholder.com/500x500/4a90e2/ffffff?text=Demo+Product',
        images: [
            'https://via.placeholder.com/500x500/4a90e2/ffffff?text=Demo+Product',
            'https://via.placeholder.com/500x500/50c878/ffffff?text=View+2',
            'https://via.placeholder.com/500x500/ff6b6b/ffffff?text=View+3'
        ],
        price: {
            current: '$99.99',
            original: '$149.99'
        },
        rating: {
            value: 4.5,
            count: 1250
        },
        description: 'Este es un producto de demostración con características excepcionales y calidad premium. Diseñado para satisfacer las necesidades más exigentes.',
        features: [
            'Construcción de alta calidad con materiales premium',
            'Diseño moderno y elegante',
            'Interfaz intuitiva y fácil de usar',
            'Garantía extendida de 2 años',
            'Envío gratuito con Amazon Prime'
        ],
        availability: 'En stock',
        brand: 'DemoMarca',
        category: 'Electrónicos',
        specifications: {
            'Dimensiones': '15.2 x 10.5 x 2.8 cm',
            'Peso': '450g',
            'Material': 'Aluminio premium',
            'Color': 'Gris espacial',
            'Garantía': '2 años'
        }
    };
}

function toggleCarousels(show) {
    const carouselSections = document.querySelectorAll('.carousel-section, .hero-products');
    carouselSections.forEach(section => {
        if (show) {
            section.style.display = 'block';
            section.classList.add('fade-in');
        } else {
            section.style.display = 'none';
            section.classList.remove('fade-in');
        }
    });
}

function toggleResultsSection(show) {
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        if (show) {
            resultsSection.style.display = 'block';
            resultsSection.classList.add('fade-in');
        } else {
            resultsSection.style.display = 'none';
            resultsSection.classList.remove('fade-in');
        }
    }
}

window.searchProducts = async function(query) {
    if (!query || query.trim() === '') {
        showError('Por favor ingresa un término de búsqueda');
        return;
    }

    const searchBtn = document.getElementById('searchBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const searchLoading = document.getElementById('searchLoading');
    const productsContainer = document.getElementById('productsContainer');

    try {
        toggleCarousels(false);
        toggleResultsSection(true);
        
        searchBtn.disabled = true;
        loadingSpinner.style.display = 'inline-block';
        searchLoading.style.display = 'block';
        productsContainer.innerHTML = '';

        console.log('Buscando productos para:', query);
        
        let products = await searchAmazonProducts(query);
        
        if (!products || products.length === 0) {
            console.log('Intentando método alternativo...');
            products = await searchAmazonProductsAlternative(query);
        }
        
        if (products && products.length > 0) {
            displayProducts(products);
            document.getElementById('results').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            showNoResults();
        }

    } catch (error) {
        console.error('Error en la búsqueda:', error);
        showError('Ocurrió un error al buscar productos. Mostrando productos de demostración.');
        const demoProducts = getDemoProducts(query);
        displayProducts(demoProducts);
    } finally {
        searchBtn.disabled = false;
        loadingSpinner.style.display = 'none';
        searchLoading.style.display = 'none';
    }
};

window.clearSearch = function() {
    const searchInput = document.getElementById('searchInput');
    const productsContainer = document.getElementById('productsContainer');
    
    searchInput.value = '';
    productsContainer.innerHTML = '';
    
    toggleCarousels(true);
    toggleResultsSection(false);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.viewProduct = function(productId) {
    const productMap = {
        'iphone15': 'iPhone 15 Pro Max',
        'macbook': 'MacBook Pro M3',
        'airpods': 'AirPods Pro 2',
        'watch': 'Apple Watch Ultra 2',
        'camera': 'Canon EOS R6 Mark II',
        'imac': 'iMac 24 M3',
        'ps5pro': 'PlayStation 5 Pro',
        'xbox': 'Xbox Series X',
        'switch': 'Nintendo Switch OLED',
        'mouse': 'Logitech G Pro X',
        'keyboard': 'Razer BlackWidow V4',
        'headset': 'SteelSeries Arctis 7P+',
        'jordan': 'Nike Air Jordan 4',
        'hoodie': 'Hoodie',
        'rayban': 'Ray-Ban Aviator Classic',
        'watchband': 'Correa Apple Watch Sport',
        'levis': 'Levi\'s 501 Original',
        'adidas': 'Adidas Ultraboost 22'
    };

    const productName = productMap[productId];
    if (productName) {
        document.getElementById('searchInput').value = productName;
        window.searchProducts(productName);
    }
};

window.viewProductDetails = async function(productId) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('productDetails');
    
    try {
        modal.style.display = 'block';
        modalContent.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando detalles del producto...</p>
            </div>
        `;
        
        console.log('Cargando detalles para:', productId);
        
        const details = await getProductDetails(productId);
        
        console.log('Detalles obtenidos:', details);
        
        if (details) {
            displayProductDetails(details);
        } else {
            modalContent.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>No se pudieron cargar los detalles</h3>
                    <p>Intenta nuevamente más tarde</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        modalContent.innerHTML = `
            <div class="error-message">
                <div class="error-icon">⚠️</div>
                <h3>Error al cargar detalles</h3>
                <p>Ocurrió un problema al obtener la información del producto</p>
                <p><small>Error: ${error.message}</small></p>
            </div>
        `;
    }
};

window.nextSlide = function(carouselType) {
    const carousel = document.getElementById(`${carouselType}Carousel`);
    const totalItems = carousel.children.length;
    const maxSlide = Math.ceil(totalItems / itemsPerPage) - 1;
    
    currentSlides[carouselType] = (currentSlides[carouselType] + 1) % (maxSlide + 1);
    updateCarousel(carouselType);
};

window.prevSlide = function(carouselType) {
    const carousel = document.getElementById(`${carouselType}Carousel`);
    const totalItems = carousel.children.length;
    const maxSlide = Math.ceil(totalItems / itemsPerPage) - 1;
    
    currentSlides[carouselType] = currentSlides[carouselType] === 0 ? maxSlide : currentSlides[carouselType] - 1;
    updateCarousel(carouselType);
};

window.goToSlide = function(carouselType, slideIndex) {
    currentSlides[carouselType] = slideIndex;
    updateCarousel(carouselType);
};

window.openAmazonLink = function(url) {
    if (url && url !== '') {
        window.open(url, '_blank');
    } else {
        showError('Enlace no disponible');
    }
};

window.loadPage = function(page) {
    const pages = {
        'home': 'index.html',
        'product': 'products.html',
        'sellers': 'sellers.html',
        'influencers': 'influencers.html'
    };
    
    if (pages[page]) {
        window.location.href = pages[page];
    }
};

window.handleImageError = function(img) {
    img.src = 'https://via.placeholder.com/400x400/e1e1e1/666666?text=Imagen+No+Disponible';
    img.onerror = null;
};


function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    products.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        container.appendChild(productCard);
    });
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card enhanced-card';
    card.setAttribute('data-index', index);

    const price = formatPrice(product.price);
    const rating = formatRating(product.rating);
    const image = product.image || 'https://via.placeholder.com/400x400/e1e1e1/666666?text=Imagen+No+Disponible';
    const title = truncateText(product.title || 'Producto sin título', 80);

    card.innerHTML = `
        <div class="product-image-container">
            <img src="${image}" alt="${title}" class="product-image-enhanced" onerror="handleImageError(this)">
            ${product.sponsored ? '<div class="sponsored-badge">Patrocinado</div>' : ''}
            ${product.primeEligible ? '<div class="prime-badge">Prime</div>' : ''}
        </div>
        <div class="product-info-enhanced">
            <h3 class="product-title-enhanced">${title}</h3>
            <div class="product-rating-enhanced">
                ${rating.stars}
                <span class="rating-text">${rating.text}</span>
            </div>
            <div class="product-price-enhanced">
                <span class="current-price">${price.current}</span>
                ${price.original ? `<span class="original-price">${price.original}</span>` : ''}
            </div>
            <div class="product-actions-enhanced">
                <button class="btn-primary-enhanced" onclick="viewProductDetails('${product.asin || index}')">
                    <i class="icon-detail">🔍</i> Ver Detalles
                </button>
                <button class="btn-secondary-enhanced" onclick="openAmazonLink('${product.url || ''}')">
                    <i class="icon-amazon">🛒</i> Ver en Amazon
                </button>
            </div>
        </div>
    `;

    return card;
}

function displayProductDetails(product) {
    const modalContent = document.getElementById('productDetails');
    const price = formatPrice(product.price);
    const rating = formatRating(product.rating);
    const formatFeatures = (features) => {
        if (!features) return '';
        
        if (Array.isArray(features)) {
            return features.map(f => `<li><i class="feature-icon">✓</i>${f}</li>`).join('');
        }

        if (typeof features === 'object') {
            return Object.entries(features).map(([key, value]) => 
                `<li><i class="feature-icon">✓</i><strong>${key}:</strong> ${value}</li>`
            ).join('');
        }
        
        if (typeof features === 'string') {
            return `<li><i class="feature-icon">✓</i>${features}</li>`;
        }
        
        return '';
    };

    const formatSpecifications = (specs) => {
        if (!specs || typeof specs !== 'object') return '';
        
        return Object.entries(specs).map(([key, value]) => 
            `<div class="spec-item">
                <span class="spec-label">${key}:</span>
                <span class="spec-value">${value}</span>
            </div>`
        ).join('');
    };

    modalContent.innerHTML = `
        <div class="product-detail-enhanced">
            <div class="detail-header">
                <div class="detail-image-container">
                    <img src="${product.image || 'https://via.placeholder.com/500x500/e1e1e1/666666?text=Imagen+No+Disponible'}" 
                         alt="${product.title}" class="detail-image-enhanced" onerror="handleImageError(this)">
                    ${product.images && product.images.length > 1 ? `
                        <div class="image-thumbnails">
                            ${product.images.slice(0, 4).map((img, i) => 
                                `<img src="${img}" alt="Vista ${i+1}" class="thumbnail" onclick="changeMainImage('${img}')" onerror="handleImageError(this)">`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="detail-info-enhanced">
                    <h2 class="detail-title">${product.title || 'Producto'}</h2>
                    ${product.brand ? `<div class="detail-brand"><strong>Marca:</strong> ${product.brand}</div>` : ''}
                    
                    <div class="detail-rating-enhanced">
                        <div class="rating-stars">${rating.stars}</div>
                        <span class="rating-count">${rating.text}</span>
                    </div>
                    
                    <div class="detail-price-enhanced">
                        <span class="current-price-large">${price.current}</span>
                        ${price.original ? `<span class="original-price-large">${price.original}</span>` : ''}
                    </div>
                    
                    ${product.availability ? `
                        <div class="availability-badge ${product.availability.toLowerCase().includes('stock') ? 'in-stock' : 'out-stock'}">
                            ${product.availability}
                        </div>
                    ` : ''}
                    
                    <div class="detail-actions-enhanced">
                        <button class="btn-buy-now" onclick="openAmazonLink('${product.url || ''}')">
                            <i class="icon-cart">🛒</i> Comprar en Amazon
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="detail-body">
                <div class="detail-tabs">
                    <button class="tab-button active" onclick="showTab('description')">Descripción</button>
                    ${product.features ? '<button class="tab-button" onclick="showTab(\'features\')">Características</button>' : ''}
                    ${Object.keys(product.specifications || {}).length > 0 ? '<button class="tab-button" onclick="showTab(\'specs\')">Especificaciones</button>' : ''}
                </div>
                
                <div class="tab-content">
                    <div id="description-tab" class="tab-pane active">
                        <div class="detail-description-enhanced">
                            <p>${product.description || 'Descripción no disponible'}</p>
                        </div>
                    </div>
                    
                    ${product.features ? `
                        <div id="features-tab" class="tab-pane">
                            <div class="detail-features-enhanced">
                                <ul class="features-list">
                                    ${formatFeatures(product.features)}
                                </ul>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${Object.keys(product.specifications || {}).length > 0 ? `
                        <div id="specs-tab" class="tab-pane">
                            <div class="detail-specifications">
                                ${formatSpecifications(product.specifications)}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

window.changeMainImage = function(imageSrc) {
    const mainImage = document.querySelector('.detail-image-enhanced');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
};

window.showTab = function(tabName) {
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    event.target.classList.add('active');
};

function updateCarousel(carouselType) {
    const carousel = document.getElementById(`${carouselType}Carousel`);
    const translateX = -(currentSlides[carouselType] * (100 / itemsPerPage)) * itemsPerPage;
    carousel.style.transform = `translateX(${translateX}%)`;
    
    updateDots(carouselType);
}

function updateDots(carouselType) {
    const dots = document.querySelectorAll(`#${carouselType}Dots .dot`);
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlides[carouselType]);
    });
}

function formatPrice(price) {
    if (!price) return { current: 'Precio no disponible' };
    
    if (typeof price === 'string') {
        return { current: price };
    }
    
    return {
        current: price.current || price.value || 'N/A',
        original: price.original || null
    };
}

function formatRating(rating) {
    if (!rating) {
        return {
            stars: '☆☆☆☆☆',
            text: 'Sin calificación'
        };
    }

    let numRating = 0;
    let reviewCount = '';

    if (typeof rating === 'object') {
        numRating = parseFloat(rating.value || rating.score || 0);
        reviewCount = rating.count || rating.reviews || '';
    } else {
        numRating = parseFloat(rating) || 0;
    }

    const fullStars = Math.floor(numRating);
    const halfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const stars = '★'.repeat(fullStars) + 
                 (halfStar ? '☆' : '') + 
                 '☆'.repeat(emptyStars);

    const text = reviewCount ? 
                `${numRating.toFixed(1)} (${reviewCount} reseñas)` : 
                `${numRating.toFixed(1)}`;

    return { stars, text };
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showError(message) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = `
        <div class="error-message-enhanced">
            <div class="error-icon-large">⚠️</div>
            <h3>${message}</h3>
            <p>Intenta con otro término de búsqueda</p>
            <button class="btn-retry" onclick="clearSearch()">Volver al inicio</button>
        </div>
    `;
}

function showNoResults() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = `
        <div class="no-results-enhanced">
            <div class="no-results-icon">🔍</div>
            <h3>No se encontraron productos</h3>
            <p>Intenta con términos más específicos como:</p>
            <div class="suggestions-grid">
                <div class="suggestion-category">
                    <h4>📱 Tecnología</h4>
                    <ul>
                        <li>iPhone, Samsung, Xiaomi</li>
                        <li>Laptop, Monitor, Teclado</li>
                        <li>Cámara, Auriculares</li>
                    </ul>
                </div>
                <div class="suggestion-category">
                    <h4>🎮 Gaming</h4>
                    <ul>
                        <li>PS5, Xbox, Nintendo</li>
                        <li>Gaming mouse, Headset</li>
                        <li>Silla gamer, Setup</li>
                    </ul>
                </div>
                <div class="suggestion-category">
                    <h4>👕 Lifestyle</h4>
                    <ul>
                        <li>Nike, Adidas, Ropa</li>
                        <li>Sneakers, Hoodies</li>
                        <li>Accesorios, Relojes</li>
                    </ul>
                </div>
            </div>
            <button class="btn-back-home" onclick="clearSearch()">Volver al inicio</button>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    // Validar API key
    if (API_CONFIG.headers['X-RapidAPI-Key'] === 'TU_API_KEY_AQUI') {
        console.warn('⚠️ API Key no configurada. Usando datos de demostración.');
    }
    const modal = document.getElementById('productModal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Búsqueda con Enter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.searchProducts(query);
                }
            }
        });
    }
    
    updateCarousel('tech');
    updateCarousel('gaming');
    updateCarousel('lifestyle');
    

    setInterval(() => { 
        const techSection = document.querySelector('.carousel-section');
        if (techSection && techSection.style.display !== 'none') {
            nextSlide('tech'); 
        }
    }, 8000);
    
    setInterval(() => { 
        const gamingSection = document.querySelector('.carousel-section');
        if (gamingSection && gamingSection.style.display !== 'none') {
            nextSlide('gaming'); 
        }
    }, 9000);
    
    setInterval(() => { 
        const lifestyleSection = document.querySelector('.carousel-section');
        if (lifestyleSection && lifestyleSection.style.display !== 'none') {
            nextSlide('lifestyle'); 
        }
    }, 7000);

    document.addEventListener('click', function(e) {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const target = document.querySelector(e.target.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
    
    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('.product-card, .carousel-section, .hero-section').forEach(el => {
        animateOnScroll.observe(el);
    });
});