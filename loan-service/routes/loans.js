const express = require('express');
const axios = require('axios');
const router = express.Router();
const Loan = require('../models/Loan');

const bookServiceUrl = process.env.BOOK_SERVICE_URL || 'http://book-service:8080';

// Obtenir tous les emprunts
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find();
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir un emprunt par ID
router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Emprunt non trouvé' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Créer un nouvel emprunt
router.post('/', async (req, res) => {
  try {
    // Vérifier la disponibilité du livre
    const bookResponse = await axios.get(`${bookServiceUrl}/books/${req.body.bookId}`);
    const book = bookResponse.data;
    
    if (!book.isAvailable) {
      return res.status(400).json({ message: 'Ce livre n\'est pas disponible actuellement' });
    }
    
    // Créer l'emprunt
    const loan = new Loan({
      bookId: book._id,
      bookTitle: book.title,
      borrowerName: req.body.borrowerName
    });
    
    // Mettre à jour la disponibilité du livre
    await axios.put(`${bookServiceUrl}/books/${book._id}`, { isAvailable: false });
    
    // Sauvegarder l'emprunt
    const newLoan = await loan.save();
    res.status(201).json(newLoan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Retourner un livre emprunté
router.put('/:id/return', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Emprunt non trouvé' });
    
    if (loan.isReturned) {
      return res.status(400).json({ message: 'Ce livre a déjà été retourné' });
    }
    
    // Mettre à jour l'emprunt
    loan.isReturned = true;
    loan.returnDate = new Date();
    
    // Mettre à jour la disponibilité du livre
    await axios.put(`${bookServiceUrl}/books/${loan.bookId}`, { isAvailable: true });
    
    const updatedLoan = await loan.save();
    res.json(updatedLoan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir tous les emprunts par emprunteur
router.get('/borrower/:name', async (req, res) => {
  try {
    const loans = await Loan.find({ borrowerName: req.params.name });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;