/*Variables globales para la API*/
const RAPIDAPI_KEY = '55b4cdaaa5msh7e325c5e68ecb45p16601bjsn69d4022b22f3'
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com'

/*Categorías disponibles*/
const CATEGORY_IDS = {
  'automotive': '13848848011',
  'baby': '9482650011',
  'beauty': '11260452011',
  'luxury-beauty': '110744488011',
  'amazon-devices': '19242347011',
  'electronics': '9482558011',
  'dvd': '9482630011',
  'instant-video': '',
  'digital-text': '6507977011',
  'fashion': '13848838011',
  'fashion-womens': '14093002011',
  'fashion-mens': '14093000011',
  'fashion-girls': '14093003011',
  'fashion-boys': '14093004011',
  'fashion-baby': '14092999011',
  'grocery': '17608484011',
  'sporting': '9482660011',
  'handmade': '120955910011',
  'hi': '9482670011',
  'kitchen': '9482593011',
  'industrial': '11076223011',
  'mi': '13848858011',
  'garden': '16215357011',
  'toys': '11260442011',
  'stripbooks': '9298576011',
  'pets': '11782336011',
  'popular': '9482620011',
  'office-products': '9673844011',
  'warehouse-deals': '11536082011',
  'hpc': '9482610011',
  'software': '9482690011',
  'gift-cards': '19117234011',
  'videogames': '9482640011'
}

/*Busca productos*/
async function searchProducts() {
    const query = document.getElementById('searchInput').value.trim()
    if (!query) return

    const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=MX&sort_by=RELEVANCE&product_condition=ALL&is_prime=false&deals_and_discounts=NONE`
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    }

    /*Mostrar spinner*/
    document.getElementById('loadingSpinner').style.display = 'inline-block'

    try {
        const response = await fetch(url, options)
        const result = await response.json()
        showResults(result.data.products || [])
    } catch (error) {
        showResults([])
        alert('Error al buscar productos. Intenta de nuevo.')
    } finally {
        document.getElementById('loadingSpinner').style.display = 'none'
    }
}

/*Muestra los resultados de la búsqueda en tarjetas*/
function showResults(products) {
    const container = document.getElementById('searchResults')
    container.innerHTML = ''

    if (!products || products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; color:#7c3aed;">No se encontraron productos.</p>'
        return
    }

    products.slice(0, 50).forEach(product => {
        const card = document.createElement('div')
        card.className = 'product-card'
        card.innerHTML = `
            <img src="${product.product_photo || ''}" alt="${product.product_title}" style="width:100%;max-height:180px;object-fit:contain;border-radius:12px 12px 0 0;">
            <div class="product-card-info">
                <h3>${product.product_title}</h3>
                <p><strong>Precio:</strong>${product.product_price || 'Sin precio'}</p>
                <p><strong>Rating:</strong>${product.product_star_rating || 'Sin rating'}</p>
                <p><a href="${product.product_url}" target="_blank">Ver en Amazon</a></p>
                <p class="sales-card-info">${product.sales_volume || 'Sin datos'}</p>
            </div>
        `
        container.appendChild(card)
    })
}

/*Buscar por categoría*/
async function searchByCategory(categoryName) {

    document.getElementById('searchInput').value = ''

    const categoryId = CATEGORY_IDS[categoryName]
    if (!categoryId) return

    const url = `https://real-time-amazon-data.p.rapidapi.com/products-by-category?category_id=${categoryId}&page=1&country=MX&sort_by=RELEVANCE&product_condition=ALL&is_prime=false&deals_and_discounts=NONE`
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    }

    document.getElementById('loadingSpinner').style.display = 'inline-block'

    try {
        const response = await fetch(url, options)
        const result = await response.json()
        showResults(result.data.products || [])
        document.getElementById('searchSection').scrollIntoView({ behavior: 'smooth' })

    } catch (error) {
        showResults([]);
        alert('Error al buscar productos por categoría. Intenta de nuevo.');
    } finally {
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

/*Permite buscar con Enter*/
document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchProducts()
})

/*Para mostrar los features-grid */
document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('featuresGrid')
    const cards = Array.from(grid.children)
    let current = 0

    // Oculta todas menos la primera
    cards.forEach((card, i) => {
        card.style.display = i === 0 ? 'block' : 'none';
    })

    setInterval(() => {
        cards[current].style.display = 'none'
        current = (current + 1) % cards.length
        cards[current].style.display = 'block'
    }, 5000)
})

/*Para obtener vista de algunos vendedores*/
async function loadSellers() {
    const sellerIds = [
        'A2TZN1IAUP0QBX', //basuka
        'A3P8U6BAN7HQM8',
        'AEUY6HMIYEDVE',
        'A14O54VCEHBKPR',  //el oso
        'A1NVUB9DYJXLQ7', //Grupo mayoreo torres
        'AJF9O40DRDTWD', //KUSU GLOBAL
        'A3P8U6BAN7HQM8', //bixemy
        'A1L8W32ZILL8QP', //Monatik
        'A25WDH4CPLSC8R', //CC Aries
        'A3RSRUV1GKQJTF' //mas refacciones MX
    ];

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    };

    // Haz todas las peticiones en paralelo
    const sellerPromises = sellerIds.map(id => 
        fetch(`https://real-time-amazon-data.p.rapidapi.com/seller-profile?seller_id=${id}&country=MX`, options)
            .then(res => res.json())
            .then(result => result.data)
            .catch(() => null)
    );

    const sellers = (await Promise.all(sellerPromises)).filter(Boolean);
    renderSellers(sellers);
}

let sellersData = [];
let sellerSelected = 0;

function renderSellers(sellers) {
    sellersData = sellers;
    showSeller(sellerSelected);

    // Logos pequeños abajo
    const bottom = document.getElementById('sellerBottom');
    bottom.innerHTML = sellers.map((seller, i) => {
        if (seller.logo) {
            return `<img src="${seller.logo}" class="seller-logo-thumb${i === sellerSelected ? ' selected' : ''}" data-index="${i}" alt="${seller.name || ''}">`;
        } else {
            // Si no hay logo, muestra la inicial en un div
            return `<div class="seller-logo-thumb seller-logo-thumb-fallback${i === sellerSelected ? ' selected' : ''}" data-index="${i}" title="${seller.name || ''}">
                ${seller.name ? seller.name[0].toUpperCase() : '?'}
            </div>`;
        }
    }).join('');

    // Click en logo pequeño o fallback
    bottom.querySelectorAll('.seller-logo-thumb').forEach(el => {
        el.onclick = function() {
            sellerSelected = parseInt(this.dataset.index);
            showSeller(sellerSelected);
            renderSellers(sellersData); // Para actualizar selección
        };
    });
}

function showSeller(index) {
    const seller = sellersData[index];
    // Logo grande: si no hay logo, muestra la inicial
    const logoLarge = document.getElementById('sellerLogoLarge');
    if (seller.logo) {
        logoLarge.src = seller.logo;
        logoLarge.alt = seller.name || '';
        logoLarge.style.background = '#fff';
        logoLarge.style.objectFit = 'contain';
        logoLarge.style.display = 'block';
    } else {
        logoLarge.src = '';
        logoLarge.alt = seller.name ? seller.name[0] : '';
        logoLarge.style.background = '#ffd600';
        logoLarge.style.objectFit = 'contain';
        logoLarge.style.display = 'none';
        // Muestra la inicial como fallback
        if (!document.getElementById('sellerLogoFallback')) {
            const fallback = document.createElement('div');
            fallback.id = 'sellerLogoFallback';
            fallback.className = 'seller-logo-fallback';
            fallback.textContent = seller.name ? seller.name[0].toUpperCase() : '?';
            logoLarge.parentNode.appendChild(fallback);
        } else {
            document.getElementById('sellerLogoFallback').textContent = seller.name ? seller.name[0].toUpperCase() : '?';
        }
    }
    if (seller.logo && document.getElementById('sellerLogoFallback')) {
        document.getElementById('sellerLogoFallback').remove();
    }

    // Info detallada en recuadro horizontal y dos columnas
    document.getElementById('sellerInfoCard').innerHTML = `
        <div class="seller-info-horizontal">
            <div class="seller-info-col">
                <h3>${seller.name || ''}</h3>
                <p><strong>Razón social:</strong> ${seller.business_name || 'Sin datos'}</p>
                <p><strong>Dirección:</strong> ${seller.business_address || 'Sin datos'}</p>
            </div>
            <div class="seller-info-col">
                <p><strong>Rating:</strong> ${seller.rating || 'Sin rating'}</p>
                <p><strong>Acerca del vendedor:</strong> ${seller.about_this_seller || seller.detailed_information || 'Sin descripción'}</p>
                <div class="seller-links">
                    ${seller.seller_link ? `<a href="${seller.seller_link}" target="_blank">Ver perfil en Amazon</a>` : ''}
                    ${seller.store_link ? `<a href="${seller.store_link}" target="_blank">Ver tienda</a>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Llama esto al cargar la página:
loadSellers();

/*Para visualizar las ofertas del momento*/
async function loadDeals() {
    const url = 'https://real-time-amazon-data.p.rapidapi.com/deals-v2?country=MX&min_product_star_rating=ALL&price_range=ALL&discount_range=ALL';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    };
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        renderDealsCarousel(result.data.deals || []);
    } catch (error) {
        document.getElementById('dealsCarousel').innerHTML = '<p>Error al cargar ofertas.</p>';
    }
}

let dealsIndex = 0;
let dealsData = [];

function renderDealsCarousel(deals) {
    dealsData = deals;
    dealsIndex = 0; // Reinicia el índice al cargar nuevos deals
    showDealCard(dealsIndex);
}

function showDealCard(index) {
    const carousel = document.getElementById('dealsCarousel');
    if (!dealsData.length) {
        carousel.innerHTML = '<p>No hay ofertas disponibles.</p>';
        return;
    }
    const deal = dealsData[index];
    carousel.innerHTML = `
        <div class="deal-card-horizontal">
            <div class="deal-card-img">
                <img src="${deal.deal_photo || ''}" alt="${deal.deal_title}">
            </div>
            <div class="deal-card-info">
                <h3>${deal.deal_title}</h3>
                <p><strong>Precio oferta:</strong> ${deal.deal_price ? `$${deal.deal_price.amount} ${deal.deal_price.currency}` : 'Sin precio'}</p>
                <p><strong>Precio lista:</strong> ${deal.list_price ? `$${deal.list_price.amount} ${deal.list_price.currency}` : ''}</p>
                <p><strong>Descuento:</strong>${deal.deal_badge ? `<span class="deal-badge">${deal.deal_badge}</span>` : ''}</p>
                <a href="${deal.deal_url}" target="_blank">Ver en Amazon</a>
            </div>
        </div>
    `;
}

document.getElementById('dealsPrev').onclick = function() {
    dealsIndex = (dealsIndex - 1 + dealsData.length) % dealsData.length;
    showDealCard(dealsIndex);
};
document.getElementById('dealsNext').onclick = function() {
    dealsIndex = (dealsIndex + 1) % dealsData.length;
    showDealCard(dealsIndex);
};

// Llama esto al cargar la página:
loadDeals();
