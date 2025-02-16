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
        <VueShowdown class="message" :markdown="message.content" />
      </div>
    </div>
    <span
      v-if="conversation.messages.length > 0"
      @click="clearConversation"
      class="clear-conversation"
    >
      Clear Conversation
    </span>
    <input
      ref="chatInput"
      v-model="userInput"
      @keyup.enter="sendMessage"
      @keyup.up="useLastUserMessage"
      placeholder="Type a message..."
    />
  </div>
</template>

<script>
import { useConversationStore } from '@/stores/conversation'
import { VueShowdown } from 'vue-showdown'

export default {
  name: 'Chat',
  components: {
    VueShowdown,
  },
  data() {
    return {
      userInput: '',
      lastUserMessage: '',
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

      this.lastUserMessage = this.userInput
      await this.conversation.sendMessage(this.userInput)
      this.userInput = ''
    },
    clearConversation() {
      this.conversation.clearMessages()
    },
    useLastUserMessage() {
      this.userInput = this.lastUserMessage
    },
  },
}
</script>

<style lang="scss">
.chat-container {
  .messages-container {
    display: flex;
    flex-direction: column;
    padding: 0 1em 1em;
    overflow-y: auto;
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
    padding: 0.5em;
    border-radius: 5px;
    background-color: #f0f0f0;

    li:not(:last-child) p,
    p:last-child {
      margin-bottom: 0;
    }
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

    &:hover {
      background-color: #ff1a1a;
    }
  }
}
</style>
