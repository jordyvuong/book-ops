# Système de Gestion de Bibliothèque avec Microservices

Ce projet est un système de gestion de bibliothèque implémenté avec une architecture microservices. Il utilise Docker, Kubernetes et Istio pour déployer et gérer les différents services.

## Architecture

Le système est composé de trois composants principaux :

1. **Service de Livres** - Gère l'inventaire des livres (Node.js)
2. **Service d'Emprunt** - Gère les emprunts de livres (Node.js)
3. **Frontend** - Interface utilisateur simple (HTML/CSS/JavaScript)

Chaque service est conteneurisé avec Docker et déployé sur Kubernetes avec Istio comme API Gateway.

## Prérequis

- Docker
- Minikube
- kubectl
- Istio

## Démarrage rapide

Pour déployer l'application:

1. Clonez le dépôt et modifiez les images Docker dans `deployment.yml`
2. Démarrez Minikube et installez Istio
3. Appliquez la configuration: `kubectl apply -f deployment.yml`
4. Accédez à l'application: `kubectl -n istio-system port-forward deployment/istio-ingressgateway 31380:8080`
5. Ouvrez votre navigateur sur http://localhost:31380

## Utilisation

L'interface utilisateur vous permet de :

1. **Gestion des livres** :

   - Ajouter de nouveaux livres
   - Consulter la liste des livres
   - Supprimer des livres

2. **Gestion des emprunts** :
   - Emprunter des livres
   - Consulter les emprunts en cours
   - Retourner des livres

## Structure du projet

```

library-system/
├── book-service/ # Service de gestion des livres
├── loan-service/ # Service de gestion des emprunts
├── frontend/ # Interface utilisateur
├── deployment.yml # Configuration Kubernetes
└── README.md # Documentation

```

## API REST

### Service de Livres (port 8080)

- `GET /books` - Récupérer tous les livres
- `GET /books/:id` - Récupérer un livre par ID
- `POST /books` - Ajouter un nouveau livre
- `PUT /books/:id` - Modifier un livre
- `DELETE /books/:id` - Supprimer un livre

### Service d'Emprunt (port 8081)

- `GET /loans` - Récupérer tous les emprunts
- `GET /loans/:id` - Récupérer un emprunt par ID
- `POST /loans` - Créer un nouvel emprunt
- `PUT /loans/:id/return` - Retourner un livre

## Mise à l'échelle

Pour augmenter le nombre d'instances d'un service :

```bash
kubectl scale deployment book-service --replicas=3
```

## Surveillance

Accédez au dashboard Kubernetes :

```bash
minikube dashboard
```
