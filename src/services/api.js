// src/services/api.js dans votre projet Vue.js

import axios from 'axios';

// Créer une instance Axios avec l'URL de base
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ajouter un intercepteur pour les requêtes
api.interceptors.request.use(
    (config) => {
        // Récupérer le token depuis le localStorage
        const token = localStorage.getItem('token');

        // Si le token existe, l'ajouter à l'en-tête Authorization
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('Erreur lors de la requête:', error);
        return Promise.reject(error);
    }
);

// Ajouter un intercepteur pour les réponses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Gérer les erreurs 401 (Unauthorized) - rediriger vers la page de connexion
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;