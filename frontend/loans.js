// Configuration de l'API
const LOANS_API = `${API_URL}/loans`;

// Éléments DOM
const loansList = document.getElementById('loansList');
const addLoanForm = document.getElementById('addLoanForm');

// Charger les emprunts
async function loadLoans() {
  try {
    const response = await fetch(LOANS_API);
    const loans = await response.json();
    
    // Vider la liste des emprunts
    loansList.innerHTML = '';
    
    // Afficher les emprunts non retournés
    const activeLoans = loans.filter(loan => !loan.isReturned);
    
    if (activeLoans.length === 0) {
      loansList.innerHTML = '<p>Aucun emprunt en cours.</p>';
      return;
    }
    
    activeLoans.forEach(loan => {
      const loanItem = document.createElement('div');
      loanItem.className = 'loan-item';
      
      // Formater la date
      const borrowDate = new Date(loan.borrowDate);
      const formattedDate = borrowDate.toLocaleDateString('fr-FR');
      
      loanItem.innerHTML = `
        <h4>${loan.bookTitle}</h4>
        <p>Emprunté par: ${loan.borrowerName}</p>
        <p>Date d'emprunt: ${formattedDate}</p>
        <div class="loan-actions">
          <button class="return-loan" data-id="${loan._id}">Retourner</button>
        </div>
      `;
      
      loansList.appendChild(loanItem);
    });
    
    // Ajouter les gestionnaires d'événements pour retourner des livres
    document.querySelectorAll('.return-loan').forEach(button => {
      button.addEventListener('click', returnLoan);
    });
    
  } catch (error) {
    console.error('Erreur lors du chargement des emprunts:', error);
  }
}

// Ajouter un emprunt
async function addLoan(event) {
  event.preventDefault();
  
  const bookId = document.getElementById('bookId').value;
  const borrowerName = document.getElementById('borrowerName').value;
  
  if (!bookId) {
    alert('Veuillez sélectionner un livre.');
    return;
  }
  
  try {
    const response = await fetch(LOANS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookId, borrowerName })
    });
    
    if (response.ok) {
      // Réinitialiser le formulaire
      addLoanForm.reset();
      // Recharger les emprunts et les livres
      loadLoans();
      loadBooks(); // Recharger les livres pour mettre à jour leur disponibilité
      alert('Emprunt enregistré avec succès !');
    } else {
      const error = await response.json();
      alert(`Erreur: ${error.message}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'emprunt:', error);
    alert('Une erreur est survenue lors de l\'ajout de l\'emprunt.');
  }
}

// Retourner un livre
async function returnLoan(event) {
  const loanId = event.target.getAttribute('data-id');
  
  try {
    const response = await fetch(`${LOANS_API}/${loanId}/return`, {
      method: 'PUT'
    });
    
    if (response.ok) {
      loadLoans();
      loadBooks(); // Recharger les livres pour mettre à jour leur disponibilité
      alert('Livre retourné avec succès !');
    } else {
      const error = await response.json();
      alert(`Erreur: ${error.message}`);
    }
  } catch (error) {
    console.error('Erreur lors du retour du livre:', error);
    alert('Une erreur est survenue lors du retour du livre.');
  }
}

// Gestionnaires d'événements
addLoanForm.addEventListener('submit', addLoan);
document.getElementById('showLoans').addEventListener('click', loadLoans);