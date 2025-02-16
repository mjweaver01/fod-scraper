<template>
  <div>
    <button class="chat-toggle" @click="toggleChat">Chat</button>
    <div v-if="showChat" class="chat-overlay">
      <button class="close-chat" @click="toggleChat">Close</button>
      <Chat />
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
    },
  },
}
</script>

<style scoped>
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
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 300px;
  height: 400px;
  background-color: var(--white);
  border: 1px solid var(--light-gray);
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
</style>
