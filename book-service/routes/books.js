const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Obtenir tous les livres
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir un livre par ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Créer un nouveau livre
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author
  });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mettre à jour un livre
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    
    if (req.body.title) book.title = req.body.title;
    if (req.body.author) book.author = req.body.author;
    if (req.body.isAvailable !== undefined) book.isAvailable = req.body.isAvailable;
    
    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer un livre
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    
    await Book.deleteOne({ _id: req.params.id });
    res.json({ message: 'Livre supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;