const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const bookRoutes = require('./routes/books');
app.use('/books', bookRoutes);

// Route racine pour le health check
app.get('/', (req, res) => {
  res.json({ message: 'Service de livres opérationnel' });
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connecté à MongoDB');
    // Démarrer le serveur après la connexion à la base de données
    app.listen(port, () => {
      console.log(`Service de livres démarré sur le port ${port}`);
    });
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err.message);
    process.exit(1);
  });

// Gestion des erreurs de MongoDB
mongoose.connection.on('error', err => {
  console.error('Erreur MongoDB:', err.message);
});