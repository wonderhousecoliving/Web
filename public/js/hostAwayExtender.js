// public/js/autoDiscount.js
// Si la URL contiene 'checkout', rellena el input de descuento automáticamente
console.log("autoDiscount.js loaded");
let bannerChecked = false;

function check30DaysStay(){
    loadAndDisplayDiscounts();
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
    console.log("Discounts loader:", bannerChecked);
    let bannerDiv = document.querySelector('.hostAwayBanner');

    if (!bannerChecked) {
        let bannerDiv = document.querySelector('.hostAwayBanner');
        if (!bannerDiv) {
            return;
        }else{
            bannerChecked = true;
        }
    } 
    else{
        console.log("Banner already checked, skipping");
        return;
    }

    bannerDiv = document.querySelector('.hostAwayBanner');
    console.log("Loading and displaying discounts");
    try {
        const response = await fetch('https://www.wonderhousecoliving.com/api/notion-discounts');
        if (!response.ok) {
            throw new Error('Failed to fetch discounts');
        }
        console.log("grabbing discounts");
        const discounts = await response.json();
        console.log("discounts", discounts);
        

        // Clear existing content
        bannerDiv.innerHTML = '';

        if (discounts.length > 0) {
            console.log("Discounts found");
            let discount = discounts[0];
           
            bannerDiv.innerHTML = `
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


