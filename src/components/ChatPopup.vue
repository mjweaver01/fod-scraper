<template>
  <div v-if="isBig" @click="toggleChat" class="chat-overlay"></div>
  <div class="chat-popup" :class="{ 'is-big': isBig }">
    <button v-if="!showChat" class="chat-toggle" @click="toggleChat">Chat</button>
    <div v-if="showChat" class="chat-popup-container">
      <div class="chat-popup-header">
        <button class="big-toggle" @click="toggleBigSmall">{{ isBig ? 'Small' : 'Big' }}</button>
        <button class="close-chat" @click="toggleChat">Close</button>
      </div>
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
      isBig: false,
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
    toggleBigSmall() {
      this.isBig = !this.isBig
    },
  },
}
</script>

<style lang="scss">
.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

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

.chat-popup-container {
  position: fixed;
  bottom: 0;
  right: 1em;
  height: 100%;
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

  .messages-container {
    flex-grow: 1;
    overflow-y: auto;
    border-top: 1px solid var(--light-gray);
    border-bottom: 1px solid var(--light-gray);
    height: 100vh;
    max-height: 300px;
  }
}

.chat-popup.is-big .chat-popup-container {
  max-width: calc(100% - 6em);
  left: 50%;
  right: unset;
  transform: translateX(-50%);

  .messages-container {
    max-height: 60vh;
  }
}

.chat-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .big-toggle,
  .close-chat {
    margin: 5px;
    padding: 5px 10px;
    background-color: var(--blue);
    color: var(--white);
    border: none;
    border-radius: 5px;
    background-color: var(--red);
    color: var(--white);
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .big-toggle {
    background-color: var(--green);
  }
}
</style>
