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
