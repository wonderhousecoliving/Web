// Datos de las habitaciones
const roomsData = [
    {
        type: "Apartments - Private bathroom",
        name: "White Rabbit Apartment",
        description: "Private access, TV, kitchenette, sofa, ensuite bathroom.",
        price: "1770€/Month",
        offer: "Special offer! 50% off!",
        discountedPrice: "885€/Month",
        image: "imgs/WonderPicture1.png",
        gallery: [
            "imgs/WonderPicture1.png",
            "imgs/WonderPicture0.png",
            "imgs/WonderPicture1.png",
            "imgs/WonderPicture1.png"
        ]
    },
    {
        type: "Private Room",
        name: "Mad Hatter Room",
        description: "Cozy private room with shared bathroom, desk, and wardrobe.",
        price: "1200€/Month",
        offer: "Special offer! 30% off!",
        discountedPrice: "840€/Month",
        image: "imgs/WonderPicture1.png",
        gallery: [
            "imgs/WonderPicture1.png",
            "imgs/WonderPicture1.png",
            "imgs/WonderPicture1.png",
            "imgs/WonderPicture1.png"
        ]
    },
    {
        type: "Shared Room",
        name: "Cheshire Cat Room",
        description: "Comfortable shared room with bunk beds, perfect for making new friends.",
        price: "800€/Month",
        offer: "Special offer! 25% off!",
        discountedPrice: "600€/Month",
        image: "imgs/WonderPicture1.png",
        gallery: [
            "imgs/WonderPicture1.png",
            "imgs/WonderPicture1.png",
            "imgs/WonderPicture1.png",
            "imgs/WonderPicture1.png"
        ]
    }
];

// Función para cargar la plantilla
async function loadRoomTemplate() {
    try {
        const response = await fetch('templates/roomWidgetTemplate.html');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading template:', error);
        return null;
    }
}

// Función para renderizar una habitación
function renderRoom(roomData, template) {
    let html = template;
    
    // Reemplazar los placeholders con los datos reales
    html = html.replace('{{type}}', roomData.type);
    html = html.replace('{{name}}', roomData.name);
    html = html.replace('{{description}}', roomData.description);
    html = html.replace('{{price}}', roomData.price);
    html = html.replace('{{offer}}', roomData.offer);
    html = html.replace('{{discountedPrice}}', roomData.discountedPrice);
    html = html.replace('{{image}}', roomData.image);
    
    return html;
}

// Función para inicializar la galería de imágenes
function initGallery(roomWidget, roomData) {
    const mainImage = roomWidget.querySelector('#mainImage');
    const thumbnails = roomWidget.querySelectorAll('.galleryThumbnail');
    
    // Actualizar las miniaturas con las imágenes de la galería
    thumbnails.forEach((thumbnail, index) => {
        if (roomData.gallery[index]) {
            thumbnail.src = roomData.gallery[index];
            thumbnail.alt = `${roomData.name} - Gallery image ${index + 1}`;
            
            // Añadir evento click para cambiar la imagen principal
            thumbnail.addEventListener('click', () => {
                mainImage.src = roomData.gallery[index];
                mainImage.alt = `${roomData.name} - Gallery image ${index + 1}`;
            });
        }
    });
}

// Función principal para cargar y renderizar todas las habitaciones
async function loadAndRenderRooms() {
    const template = await loadRoomTemplate();
    if (!template) return;

    const roomsContainer = document.getElementById('roomsContainer');
    if (!roomsContainer) return;

    // Renderizar cada habitación
    roomsData.forEach(roomData => {
        const roomHtml = renderRoom(roomData, template);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = roomHtml;
        const roomWidget = tempDiv.firstElementChild;
        
        // Inicializar la galería para esta habitación
        initGallery(roomWidget, roomData);
        
        roomsContainer.appendChild(roomWidget);
    });
}

// Cargar las habitaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadAndRenderRooms); 