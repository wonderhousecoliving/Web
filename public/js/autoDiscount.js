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

    let elementClass ="sc-e50ef021-3 hftQFy";
    let element = document.querySelector(`.${elementClass}`);
    if (element) {
        console.log("element found");
        element.parentNode.insertBefore(errorMessage, element.nextSibling);

    } else {
        console.log("element not found");
    }
    
}; 


// Iniciar la validación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check30DaysStay);
} else {
    check30DaysStay();
}
