// public/js/autoDiscount.js
// Si la URL contiene 'checkout', rellena el input de descuento automáticamente
console.log("autoDiscount.js loaded");

function check30DaysStay(){
    // Primero verificamos si ya existe un mensaje de error
    let existingErrorMessage = document.querySelector('.stay-duration-error');
    if (existingErrorMessage) {
        console.log("Error message already exists, skipping");
        return;
    }

    let errorMessage = document.createElement('div');
    errorMessage.className = 'stay-duration-error';           
    errorMessage.textContent = 'Minimum stay is 30 days';

    let element = document.querySelector(`.sc-e50ef021-3`);
    if (element && element.textContent.trim() === 'No results') {
        console.log("element found with 'No results', adding error message");
        element.parentNode.insertBefore(errorMessage, element.nextSibling);
    } else {
        console.log("element not found or doesn't contain 'No results'");
    }
}

// Verificación inicial
check30DaysStay();

// Verificar cada segundo
const checkInterval = setInterval(check30DaysStay, 1000);

async function loadAndDisplayDiscounts() {
    console.log("Loading and displaying discounts");
    try {
        const response = await fetch('/api/notion-discounts');
        if (!response.ok) {
            throw new Error('Failed to fetch discounts');
        }
        const discounts = await response.json();
        
        const bannerDiv = document.querySelector('.hostAwayBanner');
        if (!bannerDiv) {
            console.error('hostAwayBanner div not found');
            return;
        }

        // Clear existing content
        bannerDiv.innerHTML = '';

        if (discounts.length > 0) {
            console.log("Discounts found");
            let discount = discounts[0];
            let discountElement = document.createElement('div');
            discountElement.className = 'discount-item';
            discountElement.innerHTML = `
                <h3>${discount.name}</h3>
                <p>${Math.round(discount.percent * 100)}% OFF</p>
            `;
        }else{
            console.log("No discounts found");
        }
       
    } catch (error) {
        console.error('Error loading discounts:', error);
    }
}

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', loadAndDisplayDiscounts);
loadAndDisplayDiscounts();


