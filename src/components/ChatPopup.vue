<template>
  <div v-if="isBig && showChat" @click="toggleChat" class="chat-overlay"></div>
  <div class="chat-popup" :class="{ 'is-big': isBig }">
    <button v-if="!showChat" class="chat-toggle" @click="toggleChat">
      <i class="pi pi-comment"></i>
    </button>
    <div v-if="showChat" class="chat-popup-container">
      <div class="chat-popup-header">
        <button class="big-toggle" @click="toggleBigSmall">
          <i v-if="!isBig" class="pi pi-window-maximize maximize"></i>
          <i v-if="isBig" class="pi pi-window-minimize minimize"></i>
        </button>
        <h4 class="no-margin">
          Chat ({{
            $route.path.includes('scrape')
              ? 'Scrape'
              : $route.path.includes('adsets')
                ? 'Adsets'
                : 'Import'
          }})
        </h4>
        <button class="close-chat" @click="toggleChat">
          <i class="pi pi-times"></i>
        </button>
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
  backdrop-filter: blur(5px);
}

.chat-toggle {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 1rem;
  right: 1rem;
  background-color: var(--blue);
  font-size: 1.5rem;
  color: var(--white);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;

  &:hover {
    background-color: var(--light-blue) !important;
  }
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
  padding: 0.5rem;

  .big-toggle,
  .close-chat {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  .close-chat {
    background-color: var(--red);
    border-color: var(--red);
  }

  .maximize {
    transform: rotate(-90deg);
  }

  .minimize {
    transform: rotate(90deg);
  }
}
</style>
