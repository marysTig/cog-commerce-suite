import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set up port (cPanel Passanger usually injects its own PORT variable)
const PORT = process.env.PORT || 8080;

// Serve static files from the 'dist' directory (the output of 'npm run build')
app.use(express.static(path.join(__dirname, 'dist')));

// Send all other requests to index.html (Required for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
