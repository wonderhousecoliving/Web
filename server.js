require('dotenv').config();
const express = require('express');
const { Client } = require('@notionhq/client');
const path = require('path');
const HostawayClient = require('./src/clients/HostawayClient.js');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory with absolute path
app.use(express.static(path.join(__dirname, 'public')));

// Initialize clients
// const hostaway = new HostawayClient({
//     clientId: process.env.HOSTAWAY_CLIENT_ID,
//     clientSecret: process.env.HOSTAWAY_CLIENT_SECRET
// });


// Add MIME types explicitly
app.use((req, res, next) => {
    if (req.path.endsWith('.mp4')) {
        res.type('video/mp4');
    }
    next();
});

// Route to serve amongus.html
app.get('/amongus', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'amongus.html'));
});

const notion = new Client({ auth: process.env.NOTION_TOKEN }); 

app.get('/api/notion-rooms', async (req, res) => {
    try {
        const databaseId = process.env.NOTION_DATABASE_ID;
        const response = await notion.databases.query({
            database_id: databaseId
        });

        const rooms = response.results.map(page => {
            const props = page.properties;
            const gallery = props.pics?.files?.map(fileObj => {
                if (fileObj.type === 'file') return fileObj.file.url;
                if (fileObj.type === 'external') return fileObj.external.url;
                return null;
            }).filter(Boolean);
         
            console.log(JSON.stringify(response));
            return {
                id: page.id,
                name: props.name?.title?.[0]?.plain_text || '',
                type: props.type?.select?.name || '',
                price: props.price?.number || 0,
                discountPercentage: props.discountPercentage?.number || 0,
                description: props.description?.rich_text?.[0]?.plain_text || '',
                listingId: props.listingId?.number || '',
                isTaken: props.isTaken?.checkbox || false,
                couponCode: props.couponCode?.rich_text?.[0]?.plain_text || '',
                showOnWebsite: props.showOnWebsite?.checkbox || false,
                gallery 
            };
        });

        res.json(rooms);
    } catch (error) {
        console.error('Notion API error:', error.body || error.message);
        res.status(500).json({ error: error.body || error.message });
    }
});

// Hostaway API routes
app.get('/api/listings', async (req, res) => {
    try {
        const listings = await hostaway.getListings();
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});



// Add a catch-all route to log 404s
app.use((req, res, next) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).send('Not Found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Static files being served from:', path.join(__dirname, 'public'));
});