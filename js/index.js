/*Variables globales para la API*/
const RAPIDAPI_KEY = '7479e7fd7cmsh5d37c0dc23bb05dp11874fjsnbcaa085e8106'
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

    products.slice(0, 15).forEach(product => {
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
