<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
    <!-- Navigation -->
    <nav class="bg-blue-700 text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Mon ChatGPT - {{ conversation?.title || 'Loading...' }}</h1>
        <div class="flex gap-4">
          <router-link to="/conversations" class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
            Back to Conversations
          </router-link>
          <button @click="logout" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mx-auto p-6">
      <!-- Search Messages -->
      <div class="mb-6">
        <input
            v-model="searchKeyword"
            @input="searchMessages"
            type="text"
            placeholder="Search messages in this conversation..."
            class="w-full p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Messages List -->
      <div v-if="messages.length" class="space-y-4">
        <div
            v-for="message in messages"
            :key="message.id"
            class="flex items-end"
            :class="message.userMessage ? 'justify-end' : 'justify-start'"
        >
          <!-- Avatar -->
          <div v-if="!message.userMessage" class="mr-2">
            <img src="https://ui-avatars.com/api/?name=AI" class="w-8 h-8 rounded-full" alt="AI Avatar" />
          </div>

          <!-- Message Bubble -->
          <div
              :class="[
              'p-4 rounded shadow max-w-3xl w-fit',
              message.userMessage ? 'bg-blue-100 ml-10' : 'bg-green-100 mr-10'
            ]"
          >
            <p class="text-xs text-gray-500 mb-1">
              {{ message.userMessage ? 'You' : 'AI' }} - {{ formatDate(message.createdAt) }}
            </p>
            <div v-if="isCodeBlock(message.content)" class="bg-gray-800 text-white p-4 rounded mt-2 font-mono text-sm">
              <pre><code>{{ extractCode(message.content) }}</code></pre>
              <button
                  @click="copyCode(message.content)"
                  class="mt-2 text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
              >
                Copy Code
              </button>
            </div>
            <p v-else class="text-base whitespace-pre-wrap">{{ message.content }}</p>
          </div>

          <!-- Avatar -->
          <div v-if="message.userMessage" class="ml-2">
            <img src="https://ui-avatars.com/api/?name=You" class="w-8 h-8 rounded-full" alt="User Avatar" />
          </div>
        </div>
        <div ref="messagesEnd"></div>
      </div>
      <p v-else class="text-gray-500">No messages yet.</p>

      <!-- Message Input -->
      <form @submit.prevent="sendMessage" class="mt-6 flex flex-col sm:flex-row gap-2">
        <input
            v-model="newMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-grow p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            :disabled="isEditing"
        />
        <div class="flex gap-2">
          <button
              type="submit"
              :disabled="!newMessage.trim() || isEditing"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
import Prism from 'prismjs';
import 'prismjs/themes/prism-dark.css';

export default {
  name: 'Chat',
  data() {
    return {
      conversation: null,
      messages: [],
      searchKeyword: '',
      newMessage: '',
      isEditing: false,
      editingMessageId: null,
    };
  },
  computed: {
    conversationId() {
      return this.$route.params.id;
    },
  },
  methods: {
    async fetchConversation() {
      try {
        const response = await api.get(`/conversations/${this.conversationId}`);
        this.conversation = response.data;
        this.messages = response.data.messages || [];
        this.scrollToBottom();
      } catch (error) {
        console.error('Error fetching conversation:', error);
        alert('Failed to load conversation');
      }
    },
    async searchMessages() {
      if (!this.searchKeyword.trim()) {
        this.fetchConversation();
        return;
      }
      try {
        const response = await api.get(
            `/conversations/${this.conversationId}/messages/search?keyword=${this.searchKeyword}`
        );
        this.messages = response.data;
        this.scrollToBottom();
      } catch (error) {
        console.error('Error searching messages:', error);
        alert('No messages found');
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim()) return;
      try {
        const endpoint = this.isEditing
            ? `/conversations/${this.conversationId}/messages/${this.editingMessageId}`
            : `/conversations/${this.conversationId}/messages`;
        const method = this.isEditing ? 'put' : 'post';
        const response = await api[method](endpoint, { content: this.newMessage });

        if (this.isEditing) {
          const index = this.messages.findIndex((m) => m.id === this.editingMessageId);
          this.messages[index] = response.data;
        } else {
          // Le backend retourne maintenant une liste de messages [userMessage, aiMessage]
          // Ajouter tous les messages reçus à la liste des messages
          if (Array.isArray(response.data)) {
            response.data.forEach(message => {
              this.messages.push(message);
            });
          } else {
            // Fallback au cas où le backend retournerait un seul message
            this.messages.push(response.data);
          }
        }

        this.newMessage = '';
        this.isEditing = false;
        this.editingMessageId = null;
        this.$nextTick(() => this.scrollToBottom());
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      }
    },
    cancelEdit() {
      this.isEditing = false;
      this.editingMessageId = null;
      this.newMessage = '';
    },
    isCodeBlock(content) {
      return content.includes('```');
    },
    extractCode(content) {
      const match = content.match(/```[\s\S]*?```/);
      if (match) {
        return match[0].replace(/```/g, '').trim();
      }
      return content;
    },
    copyCode(content) {
      const code = this.extractCode(content);
      navigator.clipboard.writeText(code);
      alert('Code copied to clipboard!');
    },
    formatDate(date) {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messagesEnd;
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
  },
  created() {
    this.fetchConversation();
  },
  mounted() {
    Prism.highlightAll();
    this.scrollToBottom();
  },
};
</script>