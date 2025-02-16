<template>
  <div class="chat-container">
    <div class="messages-container">
      <div
        v-for="(message, index) in conversation.messages"
        :key="index"
        class="message-container"
        :class="{
          'user-message': message.role === 'user',
          'assistant-message': message.role === 'assistant',
        }"
      >
        <div class="message">
          {{ message.content }}
        </div>
      </div>
    </div>
    <span
      v-if="conversation.messages.length > 0"
      @click="clearConversation"
      class="clear-conversation"
    >
      Clear Conversation
    </span>
    <input v-model="userInput" @keyup.enter="sendMessage" placeholder="Type a message..." />
  </div>
</template>

<script>
import { useConversationStore } from '@/stores/conversation'

export default {
  name: 'Chat',
  data() {
    return {
      userInput: '',
    }
  },
  computed: {
    conversation() {
      return useConversationStore()
    },
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim()) return

      // Use the store's sendMessage method
      await this.conversation.sendMessage(this.userInput)

      // Clear user input
      this.userInput = ''
    },
    clearConversation() {
      this.conversation.clearMessages()
    },
  },
}
</script>

<style lang="scss" scoped>
.messages-container {
  display: flex;
  flex-direction: column;
  padding: 0 1em 1em;
  overflow-y: auto;
  max-height: 300px;
  gap: 1em;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid var(--light-gray);
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
}

.clear-conversation {
  cursor: pointer;
  font-size: 0.8em;
  padding: 2px;
}

.message-container {
  display: flex;
}

.message {
  padding: 10px;
  border-radius: 5px;
  background-color: #f0f0f0;
}

.user-message {
  justify-content: flex-end;

  .message {
    text-align: right;
    background-color: #007bff;
    color: #fff;
  }
}

.assistant-message {
  justify-content: flex-start;

  .message {
    text-align: left;
  }
}

button {
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #ff1a1a;
}
</style>
