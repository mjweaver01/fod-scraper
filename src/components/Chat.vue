<template>
  <div class="chat-container">
    <div class="messages-container" ref="messagesContainer" @scroll="handleScroll">
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
    <div class="input-container">
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
        @keydown.enter.prevent.stop="sendMessage"
        @keyup.up="useLastUserMessage"
        placeholder="Type a message..."
      />
    </div>
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
      autoScroll: true,
    }
  },
  computed: {
    conversation() {
      return useConversationStore()
    },
  },
  watch: {
    'conversation.messages': {
      handler() {
        if (this.autoScroll) {
          this.scrollToBottom()
        }
      },
      deep: true,
    },
  },
  methods: {
    sendMessage() {
      if (!this.userInput.trim() || this.conversation.isStreaming) return

      this.lastUserMessage = this.userInput
      this.conversation.sendMessage(this.userInput)
      this.userInput = ''
      this.scrollToBottom()

      this.$nextTick(() => {
        this.$refs.chatInput.focus()
      })
    },
    clearConversation() {
      this.conversation.clearMessages()

      this.$nextTick(() => {
        this.$refs.chatInput.focus()
      })
    },
    useLastUserMessage() {
      this.userInput = this.lastUserMessage
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        container.scrollTop = container.scrollHeight
      })
    },
    handleScroll() {
      const container = this.$refs.messagesContainer
      const buffer = 20
      const atBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + buffer
      this.autoScroll = atBottom
    },
  },
}
</script>

<style lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .messages-container {
    display: flex;
    flex-direction: column;
    padding: 1em;
    overflow-y: auto;
    gap: 1em;
  }

  .input-container {
    padding: 0.5rem;
    position: relative;

    .clear-conversation {
      cursor: pointer;
      font-size: 0.8em;
    }

    input {
      width: 100%;
      padding: 1em;
      border-radius: 5px;
      border: 1px solid var(--light-gray);
      border-radius: 0;
    }
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
