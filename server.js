const express = require('express');
const path = require('path');

const app = express();

// cPanel Passenger utilise des "Pipes" ou le port défini par process.env.PORT
const PORT = process.env.PORT || 8080;

try {
  // Optionnel : afficher le port pour debug
  console.log("Starting server on port:", PORT);

  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (err) {
  console.error("Critical error starting Express:", err);
}
