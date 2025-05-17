function validateStayDuration() {
    // Función para convertir la fecha del formato "15 June 2025" a Date
    function parseDate(dateStr) {
        const months = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3,
            'May': 4, 'June': 5, 'July': 6, 'August': 7,
            'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        
        const [day, month, year] = dateStr.split(' ');
        return new Date(year, months[month], parseInt(day));
    }

    // Función para calcular la diferencia en días
    function getDaysDifference(date1, date2) {
        const diffTime = Math.abs(date2 - date1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Función para mostrar el mensaje de error y ocultar el botón
    function showErrorMessage() {
        // Buscar si ya existe un mensaje de error
        let errorMessage = document.querySelector('.stay-duration-error');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'stay-duration-error';           
            errorMessage.textContent = 'Minimum stay is 30 days';
            
            // Obtener el botón de búsqueda
            const searchButton = document.querySelector('.hsbw-main-button');
            if (searchButton) {
                // Ocultar el botón
                searchButton.style.display = 'none';
                // Insertar el mensaje después del botón
                searchButton.parentNode.insertBefore(errorMessage, searchButton.nextSibling);
            }
        }
    }

    // Función para remover el mensaje de error y mostrar el botón
    function removeErrorMessage() {
        const errorMessage = document.querySelector('.stay-duration-error');
        if (errorMessage) {
            errorMessage.remove();
        }

        // Mostrar el botón de búsqueda
        const searchButton = document.querySelector('.hsbw-main-button');
        if (searchButton) {
            searchButton.style.display = '';
        }
    }

    // Función principal de validación
    function checkDates() {
        const checkInElement = document.querySelector('.hsbw-grid_checkin .hsbw-value');
        const checkOutElement = document.querySelector('.hsbw-grid_checkout .hsbw-value');

        if (checkInElement && checkOutElement) {
            const checkInDate = parseDate(checkInElement.textContent.trim());
            const checkOutDate = parseDate(checkOutElement.textContent.trim());
            const daysDifference = getDaysDifference(checkInDate, checkOutDate);

            console.log('Check-in date:', checkInDate);
            console.log('Check-out date:', checkOutDate);
            console.log('Days difference:', daysDifference);

            if (daysDifference < 30) {
                showErrorMessage();
            } else {
                removeErrorMessage();
            }
        }
    }

    // Configurar el observer para detectar cambios en el DOM
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                checkDates();
            }
        }
    });

    // Iniciar la observación del documento
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Verificación inicial
    checkDates();
}

// Iniciar la validación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validateStayDuration);
} else {
    validateStayDuration();
}
