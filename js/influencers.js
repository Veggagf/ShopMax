const apiKey = '764219ef19msh6ebb2fa35c04ff9p18a25djsn4acd898929a3'; // ⚠️ Solo para pruebas
const rapidHost = 'real-time-amazon-data.p.rapidapi.com';

// Lista de influencers conocidos (puedes expandirla)
const influencers = [
  'kylerichards18',
  'tastemade',
  '',
  '',
  '',
  'linustechtips',
];

// Función para traducir códigos de país a nombres completos
function translateCountry(countryCode) {
  const countryMap = {
    'US': 'Estados Unidos',
    'CA': 'Canadá',
    'MX': 'México',
    'UK': 'Reino Unido',
    'GB': 'Reino Unido',
    'FR': 'Francia',
    'DE': 'Alemania',
    'IT': 'Italia',
    'ES': 'España',
    'BR': 'Brasil',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Perú',
    'VE': 'Venezuela',
    'EC': 'Ecuador',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'BO': 'Bolivia',
    'JP': 'Japón',
    'CN': 'China',
    'KR': 'Corea del Sur',
    'IN': 'India',
    'AU': 'Australia',
    'NZ': 'Nueva Zelanda',
    'RU': 'Rusia',
    'NL': 'Países Bajos',
    'BE': 'Bélgica',
    'CH': 'Suiza',
    'AT': 'Austria',
    'SE': 'Suecia',
    'NO': 'Noruega',
    'DK': 'Dinamarca',
    'FI': 'Finlandia',
    'IE': 'Irlanda',
    'PT': 'Portugal',
    'GR': 'Grecia',
    'TR': 'Turquía',
    'PL': 'Polonia',
    'CZ': 'República Checa',
    'HU': 'Hungría',
    'RO': 'Rumania',
    'BG': 'Bulgaria',
    'HR': 'Croacia',
    'SI': 'Eslovenia',
    'SK': 'Eslovaquia',
    'LT': 'Lituania',
    'LV': 'Letonia',
    'EE': 'Estonia'
  };
  
  return countryMap[countryCode?.toUpperCase()] || countryCode || 'No especificado';
}

const recommendedInfluencers = [
  {
    username: 'linustechtips',
    name: 'Linus Tech Tips',
    country: 'CA',
    profile_description: 'Linus Tech Tips aims to inform and educate people  of all ages through our entertaining videos on consumer technology.',
    affiliate_status: 'Earns Commissions',
    posts_count: 22,
    is_featured: true,
    profile_link: 'https://www.amazon.com/shop/linustechtips'
  },
  {
    username: 'sydneynicole',
    name: 'Sydney Nicole Slone',
    country: 'US',
    profile_description: 'LIVE every Saturday at noon CST on the livestreams tab below!',
    affiliate_status: 'Earns Commissions',
    posts_count: 10,
    is_featured: false,
    profile_link: 'https://www.amazon.com/shop/sydneynicole'
  },

  {
    username: 'thesistershoppers',
    name: 'The Sister Shoppers',
    country: 'US',
    profile_description: 'Bringing you the best in Home, Fashion, Beauty and Must Haves! ✨',
    affiliate_status: 'Earns Commissions',
    posts_count: 20,
    is_featured: true,
    profile_link: 'https://www.amazon.com/shop/thesistershoppers'
  },
  {
    username: 'influencer-cbaaa897',
    name: 'Carlos & Sarinette',
    country: 'US',
    profile_description: 'We want to help you open doors toward success.',
    affiliate_status: 'Earns Commissions',
    posts_count: 5,
    is_featured: false,
    profile_link: 'https://www.amazon.com/shop/influencer-cbaaa897'
  },
  {
    username: 'practicalsolutions',
    name: 'Practical Solutions',
    country: 'US',
    profile_description: 'Our focus with our content is to help people by sharing  <br> practical solutions for every problems. We specialize in life tips, <br> life hacks, product reviews, how-to’s.',
    affiliate_status: 'Earns Commissions',
    posts_count: 7,
    is_featured: false,
    profile_link: 'https://www.amazon.com/shop/practicalsolutions'
  },
  {
    username: 'giftgenius',
    name: 'Gift Genius',
    country: 'US',
    profile_description: 'Sharing various Amazon finds in Tech, Home, DIY & more!',
    affiliate_status: 'Earns Commissions',
    posts_count: 12,
    is_featured: true,
    profile_link: 'https://www.amazon.com/shop/giftgenius'
  }
];

// Función para ocultar/mostrar la sección de información
function toggleInfoSection(show) {
  const infoSection = document.querySelector('.info-section');
  const subtituloSection = document.querySelector('.influencers-subtitulo');
  
  if (infoSection) {
    infoSection.style.display = show ? 'block' : 'none';
  }
  
  if (subtituloSection) {
    subtituloSection.style.display = show ? 'block' : 'none';
  }
}

// Modifica la función searchInfluencer para pasar el username de búsqueda
async function searchInfluencer() {
  const input = document.getElementById('searchInput').value.trim();
  const listDiv = document.getElementById('influencersList');
  
  if (!input) {
    // Si no hay búsqueda, mostrar recomendados y la sección de información
    toggleInfoSection(true);
    renderRecommendedInfluencers();
    if (document.getElementById('postsContainer')) {
      document.getElementById('postsContainer').innerHTML = '';
    }
    return;
  }
  
  // Ocultar la sección de información cuando se hace una búsqueda
  toggleInfoSection(false);

  // Mostrar spinner de carga
  document.getElementById('loadingSpinner').style.display = 'inline-block';

  // Llamada a la API
  const url = `https://${rapidHost}/influencer-profile?influencer_name=${encodeURIComponent(input)}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': rapidHost
    }
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    console.log('Respuesta API:', data);

    // Ocultar spinner
    document.getElementById('loadingSpinner').style.display = 'none';

    if (data.data && data.data.name) {
      // Pasar el username de búsqueda a la función
      listDiv.innerHTML = crearTarjetaInfluencer(data.data, input);
    } else {
      listDiv.innerHTML = '<p style="text-align:center;">No se encontró ningún influencer con ese nombre o username.</p>';
    }
  } catch (err) {
    document.getElementById('loadingSpinner').style.display = 'none';
    listDiv.innerHTML = '<p style="text-align:center;">Error al buscar el influencer.</p>';
    console.error(err);
  }
}

// Modifica la función crearTarjetaInfluencer para recibir el username de búsqueda
function crearTarjetaInfluencer(data, searchedUsername) {
  return `
    <div class="influencer-card-result">
      ${data.is_featured ? `
        <div style="position:absolute;top:10px;right:15px;">
          <span class="material-symbols-outlined" style="color:#ffcc00;font-size:1.5rem;">workspace_premium</span>
        </div>
      ` : ''}
      <div class="influencer-name">${data.name || 'Sin nombre'}</div>
      <div class="influencer-username">@${searchedUsername || data.username || 'username'}</div>
      <div class="influencer-description">${data.profile_description || 'Sin descripción disponible'}</div>
      <button class="more-info-btn" onclick="openModal('${data.name || ''}', '${data.country || ''}', '${data.posts_count || 0}', '${data.profile_link || '#'}')">
        Más información
      </button>
    </div>
  `;
}

function renderRecommendedInfluencers() {
  const listDiv = document.getElementById('influencersList');
  listDiv.innerHTML = recommendedInfluencers.map(data => crearTarjetaRecomendada(data)).join('');
}

document.addEventListener('DOMContentLoaded', function() {
  // Mostrar la sección de información y recomendados al cargar la página
  toggleInfoSection(true);
  renderRecommendedInfluencers();
  
  // Listeners para el buscador
  document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchInfluencer();
  });
  
  document.getElementById('searchInput').addEventListener('input', function() {
    if (!this.value.trim()) {
      // Si se borra el texto de búsqueda, mostrar la sección de información
      toggleInfoSection(true);
      renderRecommendedInfluencers();
      if (document.getElementById('postsContainer')) {
        document.getElementById('postsContainer').innerHTML = '';
      }
    }
  });
});

function crearTarjetaRecomendada(data) {
  return `
    <div class="influencer-card-simple">
      ${data.is_featured ? `
        <div style="position:absolute;top:10px;right:15px;">
          <span style="color:#ffcc00;font-weight:600; margin-bottom: 8px;justify-text: center;font-size:0.9rem;white-space:nowrap;">TOP</span>
        <span class="material-symbols-outlined" style="color:#ffcc00;font-size:1.5rem;">workspace_premium</span>
        
        </div>
      ` : ''}
      <div class="influencer-name">${data.name || 'Sin nombre'}</div>
      <div class="influencer-username">@${data.username || 'username'}</div>
      <div class="influencer-description">${data.profile_description || 'Sin descripción disponible'}</div>
      <button class="more-info-btn" onclick="openModal('${data.name || ''}', '${data.country || ''}', '${data.posts_count || 0}', '${data.profile_link || '#'}')">
        Más información
      </button>
    </div>
  `;
}

// Funciones para el modal
function openModal(name, country, posts, profileLink) {
  const modal = document.getElementById('influencerModal');
  document.getElementById('modalInfluencerName').textContent = name;
  // Aquí aplicamos la traducción del país
  document.getElementById('modalCountry').textContent = translateCountry(country);
  document.getElementById('modalPosts').textContent = posts || '0';
  
  const visitButton = document.getElementById('modalVisitButton');
  visitButton.onclick = () => window.open(profileLink, '_blank');
  
  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('influencerModal').style.display = 'none';
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', function() {
  // Código existente...
  
  // Agregar event listeners para cerrar el modal
  document.querySelector('.close').onclick = closeModal;
  
  window.onclick = function(event) {
    const modal = document.getElementById('influencerModal');
    if (event.target === modal) {
      closeModal();
    }
  }
});