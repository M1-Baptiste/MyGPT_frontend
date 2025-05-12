<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
    <!-- Navigation -->
    <nav class="bg-blue-700 text-white shadow-md py-4">
      <div class="container mx-auto flex justify-between items-center px-4">
        <h1 class="text-2xl font-bold tracking-wide">Mon ChatGPT</h1>
        <button @click="logout" class="bg-red-500 hover:bg-red-600 transition-all px-4 py-2 rounded-lg font-semibold">
          Déconnexion
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Search + Create -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <input
            v-model="searchKeyword"
            @input="searchConversations"
            type="text"
            placeholder="Rechercher une conversation..."
            class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
            @click="showCreateModal = true"
            class="bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold px-6 py-2 rounded-lg shadow"
        >
          Nouvelle Conversation
        </button>
      </div>

      <!-- Conversations List -->
      <div v-if="conversations.length" class="grid grid-cols-1 gap-4">
        <div
            v-for="conversation in conversations"
            :key="conversation.id"
            class="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all flex justify-between items-center"
        >
          <div>
            <h3 class="text-xl font-semibold text-gray-800">{{ conversation.title }}</h3>
            <p class="text-sm text-gray-500">Créée le : {{ formatDate(conversation.createdAt) }}</p>
          </div>
          <div class="flex gap-2">
            <router-link
                :to="`/conversations/${conversation.id}`"
                class="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-all"
            >
              Voir
            </router-link>
            <button
                @click="shareConversation(conversation.id)"
                class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition-all"
            >
              Partager
            </button>
          </div>
        </div>
      </div>
      <p v-else class="text-center text-gray-500 mt-8">Aucune conversation trouvée.</p>
    </main>

    <!-- Modal: Créer une conversation -->
    <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Créer une nouvelle conversation</h2>
        <form @submit.prevent="createConversation" class="space-y-4">
          <input
              v-model="newConversationTitle"
              type="text"
              placeholder="Titre de la conversation"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
          />
          <div class="flex justify-end gap-2">
            <button
                type="button"
                @click="showCreateModal = false"
                class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-all"
            >
              Annuler
            </button>
            <button
                type="submit"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all"
            >
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
        alert('Failed to load conversations');
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
        alert('No conversations found');
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
      } catch (error) {
        console.error('Error creating conversation:', error);
        alert('Failed to create conversation');
      }
    },
    async shareConversation(conversationId) {
      try {
        const response = await api.get(`/conversations/${conversationId}/share`);
        const shareLink = response.data.link;
        navigator.clipboard.writeText(shareLink);
        alert('Share link copied to clipboard: ' + shareLink);
      } catch (error) {
        console.error('Error generating share link:', error);
        alert('Failed to generate share link');
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  created() {
    this.fetchConversations();
  },
};
</script>