<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
    <!-- Navigation -->
    <nav class="bg-indigo-700 text-white shadow-lg py-4">
      <div class="container mx-auto flex justify-between items-center px-4">
        <h1 class="text-2xl font-bold tracking-wide flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          Mon ChatGPT
        </h1>
        <button @click="logout" class="bg-red-500 hover:bg-red-600 transition-all px-4 py-2 rounded-lg font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm9 2.414L14.586 8H12V5.414zM10 9a1 1 0 100-2 1 1 0 000 2zm3 11v-1a3 3 0 00-6 0v1h6z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h6a1 1 0 01.707.293l5 5A1 1 0 0116 8v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm8 1.707l2.586 2.586L14.293 8H11V4.707z" clip-rule="evenodd" />
          </svg>
          Déconnexion
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Search + Create -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div class="w-full md:w-1/2 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
              v-model="searchKeyword"
              @input="searchConversations"
              type="text"
              placeholder="Rechercher une conversation..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
            @click="showCreateModal = true"
            class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-semibold px-6 py-3 rounded-lg shadow flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nouvelle Conversation
        </button>
      </div>

      <!-- Conversations List -->
      <div v-if="conversations.length" class="grid grid-cols-1 gap-4">
        <div
            v-for="conversation in conversations"
            :key="conversation.id"
            class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
        >
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">{{ conversation.title }}</h3>
              <p class="text-sm text-gray-500 flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                Créée le : {{ formatDate(conversation.createdAt) }}
              </p>
            </div>
            <div class="flex gap-3 w-full sm:w-auto">
              <router-link
                  :to="`/conversations/${conversation.id}`"
                  class="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                Voir
              </router-link>
              <button
                  @click="shareConversation(conversation.id)"
                  class="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 class="mt-4 text-xl font-medium text-gray-600">Aucune conversation trouvée</h3>
        <p class="mt-2 text-gray-500">Commencez par créer une nouvelle conversation</p>
        <button
            @click="showCreateModal = true"
            class="mt-6 bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-semibold px-6 py-3 rounded-lg shadow inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Créer une conversation
        </button>
      </div>
    </main>

    <!-- Modal: Créer une conversation -->
    <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md transform transition-all">
        <h2 class="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nouvelle conversation
        </h2>

        <form @submit.prevent="createConversation" class="space-y-5">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
                id="title"
                v-model="newConversationTitle"
                type="text"
                placeholder="Ex: Discussion sur l'IA"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
            />
          </div>

          <div class="flex justify-end gap-3">
            <button
                type="button"
                @click="showCreateModal = false"
                class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-5 py-2 rounded-lg transition-all flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              Annuler
            </button>
            <button
                type="submit"
                class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition-all flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'Conversations',
  data() {
    return {
      conversations: [],
      searchKeyword: '',
      showCreateModal: false,
      newConversationTitle: '',
    };
  },
  methods: {
    async fetchConversations() {
      try {
        const response = await api.get('/conversations');
        this.conversations = response.data;
      } catch (error) {
        console.error('Error fetching conversations:', error);
        this.showToast('Erreur lors du chargement des conversations', 'error');
      }
    },
    async searchConversations() {
      if (!this.searchKeyword.trim()) {
        this.fetchConversations();
        return;
      }
      try {
        const response = await api.get(`/conversations/search?keyword=${this.searchKeyword}`);
        this.conversations = response.data;
      } catch (error) {
        console.error('Error searching conversations:', error);
        this.showToast('Aucune conversation trouvée', 'warning');
      }
    },
    async createConversation() {
      try {
        const response = await api.post('/conversations', {
          title: this.newConversationTitle,
        });
        this.conversations.push(response.data);
        this.newConversationTitle = '';
        this.showCreateModal = false;
        this.showToast('Conversation créée avec succès', 'success');
      } catch (error) {
        console.error('Error creating conversation:', error);
        this.showToast('Erreur lors de la création de la conversation', 'error');
      }
    },
    async shareConversation(conversationId) {
      try {
        const response = await api.get(`/conversations/${conversationId}/share`);
        const shareLink = response.data.link;
        navigator.clipboard.writeText(shareLink);
        this.showToast('Lien de partage copié dans le presse-papiers', 'success');
      } catch (error) {
        console.error('Error generating share link:', error);
        this.showToast('Erreur lors de la génération du lien de partage', 'error');
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    showToast(message, type = 'info') {
      // Implémentez votre propre système de notification ici
      // Exemple basique avec alert mais vous pourriez utiliser une librairie de toast notifications
      alert(message);
    },
  },
  created() {
    this.fetchConversations();
  },
};
</script>