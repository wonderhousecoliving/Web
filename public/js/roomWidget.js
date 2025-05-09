// Datos de las habitaciones
var roomsData = [
    {
        type: "Shared Room",
        name: "Oisters",
        listingId: 384404,
        description: "",
        showOnWebsite: false,
        couponCode: "OPENING40",
        price: 1800,
        discountPercentage: 0.4,
        image: "imgs/rooms/tweeddle/Tweeddle1.png",
        gallery: [
            "imgs/rooms/tweeddle/Tweeddle1.png",
            "imgs/rooms/tweeddle/Tweeddle2.png",
            "imgs/rooms/tweeddle/Tweeddle3.png",
            "imgs/rooms/tweeddle/Tweeddle4.png"
        ]
    },
    {
        type: "Private Room with private bathroom",
        name: "White Rabbit Apartment",
        listingId: 383949,
        description: "Super sweet room with a private bathroom. Lots of light from the window facing nature and a comfy desk to work from the room.",
        showOnWebsite: true,
        couponCode: "OPENING40",
        price: 1350,
        discountPercentage: 0.4,
        image: "imgs/rooms/Walrus/Walrus1.jpg",
        gallery: [
           "imgs/rooms/Walrus/Walrus1.jpg",
           "imgs/rooms/Walrus/Walrus2.jpg",
            "imgs/rooms/Cat/Cat1.jpg",
            "imgs/rooms/Alice/Alice1.jpg"
           
        ]
    },
    {
        type: "Private Room with shared bathroom",
        name: "Shared bathroom",
        listingId: 383946,
        description: "Spacious room with a shared bathroom. Some have access to an amazing balcony. The light from the window makes it look like Vermeer painting. No kinding.",
        showOnWebsite: true,
        couponCode: "OPENING40",
        price: 1200,
        discountPercentage: 0.4,
        image: "imgs/rooms/Madhatter/MadHatter1.jpg",
        gallery: [
            "imgs/rooms/Madhatter/MadHatter1.jpg",
            "imgs/rooms/Madhatter/MadHatter2.jpg",
            "imgs/rooms/Madhatter/MadHatter3.jpg",
            "imgs/rooms/QueenHearts/QueenOhHearts1.jpg",
            "imgs/rooms/QueenHearts/QueenOhHearts2.jpg"
        ]
    },
    {
        type: "Suite with private bathroom",
        name: "Tweeddle",
        listingId: 384402,
        description: "Suite with a private bathroom and a separate living room, offering comfort and privacy with distinct spaces for relaxing and unwinding.",
        showOnWebsite: true,
        couponCode: "OPENING40",
        price: 1800,
        discountPercentage: 0.4,
        image: "imgs/rooms/tweeddle/Tweeddle1.png",
        gallery: [
            "imgs/rooms/tweeddle/Tweeddle1.png",
            "imgs/rooms/tweeddle/Tweeddle2.png",
            "imgs/rooms/tweeddle/Tweeddle3.png",
            "imgs/rooms/tweeddle/Tweeddle4.png"
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
    let discountedPrice = Math.floor(roomData.price * (1 - roomData.discountPercentage));
    let offer = "";
    if (discountedPrice < roomData.price) {
        offer = roomData.discountPercentage*100+"% off with code: <strong>"+roomData.couponCode+"</strong>";
    }
    // Reemplazar los placeholders con los datos reales
    html = html.replace('{{type}}', roomData.type);
    html = html.replace('{{name}}', roomData.name);
    html = html.replace('{{description}}', roomData.description);
    html = html.replace('{{price}}', roomData.price+"€/Month");
    html = html.replace('{{offer}}', offer);
    html = html.replace('{{discountedPrice}}', discountedPrice+"€/Month");
    html = html.replace('{{image}}', roomData.gallery[0]);
    html = html.replace('{{listingId}}', roomData.listingId);
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
            
            // Cambiar el evento de click a hover
            thumbnail.addEventListener('mouseenter', () => {
                mainImage.src = roomData.gallery[index];
                mainImage.alt = `${roomData.name} - Gallery image ${index + 1}`;
            });
        }
    });
}
async function fetchNotionRooms() {
    const res = await fetch('/api/notion-rooms');
    if (!res.ok) {
        throw new Error('Error fetching Notion data: ' + res.status);
    }
    const data = await res.json();
    console.log(data);
    return data;
}
// Función principal para cargar y renderizar todas las habitaciones
async function loadAndRenderRooms() {
    roomsData = await fetchNotionRooms();
    console.log(JSON.stringify(roomsData));
    const template = await loadRoomTemplate();
    if (!template) return;

    const roomsContainer = document.getElementById('roomsContainer');
    if (!roomsContainer) return;

    // Renderizar cada habitación
    roomsData.forEach(roomData => {
        if (roomData.showOnWebsite) {
        const roomHtml = renderRoom(roomData, template);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = roomHtml;
        const roomWidget = tempDiv.firstElementChild;
     
        // Inicializar la galería para esta habitación
        initGallery(roomWidget, roomData);
        
        roomsContainer.appendChild(roomWidget);
        }
    });
}



// Cargar las habitaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadAndRenderRooms); 