// api.js - Módulo para manejar todas las operaciones con la API de Amazon

const API_CONFIG = {
    baseURL: 'https://real-time-amazon-data.p.rapidapi.com',
    endpoints: {
        search: '/search',
        productDetails: '/product-details',
        productOffers: '/product-offers',
        productReviews: '/product-reviews'
    },
    headers: {
        'X-RapidAPI-Key': '65c9f687acmsh1f46c6ec6f2f10ap14d6c5jsnf43a816b1de5',
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
    },
    defaultParams: {
        country: 'US',
        page: 1,
        sort_by: 'RELEVANCE',
        product_condition: 'ALL'
    }
};

/**
 * Realiza una búsqueda de productos en Amazon
 * @param {string} query - Término de búsqueda
 * @param {object} options - Opciones adicionales
 * @returns {Promise<Array>} - Lista de productos
 */
async function searchProducts(query, options = {}) {
    const params = {
        ...API_CONFIG.defaultParams,
        ...options,
        query: encodeURIComponent(query)
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.search}?${queryString}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: API_CONFIG.headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return processSearchResults(data);

    } catch (error) {
        console.error('Error searching products:', error);
        throw error;
    }
}

/**
 * Obtiene detalles de un producto específico
 * @param {string} asin - ASIN del producto
 * @param {object} options - Opciones adicionales
 * @returns {Promise<object>} - Detalles del producto
 */
async function getProductDetails(asin, options = {}) {
    const params = {
        ...API_CONFIG.defaultParams,
        ...options,
        asin: asin
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.productDetails}?${queryString}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: API_CONFIG.headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return processProductDetails(data);

    } catch (error) {
        console.error('Error getting product details:', error);
        throw error;
    }
}

/**
 * Procesa los resultados de búsqueda de la API
 * @param {object} data - Datos crudos de la API
 * @returns {Array} - Productos procesados
 */
function processSearchResults(data) {
    if (!data || !data.data || !data.data.products) {
        console.warn('Invalid search results format:', data);
        return [];
    }

    return data.data.products.map(product => ({
        asin: product.asin,
        title: product.product_title,
        url: product.product_url,
        image: product.product_photo,
        price: {
            current: product.product_price,
            original: product.product_original_price,
            discounted: product.product_price < product.product_original_price
        },
        rating: {
            value: product.product_star_rating,
            count: product.product_num_ratings
        },
        isPrime: product.is_prime,
        isSponsored: product.is_sponsored,
        delivery: product.delivery
    }));
}

/**
 * Procesa los detalles de un producto de la API
 * @param {object} data - Datos crudos de la API
 * @returns {object} - Detalles del producto procesados
 */
function processProductDetails(data) {
    if (!data || !data.data) {
        console.warn('Invalid product details format:', data);
        return null;
    }

    const product = data.data;
    return {
        asin: product.asin,
        title: product.product_title,
        description: product.product_description,
        url: product.product_url,
        images: product.product_photos,
        price: {
            current: product.product_price,
            original: product.product_original_price,
            discounted: product.product_price < product.product_original_price
        },
        rating: {
            value: product.product_star_rating,
            count: product.product_num_ratings
        },
        features: product.product_information,
        specifications: product.product_details,
        availability: product.product_availability,
        brand: product.brand,
        category: product.category_path,
        isPrime: product.is_prime
    };
}

/**
 * Función de respaldo para obtener productos de demostración
 * @param {string} query - Término de búsqueda
 * @returns {Array} - Productos de demostración
 */
function getDemoProducts(query) {
    console.warn('Using demo products data');
    return [
        {
            asin: 'DEMO001',
            title: `${query} - Producto de demostración 1`,
            url: 'https://www.amazon.com',
            image: 'https://via.placeholder.com/300',
            price: {
                current: '$99.99',
                original: '$129.99',
                discounted: true
            },
            rating: {
                value: 4.5,
                count: 120
            },
            isPrime: true,
            isSponsored: false,
            delivery: 'Envío GRATIS'
        },
        {
            asin: 'DEMO002',
            title: `${query} - Producto de demostración 2`,
            url: 'https://www.amazon.com',
            image: 'https://via.placeholder.com/300',
            price: {
                current: '$49.99',
                original: '$49.99',
                discounted: false
            },
            rating: {
                value: 3.8,
                count: 85
            },
            isPrime: false,
            isSponsored: true,
            delivery: 'Envío en 3-5 días'
        }
    ];
}

// --- Funciones para datos del vendedor (perfil, reviews, productos) ---
const SELLER_CONFIG = {
    sellerId: 'A02211013Q5HP3OMSZC7W',
    country: 'US'
};

/**
 * Obtiene el perfil del vendedor
 * @returns {Promise<object>} - Perfil del vendedor
 */
async function getSellerProfile() {
    const url = `${API_CONFIG.baseURL}/seller-profile?seller_id=${SELLER_CONFIG.sellerId}&country=${SELLER_CONFIG.country}`;
    const res = await fetch(url, { method: 'GET', headers: API_CONFIG.headers });
    return res.json();
}

/**
 * Obtiene reseñas del vendedor
 * @returns {Promise<object>} - Reseñas del vendedor
 */
async function getSellerReviews() {
    const url = `${API_CONFIG.baseURL}/seller-reviews?seller_id=${SELLER_CONFIG.sellerId}&country=${SELLER_CONFIG.country}&star_rating=ALL&page=1`;
    const res = await fetch(url, { method: 'GET', headers: API_CONFIG.headers });
    return res.json();
}

/**
 * Obtiene productos del vendedor
 * @returns {Promise<object>} - Productos del vendedor
 */
async function getSellerProducts() {
    const url = `${API_CONFIG.baseURL}/seller-products?seller_id=${SELLER_CONFIG.sellerId}&country=${SELLER_CONFIG.country}&page=1&sort_by=RELEVANCE`;
    const res = await fetch(url, { method: 'GET', headers: API_CONFIG.headers });
    return res.json();
}

// Exportar las funciones principales
export {
    API_CONFIG,
    searchProducts,
    getProductDetails,
    getDemoProducts,
    getSellerProfile,
    getSellerReviews,
    getSellerProducts
};