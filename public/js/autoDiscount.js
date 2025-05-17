// public/js/autoDiscount.js
// Si la URL contiene 'checkout', rellena el input de descuento automáticamente
console.log("autoDiscount.js loaded");
document.addEventListener('DOMContentLoaded', () => {
    let elementClass ="sc-e50ef021-3 hftQFy";
    let element = document.querySelector(`.${elementClass}`);
    if (element) {
        console.log("element found");
        element.value = "TEST01";
    } else {
        console.log("element not found");
    }
    
}); 
