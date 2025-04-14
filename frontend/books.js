// Configuration de l'API
const API_URL = window.location.origin;
const BOOKS_API = `${API_URL}/books`;

// Éléments DOM
const booksList = document.getElementById('booksList');
const addBookForm = document.getElementById('addBookForm');
const bookSelect = document.getElementById('bookId');

// Fonction pour échapper les caractères HTML (prévention XSS)
function escapeHTML(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fonction pour afficher un message temporaire
function showMessage(message, isError = false) {
  // Créer ou réutiliser un conteneur de message
  let messageContainer = document.getElementById('message-container');
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '20px';
    messageContainer.style.right = '20px';
    messageContainer.style.zIndex = '1000';
    document.body.appendChild(messageContainer);
  }

  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messageElement.style.padding = '10px 15px';
  messageElement.style.margin = '5px';
  messageElement.style.borderRadius = '5px';
  messageElement.style.color = 'white';
  messageElement.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71';
  messageElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  messageContainer.appendChild(messageElement);
  
  // Supprimer le message après 5 secondes
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

// Fonction pour les appels API avec gestion d'erreurs
async function apiCall(url, options = {}) {
  try {
    console.log(`API Call: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur API:`, error);
    throw error;
  }
}

// Charger les livres
async function loadBooks() {
  try {
    console.log('Chargement des livres...');
    const books = await apiCall(BOOKS_API);
    console.log(`${books.length} livres récupérés`, books);
    
    // Vider la liste des livres
    booksList.innerHTML = '';
    bookSelect.innerHTML = '';
    
    // Ajouter option par défaut au select
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Sélectionner un livre --';
    bookSelect.appendChild(defaultOption);
    
    if (books.length === 0) {
      booksList.innerHTML = '<div class="empty-state">Aucun livre disponible</div>';
      return;
    }
    
    // Afficher les livres
    books.forEach(book => {
      // Gérer à la fois _id (MongoDB) et id (version simple)
      const bookId = book._id || book.id;
      
      if (!book || !bookId) {
        console.warn('Livre invalide détecté:', book);
        return;
      }
      
      // Ajouter à la liste des livres
      const bookItem = document.createElement('div');
      bookItem.className = `book-item ${book.isAvailable ? '' : 'unavailable'}`;
      bookItem.innerHTML = `
        <h4>${escapeHTML(book.title)}</h4>
        <p>Auteur: ${escapeHTML(book.author)}</p>
        <p>Statut: ${book.isAvailable ? 'Disponible' : 'Emprunté'}</p>
        <div class="book-actions">
          ${book.isAvailable ? '' : `<button class="return-book" data-id="${bookId}">Marquer comme retourné</button>`}
          <button class="delete-book" data-id="${bookId}">Supprimer</button>
        </div>
      `;
      booksList.appendChild(bookItem);
      
      // Ajouter au select pour les emprunts (uniquement si disponible)
      if (book.isAvailable) {
        const option = document.createElement('option');
        option.value = bookId;
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
    showMessage(`Erreur: ${error.message}`, true);
  }
}

// Ajouter un livre
async function addBook(event) {
  event.preventDefault();
  
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  
  if (!title || !author) {
    showMessage('Veuillez remplir tous les champs', true);
    return;
  }
  
  try {
    await apiCall(BOOKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, author })
    });
    
    // Réinitialiser le formulaire
    addBookForm.reset();
    // Recharger la liste des livres
    loadBooks();
    showMessage('Livre ajouté avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    showMessage(`Erreur: ${error.message}`, true);
  }
}

// Supprimer un livre
async function deleteBook(event) {
  const bookId = event.target.getAttribute('data-id');
  
  if (!bookId) {
    showMessage('ID de livre invalide', true);
    return;
  }
  
  if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
    try {
      console.log(`Tentative de suppression du livre avec ID: ${bookId}`);
      
      await apiCall(`${BOOKS_API}/${bookId}`, {
        method: 'DELETE'
      });
      
      loadBooks();
      showMessage('Livre supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression du livre:', error);
      showMessage(`Erreur: ${error.message}`, true);
    }
  }
}

// Marquer un livre comme retourné
async function markBookAsReturned(event) {
  const bookId = event.target.getAttribute('data-id');
  
  if (!bookId) {
    showMessage('ID de livre invalide', true);
    return;
  }
  
  try {
    console.log(`Marquage du livre ${bookId} comme retourné`);
    
    await apiCall(`${BOOKS_API}/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isAvailable: true })
    });
    
    loadBooks();
    showMessage('Livre marqué comme retourné !');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    showMessage(`Erreur: ${error.message}`, true);
  }
}

// Gestionnaires d'événements
addBookForm.addEventListener('submit', addBook);

// Charger les livres au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  console.log('Application de gestion de bibliothèque initialisée');
  loadBooks();
});

// Ajouter du style pour les notifications
const style = document.createElement('style');
style.textContent = `
  .book-item {
    margin-bottom: 15px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .book-item.unavailable {
    background-color: #f8f9fa;
    border-left: 3px solid #dc3545;
  }
  
  .book-actions {
    margin-top: 10px;
  }
  
  .book-actions button {
    margin-right: 5px;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .delete-book {
    background-color: #dc3545;
    color: white;
    border: none;
  }
  
  .return-book {
    background-color: #007bff;
    color: white;
    border: none;
  }
  
  .empty-state {
    padding: 20px;
    text-align: center;
    color: #6c757d;
    font-style: italic;
  }
`;
document.head.appendChild(style);