const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory with absolute path
app.use(express.static(path.join(__dirname, 'public')));

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