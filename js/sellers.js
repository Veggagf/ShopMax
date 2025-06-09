const RAPIDAPI_KEY = '0272d01fe9mshf576bfdf1ca2482p13f58bjsnbc5c66037bba'; // Usando la clave correcta
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com';

// Variables globales para vendedores
let currentSellers = [];
let isLoading = false;

// IDs de vendedores predefinidos
const PREDEFINED_SELLER_IDS = [
    'A2TZN1IAUP0QBX', // basuka
    'A3P8U6BAN7HQM8', // bixemy
    'AEUY6HMIYEDVE',
    'A14O54VCEHBKPR',  // el oso
    'A1NVUB9DYJXLQ7', // Grupo mayoreo torres
    'AJF9O40DRDTWD', // KUSU GLOBAL
    'A1L8W32ZILL8QP', // Monatik
    'A25WDH4CPLSC8R', // CC Aries
    'A3RSRUV1GKQJTF' // mas refacciones MX
];

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de vendedores ShopMax cargada');
    initializeEventListeners();
    initializeExistingSellers(); // Inicializar vendedores del HTML
    loadPredefinedSellers();
});

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Búsqueda con Enter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchProducts();
            }
        });
    }

    // Event listeners del modal
    setupModalEvents();
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

    // Cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// ============================================
// INICIALIZACIÓN DE VENDEDORES EXISTENTES
// ============================================

function initializeExistingSellers() {
    // Inicializar vendedores que ya están en el HTML
    const existingSellers = [
        {
            id: '1',
            name: 'Vendedor Estrella 1',
            rating: '4.7',
            location: 'Ciudad de México',
            totalRatings: 245,
            positivePercentage: 96,
            products: generateSampleProducts('Vendedor Estrella 1'),
            isSearchResult: false
        },
        {
            id: '2',
            name: 'Vendedor Estrella 2',
            rating: '4.5',
            location: 'Guadalajara',
            totalRatings: 189,
            positivePercentage: 94,
            products: generateSampleProducts('Vendedor Estrella 2'),
            isSearchResult: false
        }
    ];

    currentSellers.push(...existingSellers);
    console.log('Vendedores existentes inicializados:', currentSellers);
}

// ============================================
// FUNCIONES DE BÚSQUEDA
// ============================================

async function searchProducts() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        showNotification('Por favor ingresa un término de búsqueda', 'warning');
        return;
    }

    if (isLoading) {
        return; // Evitar múltiples búsquedas simultáneas
    }

    setLoadingState(true);

    const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=MX&sort_by=RELEVANCE&product_condition=ALL&is_prime=false&deals_and_discounts=NONE`;
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    };

    try {
        console.log('Realizando búsqueda para:', query);
        const response = await fetch(url, options);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('API Key inválida o límite de requests excedido');
            } else if (response.status === 429) {
                throw new Error('Límite de requests por minuto excedido. Intenta en unos momentos.');
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Respuesta de la API:', result);
        
        if (result.data && result.data.products && result.data.products.length > 0) {
            const sellers = extractSellersFromProducts(result.data.products);
            console.log('Vendedores extraídos:', sellers);
            
            if (sellers.length > 0) {
                displaySearchedSellers(sellers, query);
                showNotification(`Se encontraron ${sellers.length} vendedores para "${query}"`, 'success');
            } else {
                showNotification(`No se encontraron vendedores válidos para "${query}"`, 'info');
                showNoResultsMessage(query);
            }
        } else {
            console.log('No hay productos en la respuesta');
            showNotification(`No se encontraron productos para "${query}"`, 'info');
            showNoResultsMessage(query);
        }
    } catch (error) {
        console.error('Error al buscar:', error);
        let errorMessage = 'Error al buscar vendedores. ';
        
        if (error.message.includes('API Key')) {
            errorMessage += 'Problema con la clave de API.';
        } else if (error.message.includes('límite')) {
            errorMessage += error.message;
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Verifica tu conexión a internet.';
        } else {
            errorMessage += 'Intenta de nuevo en unos momentos.';
        }
        
        showNotification(errorMessage, 'error');
        clearSearchResults();
    } finally {
        setLoadingState(false);
    }
}

function extractSellersFromProducts(products) {
    console.log('Extrayendo vendedores de', products.length, 'productos');
    const sellersMap = new Map();
    
    products.forEach((product, index) => {
        console.log(`Producto ${index + 1}:`, {
            title: product.product_title,
            seller: product.seller,
            price: product.product_price,
            rating: product.product_star_rating
        });
        
        // Verificar si el producto tiene información del vendedor
        if (product.seller && product.seller.name && product.seller.name.trim() !== '') {
            const sellerId = product.seller.id || generateSellerId(product.seller.name);
            
            if (!sellersMap.has(sellerId)) {
                sellersMap.set(sellerId, {
                    id: sellerId,
                    name: product.seller.name.trim(),
                    rating: generateRandomRating(),
                    location: 'México',
                    totalRatings: Math.floor(Math.random() * 1000) + 100,
                    positivePercentage: Math.floor(Math.random() * 15) + 85, // 85-100%
                    products: [],
                    isSearchResult: true
                });
            }
            
            // Agregar el producto al vendedor
            const sellerData = sellersMap.get(sellerId);
            sellerData.products.push({
                title: product.product_title || 'Producto sin título',
                price: product.product_price || 'Precio no disponible',
                image: product.product_photo || null,
                url: product.product_url || null,  
                rating: product.product_star_rating || 'Sin rating',
                asin: product.asin || null
            });
        } else {
            console.log(`Producto ${index + 1} no tiene información de vendedor válida`);
        }
    });

    const sellersArray = Array.from(sellersMap.values());
    console.log('Vendedores finales:', sellersArray);
    return sellersArray;
}

// ============================================
// FUNCIONES DE DISPLAY
// ============================================

function displaySearchedSellers(sellers, query) {
    // Remover resultados de búsquedas anteriores
    clearSearchResults();
    
    if (sellers.length === 0) {
        showNoResultsMessage(query);
        return;
    }

    const container = document.querySelector('.sellers-list');
    
    // Agregar header de resultados
    addSearchResultsHeader(sellers.length, query);

    // Agregar nuevos vendedores encontrados
    sellers.forEach(seller => {
        const sellerCard = createSellerCard(seller);
        container.appendChild(sellerCard);
    });

    // Actualizar currentSellers
    currentSellers = [...currentSellers.filter(s => !s.isSearchResult), ...sellers];

    // Scroll suave hacia los resultados
    setTimeout(() => {
        const searchHeader = container.querySelector('.search-results-header');
        if (searchHeader) {
            searchHeader.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }
    }, 100);
}

function createSellerCard(seller) {
    const card = document.createElement('div');
    card.className = `seller-card${seller.isSearchResult ? ' search-result' : ''}`;
    card.setAttribute('data-seller-id', seller.id);
    
    const topProducts = seller.products.slice(0, 3);
    const productsList = topProducts.length > 0 ? 
        topProducts.map(product => 
            `<li title="${product.title}">${truncateText(product.title, 40)}</li>`
        ).join('') : 
        '<li>No hay productos disponibles</li>';
    
    // Asegurar que el logo tenga fallback
    const logoUrl = seller.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&size=80&background=7c3aed&color=fff&bold=true`;
    const localAvatar = generateLocalAvatar(seller.name);
    
    card.innerHTML = `
        <img src="${logoUrl}" alt="Logo de ${seller.name}" class="seller-logo" 
             onerror="this.onerror=null; this.src='${localAvatar}'">
        <h2 title="${seller.name}">${truncateText(seller.name, 25)}</h2>
        <p><strong>Ubicación:</strong> ${seller.location}</p>
        <p class="seller-rating">⭐ ${seller.rating} / 5</p>
        <p><strong>Total calificaciones:</strong> ${seller.totalRatings.toLocaleString()}</p>
        <p><strong>Porcentaje positivo:</strong> ${seller.positivePercentage}%</p>
        <p><strong>Productos encontrados:</strong> ${seller.products.length}</p>
        <p><strong>Top productos:</strong></p>
        <ul>${productsList}</ul>
        <button class="view-products" onclick="showSellerInfo('${seller.id}')" 
                ${seller.products.length === 0 ? 'disabled' : ''}>
            Ver todos los productos (${seller.products.length})
        </button>
    `;
    
    return card;
}

// ============================================
// FUNCIONES DE VENDEDORES PREDEFINIDOS
// ============================================

async function loadPredefinedSellers() {
    console.log('Cargando vendedores predefinidos adicionales...');
    
    // Solo agregar vendedores adicionales si queremos más ejemplos
    const additionalSellers = [
        {
            id: 'predefined_3',
            name: 'ShopMax Vendedor Destacado',
            rating: '4.8',
            location: 'Ciudad de México',
            totalRatings: 1250,
            positivePercentage: 98,
            products: generateSampleProducts('ShopMax Vendedor Destacado'),
            isSearchResult: false
        },
        {
            id: 'predefined_4',
            name: 'Vendedor Premium Plus',
            rating: '4.6',
            location: 'Guadalajara',
            totalRatings: 850,
            positivePercentage: 95,
            products: generateSampleProducts('Vendedor Premium Plus'),
            isSearchResult: false
        }
    ];

    currentSellers.push(...additionalSellers);
    
    // Mostrar vendedores predefinidos adicionales
    const container = document.querySelector('.sellers-list');
    if (container) {
        additionalSellers.forEach(seller => {
            const sellerCard = createSellerCard(seller);
            container.appendChild(sellerCard);
        });
    }
    
    console.log('Vendedores predefinidos cargados. Total vendedores:', currentSellers.length);
}

// ============================================
// FUNCIONES DEL MODAL
// ============================================

async function showSellerInfo(sellerId) {
    const modal = document.getElementById('sellerModal');
    const sellerName = document.getElementById('sellerName');
    const productList = document.getElementById('productList');
    
    if (!modal || !sellerName || !productList) {
        console.error('Elementos del modal no encontrados');
        return;
    }

    // Buscar el vendedor en los datos actuales
    let seller = currentSellers.find(s => s.id === sellerId);
    
    if (!seller) {
        console.log('Vendedor no encontrado en currentSellers, buscando por ID:', sellerId);
        showNotification('Información del vendedor no disponible', 'error');
        return;
    }

    console.log('Mostrando información del vendedor:', seller);

    // Actualizar nombre en el modal
    sellerName.textContent = seller.name;
    
    // Mostrar loading en el modal
    productList.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #7c3aed; border-radius: 50%; animation: spin 1s linear infinite;"></div><p style="margin-top: 20px; color: #666;">Cargando productos...</p></div>';
    
    // Mostrar modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    
    // Simular carga y actualizar lista de productos
    setTimeout(() => {
        updateProductList(seller);
    }, 500);
}

function updateProductList(seller) {
    const productList = document.getElementById('productList');
    
    if (seller.products && seller.products.length > 0) {
        productList.innerHTML = seller.products.map(product => `
            <div class="product-item">
                ${product.image ? `<img src="${product.image}" alt="${product.title}" onerror="this.style.display='none'">` : ''}
                <div style="flex: 1; min-width: 0;">
                    <h4>${product.title}</h4>
                    <p style="color: #2e7d32; font-weight: bold; font-size: 1.1rem;"><strong>Precio:</strong> ${product.price}</p>
                    <p><strong>Rating:</strong> ⭐ ${product.rating}</p>
                    ${product.asin ? `<p><strong>ASIN:</strong> ${product.asin}</p>` : ''}
                    ${product.url ? `<a href="${product.url}" target="_blank" rel="noopener noreferrer" style="color: #7c3aed; text-decoration: none; font-weight: 600;">Ver en Amazon →</a>` : ''}
                </div>
            </div>
        `).join('');
    } else {
        productList.innerHTML = `
            <div style="text-align: center; color: #666; padding: 40px;">
                <p style="font-size: 1.1rem; margin-bottom: 10px;">😔 No hay productos disponibles</p>
                <p>Este vendedor aún no tiene productos registrados en nuestro sistema.</p>
            </div>
        `;
    }
}

function closeModal() {
    const modal = document.getElementById('sellerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll del body
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function generateLocalAvatar(name, size = 80) {
    // Crear un canvas para generar avatar local
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    // Colores de fondo aleatorios pero consistentes para cada nombre
    const colors = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    // Fondo circular
    ctx.fillStyle = colors[colorIndex];
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Texto (iniciales)
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size/3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const initials = name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    ctx.fillText(initials, size/2, size/2);
    
    return canvas.toDataURL();
}

function setLoadingState(loading) {
    isLoading = loading;
    const spinner = document.getElementById('loadingSpinner');
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('searchInput');
    
    if (spinner) {
        spinner.style.display = loading ? 'inline-block' : 'none';
    }
    
    if (searchBtn) {
        searchBtn.disabled = loading;
        searchBtn.style.opacity = loading ? '0.7' : '1';
        searchBtn.textContent = loading ? 'Buscando...' : '🚀 BUSCAR';
    }
    
    if (searchInput) {
        searchInput.disabled = loading;
    }
}

function showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Colores según el tipo
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function clearSearchResults() {
    const container = document.querySelector('.sellers-list');
    if (!container) return;
    
    const searchResults = container.querySelectorAll('.seller-card.search-result');
    const searchHeader = container.querySelector('.search-results-header');
    const noResults = container.querySelector('.no-results');
    
    searchResults.forEach(card => card.remove());
    if (searchHeader) searchHeader.remove();
    if (noResults) noResults.remove();
    
    // Actualizar currentSellers
    currentSellers = currentSellers.filter(s => !s.isSearchResult);
}

function showNoResultsMessage(query) {
    const container = document.querySelector('.sellers-list');
    const noResults = document.createElement('div');
    noResults.className = 'no-results search-result';
    noResults.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #666;
        background: rgba(124, 58, 237, 0.05);
        border: 2px dashed #7c3aed44;
        border-radius: 20px;
        margin: 20px 0;
    `;
    noResults.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
        <h3 style="color: #7c3aed; margin-bottom: 15px;">No encontramos vendedores</h3>
        <p style="font-size: 1.1rem; margin-bottom: 10px;">No se encontraron vendedores para "<strong>${query}</strong>"</p>
        <p>Intenta con otros términos de búsqueda o explora nuestros vendedores destacados arriba.</p>
    `;
    container.appendChild(noResults);
}

function addSearchResultsHeader(count, query) {
    const container = document.querySelector('.sellers-list');
    const header = document.createElement('div');
    header.className = 'search-results-header search-result';
    header.style.cssText = `
        grid-column: 1 / -1;
        background: linear-gradient(45deg, #7c3aed, #a78bfa);
        color: white;
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        margin-bottom: 20px;
        box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3);
    `;
    header.innerHTML = `
        <h3 style="margin: 0; font-size: 1.3rem;">
            🎯 ${count} vendedor${count !== 1 ? 'es' : ''} encontrado${count !== 1 ? 's' : ''} para "${query}"
        </h3>
    `;
    container.appendChild(header);
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function generateSellerId(name) {
    return 'SELLER_' + btoa(encodeURIComponent(name)).replace(/[^A-Za-z0-9]/g, '').substring(0, 10);
}

function generateRandomRating() {
    return (3.5 + Math.random() * 1.5).toFixed(1);
}

function generateSampleProducts(sellerName) {
    const sampleProducts = [
        { title: 'Producto Premium de Calidad Superior', price: '$299.99', rating: '4.7' },
        { title: 'Artículo Bestseller del Mes', price: '$189.50', rating: '4.5' },
        { title: 'Oferta Especial Limitada', price: '$129.99', rating: '4.8' },
        { title: 'Producto Más Vendido', price: '$259.00', rating: '4.6' },
        { title: 'Artículo Recomendado', price: '$99.99', rating: '4.4' },
        { title: 'Nueva Llegada Exclusiva', price: '$349.99', rating: '4.9' }
    ];

    return sampleProducts.map((product, index) => ({
        ...product,
        title: `${product.title} - ${sellerName}`,
        image: null, // Sin imagen
        url: null,
        asin: `B${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }));
}

// Función para navegación (compatibilidad con tu sistema)
function loadPage(page) {
    console.log(`Navegando a: ${page}`);
    showNotification(`Navegando a ${page}...`, 'info');
}

// Agregar estilos CSS dinámicos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .seller-card.search-result {
        animation: fadeIn 0.5s ease;
        border: 2px solid #ffe066;
        box-shadow: 0 4px 15px rgba(255, 224, 102, 0.3);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .product-item {
        display: flex;
        gap: 15px;
        padding: 15px;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        margin-bottom: 15px;
        transition: box-shadow 0.3s ease;
    }
    
    .product-item:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .product-item img {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        flex-shrink: 0;
    }
    
    .product-item h4 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.1rem;
    }
    
    .product-item p {
        margin: 5px 0;
        color: #666;
    }
`;
document.head.appendChild(style);