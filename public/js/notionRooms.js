// public/js/notionRooms.js
// Este script obtiene datos de habitaciones desde el backend (Express), que a su vez consulta Notion

// Función para obtener los datos de Notion desde el backend
async function fetchNotionRooms() {
    const res = await fetch('/api/notion-rooms');
    if (!res.ok) {
        throw new Error('Error fetching Notion data: ' + res.status);
    }
    const data = await res.json();
    // Transforma los resultados a tu formato de roomData
    return data.results.map(page => {
        const props = page.properties;
        return {
            type: props.Type?.select?.name || '',
            name: props.Name?.title?.[0]?.plain_text || '',
            listingId: props.ListingId?.number || '',
            description: props.Description?.rich_text?.[0]?.plain_text || '',
            price: props.Price?.rich_text?.[0]?.plain_text || '',
            offer: props.Offer?.rich_text?.[0]?.plain_text || '',
            discountedPrice: props.DiscountedPrice?.rich_text?.[0]?.plain_text || '',
            image: props.Image?.url || '',
            gallery: (props.Gallery?.multi_select || []).map(img => img.name)
        };
    });
}

// Ejemplo de uso:
// (async () => {
//     const rooms = await fetchNotionRooms();
//     console.log(rooms);
// })();

// Exporta la función para usarla en otros scripts
window.fetchNotionRooms = fetchNotionRooms; 