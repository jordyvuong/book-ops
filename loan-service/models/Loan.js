const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  borrowerName: {
    type: String,
    required: true,
    trim: true
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date,
    default: null
  },
  isReturned: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Loan', LoanSchema);