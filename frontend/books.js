// Configuration de l'API
const API_URL = window.location.origin;
const BOOKS_API = `${API_URL}/books`;

// Éléments DOM
const booksList = document.getElementById('booksList');
const addBookForm = document.getElementById('addBookForm');
const bookSelect = document.getElementById('bookId');

// Charger les livres
async function loadBooks() {
  try {
    const response = await fetch(BOOKS_API);
    const books = await response.json();
    
    // Vider la liste des livres
    booksList.innerHTML = '';
    bookSelect.innerHTML = '';
    
    // Ajouter option par défaut au select
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Sélectionner un livre --';
    bookSelect.appendChild(defaultOption);
    
    // Afficher les livres
    books.forEach(book => {
      // Ajouter à la liste des livres
      const bookItem = document.createElement('div');
      bookItem.className = `book-item ${book.isAvailable ? '' : 'unavailable'}`;
      bookItem.innerHTML = `
        <h4>${book.title}</h4>
        <p>Auteur: ${book.author}</p>
        <p>Statut: ${book.isAvailable ? 'Disponible' : 'Emprunté'}</p>
        <div class="book-actions">
          ${book.isAvailable ? '' : '<button class="return-book" data-id="' + book._id + '">Marquer comme retourné</button>'}
          <button class="delete-book" data-id="${book._id}">Supprimer</button>
        </div>
      `;
      booksList.appendChild(bookItem);
      
      // Ajouter au select pour les emprunts (uniquement si disponible)
      if (book.isAvailable) {
        const option = document.createElement('option');
        option.value = book._id;
        option.textContent = `${book.title} (${book.author})`;
        bookSelect.appendChild(option);
      }
    });
    
    // Ajouter les gestionnaires d'événements pour supprimer des livres
    document.querySelectorAll('.delete-book').forEach(button => {
      button.addEventListener('click', deleteBook);
    });
    
    // Ajouter les gestionnaires d'événements pour marquer un livre comme retourné
    document.querySelectorAll('.return-book').forEach(button => {
      button.addEventListener('click', markBookAsReturned);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des livres:', error);
  }
}

// Ajouter un livre
async function addBook(event) {
  event.preventDefault();
  
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  
  try {
    const response = await fetch(BOOKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, author })
    });
    
    if (response.ok) {
      // Réinitialiser le formulaire
      addBookForm.reset();
      // Recharger la liste des livres
      loadBooks();
      alert('Livre ajouté avec succès !');
    } else {
      const error = await response.json();
      alert(`Erreur: ${error.message}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    alert('Une erreur est survenue lors de l\'ajout du livre.');
  }
}

// Supprimer un livre
async function deleteBook(event) {
  const bookId = event.target.getAttribute('data-id');
  
  if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
    try {
      const response = await fetch(`${BOOKS_API}/${bookId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadBooks();
        alert('Livre supprimé avec succès !');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du livre:', error);
      alert('Une erreur est survenue lors de la suppression du livre.');
    }
  }
}

// Marquer un livre comme retourné (version simplifiée, normalement fait via le service d'emprunt)
async function markBookAsReturned(event) {
  const bookId = event.target.getAttribute('data-id');
  
  try {
    const response = await fetch(`${BOOKS_API}/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isAvailable: true })
    });
    
    if (response.ok) {
      loadBooks();
      alert('Livre marqué comme retourné !');
    } else {
      const error = await response.json();
      alert(`Erreur: ${error.message}`);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    alert('Une erreur est survenue lors de la mise à jour du livre.');
  }
}

// Gestionnaires d'événements
addBookForm.addEventListener('submit', addBook);

// Charger les livres au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
});