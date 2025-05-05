// public/js/autoDiscount.js
// Si la URL contiene 'checkout', rellena el input de descuento automáticamente
console.log("autoDiscount.js loaded");
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.href.toLowerCase().includes('checkout')) {
        // Espera a que el input esté en el DOM (por si se carga dinámicamente)
        const fillDiscount = () => {
            const input = document.querySelector('input[placeholder="Discount"]');
            if (input) {
                input.value = 'TEST01';
                // Si quieres disparar un evento de input para frameworks/reactividad:
                input.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                // Si no está, vuelve a intentarlo en 300ms (por si el DOM aún no lo ha renderizado)
                setTimeout(fillDiscount, 300);
            }
        };
        fillDiscount();
        console.log("fillDiscount");
    }
}); 