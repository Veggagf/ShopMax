/*Variables globales para la API*/
const RAPIDAPI_KEY = '7479e7fd7cmsh5d37c0dc23bb05dp11874fjsnbcaa085e8106'
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com'

/*Categorías disponibles*/
const CATEGORY_IDS = {
    'Electronics': '9482558011',
    'Fashion': '13848838011',
    'Home': '9482593011',
    'Sports': '9482660011',
    'Beauty': '9482611011',
    'Gaming': '9482640011'
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
                <p>${product.product_price || 'Sin precio'}</p>
                <a href="${product.product_url}" target="_blank">Ver en Amazon</a>
            </div>
        `
        container.appendChild(card)
    })
}

/*Permite buscar con Enter*/
document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchProducts();
})
