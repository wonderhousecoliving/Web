// public/js/autoDiscount.js
// Si la URL contiene 'checkout', rellena el input de descuento automáticamente
console.log("autoDiscount.js loaded");

function check30DaysStay(){
    let errorMessage = document.querySelector('.stay-duration-error');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'stay-duration-error';           
        errorMessage.textContent = 'Minimum stay is 30 days';
    }

    let element = document.querySelector(`.sc-e50ef021-3`);
    if (element) {
        console.log("element found");
        element.parentNode.insertBefore(errorMessage, element.nextSibling);
        // Si encontramos el elemento, detenemos el intervalo
        clearInterval(checkInterval);
    } else {
        console.log("element not found");
    }
}

// Verificación inicial
check30DaysStay();

// Verificar cada 5 segundos hasta encontrar el elemento
const checkInterval = setInterval(check30DaysStay, 5000);
