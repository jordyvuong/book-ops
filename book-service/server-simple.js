const express = require('express');
const app = express();
const port = 8080;

app.use(express.json());

// Données en mémoire
const books = [
  { id: 1, title: "L'Art de la Guerre", author: "Sun Tzu", isAvailable: true },
  { id: 2, title: "1984", author: "George Orwell", isAvailable: true }
];

// Routes pour les livres
app.get('/books', (req, res) => {
  res.json(books);
});

app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
  res.json(book);
});

app.post('/books', (req, res) => {
  console.log('Ajout d\'un livre:', req.body);
  const newBook = {
    id: books.length + 1,
    title: req.body.title,
    author: req.body.author,
    isAvailable: true
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ message: 'Livre non trouvé' });
  
  const updatedBook = { ...books[index] };
  if (req.body.title) updatedBook.title = req.body.title;
  if (req.body.author) updatedBook.author = req.body.author;
  if (req.body.isAvailable !== undefined) updatedBook.isAvailable = req.body.isAvailable;
  
  books[index] = updatedBook;
  res.json(updatedBook);
});

app.delete('/books/:id', (req, res) => {
  // Vérification de l'ID
  if (!req.params.id || req.params.id === 'undefined') {
    return res.status(400).json({ message: 'ID de livre invalide' });
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'L\'ID du livre doit être un nombre' });
  }

  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ message: 'Livre non trouvé' });
  
  books.splice(index, 1);
  res.json({ message: 'Livre supprimé' });
});

// Route de base pour health check
app.get('/', (req, res) => {
  res.json({ status: 'Service de livres opérationnel' });
});

app.listen(port, () => {
  console.log(`Service de livres démarré sur le port ${port}`);
});