<template>
  <div>
    <button class="chat-toggle" @click="toggleChat">Chat</button>
    <div v-if="showChat" class="chat-overlay">
      <button class="close-chat" @click="toggleChat">Close</button>
      <Chat ref="chatComponent" />
    </div>
  </div>
</template>

<script>
import Chat from './Chat.vue'

export default {
  components: {
    Chat,
  },
  data() {
    return {
      showChat: false,
    }
  },
  methods: {
    toggleChat() {
      this.showChat = !this.showChat
      if (this.showChat) {
        this.$nextTick(() => {
          this.$refs.chatComponent.$refs.chatInput.focus()
        })
      }
    },
  },
}
</script>

<style lang="scss">
.chat-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: var(--blue);
  color: var(--white);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.chat-overlay {
  position: fixed;
  bottom: 0;
  right: 1em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 350px;
  height: auto;
  background-color: var(--white);
  border: 1px solid var(--light-gray);
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.close-chat {
  align-self: flex-end;
  margin: 5px;
  padding: 5px 10px;
  background-color: var(--red);
  color: var(--white);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.messages-container {
  max-height: 300px;
  overflow-y: auto;
  border-top: 1px solid var(--light-gray);
  border-bottom: 1px solid var(--light-gray);
}
</style>
