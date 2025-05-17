// public/js/autoDiscount.js
// Si la URL contiene 'checkout', rellena el input de descuento automáticamente
console.log("autoDiscount.js loaded");

function check3BanDaysStay(){
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
    } else {
        console.log("element not found");
    }
}

// Configurar el observer para detectar cambios en el DOM
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            check3BanDaysStay();
        }
    }
});

// Iniciar la observación del documento
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Verificación inicial
check3BanDaysStay();

// Verificación periódica cada 2 segundos
setInterval(check3BanDaysStay, 2000);
