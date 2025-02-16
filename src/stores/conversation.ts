import { defineStore } from 'pinia'
import { useScrapeStore } from './scrape'

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    messages: [] as Array<{ role: string; content: string }>,
  }),
  getters: {
    scrape: () => useScrapeStore(),
  },
  actions: {
    addMessage(role: string, content: string) {
      this.messages.push({ role, content })
    },
    async sendMessage(question: string) {
      if (!question.trim()) return

      // Add user message to the store
      this.addMessage('user', question)

      // Send the message to the server
      const response = await fetch('/openai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, data: this.scrape.results }),
      })

      // Handle the streaming response
      const reader = response.body!.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      let accumulatedMessage = ''
      let isFirstChunk = true

      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone
        const chunk = decoder.decode(value, { stream: true })
        accumulatedMessage += chunk

        if (isFirstChunk) {
          this.addMessage('assistant', accumulatedMessage)
          isFirstChunk = false
        } else {
          // Update the current assistant message in real-time
          this.messages[this.messages.length - 1].content = accumulatedMessage
        }
      }
    },
    clearMessages() {
      this.messages = []
    },
  },
})
