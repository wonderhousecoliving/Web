const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 