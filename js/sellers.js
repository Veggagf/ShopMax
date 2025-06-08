import {
  getSellerProfile,
  getSellerReviews,
  getSellerProducts
} from './api.js';

async function displaySellerCard() {
  try {
    const [profileData, reviewsData, productsData] = await Promise.all([
      getSellerProfile(),
      getSellerReviews(),
      getSellerProducts()
    ]);

    const seller = profileData.seller || {};
    const topProducts = productsData.products?.slice(0, 3) || [];
    const reviews = reviewsData.reviews || [];

    const sellerList = document.querySelector(".sellers-list");
    if (!sellerList) {
      console.error("No se encontró el contenedor .sellers-list en el HTML.");
      return;
    }

    sellerList.innerHTML = ""; // Limpiar contenido previo

    const card = document.createElement("div");
    card.className = "seller-card";
    card.innerHTML = `
      <img src="${seller.logo || ''}" alt="Logo del vendedor" style="max-width:80px;margin-bottom:15px;">
      <h2>${seller.seller_name || 'Nombre no disponible'}</h2>
      <p><strong>Ubicación:</strong> ${seller.business_address || 'No disponible'}</p>
      <p class="seller-rating">⭐ ${seller.average_rating || 'N/A'} / 5</p>
      <p><strong>Total calificaciones:</strong> ${seller.total_ratings || 'N/A'}</p>
      <p><strong>Porcentaje positivo:</strong> ${seller.positive_feedback_percentage || 'N/A'}%</p>
      <p><strong>Top productos:</strong></p>
      <ul>
        ${topProducts.map(p => `<li>${p.product_title}</li>`).join("")}
      </ul>
      <br>
      <button class="view-products">Ver todos los productos</button>
    `;

    sellerList.appendChild(card);

    // Activar botón de ver más
    card.querySelector(".view-products").addEventListener("click", () => {
      openModal(seller, productsData.products, reviews);
    });
  } catch (error) {
    console.error("Error mostrando la tarjeta del vendedor:", error);
  }
}

function openModal(seller, products = [], reviews = []) {
  const modal = document.getElementById("sellerModal");
  const sellerName = document.getElementById("sellerName");
  const productList = document.getElementById("productList");

  if (!modal || !sellerName || !productList) {
    console.error("Faltan elementos del DOM necesarios para el modal.");
    return;
  }

  sellerName.textContent = seller.seller_name || "Vendedor";

  productList.innerHTML = `
    <p><strong>Dirección:</strong> ${seller.business_address || 'No disponible'}</p>
    <p><strong>Teléfono:</strong> ${seller.business_phone || 'No disponible'}</p>
    <h3>Productos:</h3>
    <ul>
      ${products.slice(0, 10).map(p => `<li>${p.product_title}</li>`).join("")}
    </ul>
    <h3>Comentarios recientes:</h3>
    <ul>
      ${reviews.slice(0, 5).map(r => `<li>"${r.title}" - ${r.reviewer}</li>`).join("")}
    </ul>
  `;

  modal.style.display = "block";


  document.querySelector(".close")?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
}

// Iniciar al cargar
document.addEventListener("DOMContentLoaded", displaySellerCard);
