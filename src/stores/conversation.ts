import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useScrapeStore } from './scrape'
import { useImportedDataStore } from './importedData'

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    messages: [] as Array<{ role: string; content: string }>,
    isStreaming: false,
  }),
  getters: {
    auth: () => useAuthStore(),
    scrape: () => useScrapeStore(),
    importedData: () => useImportedDataStore(),
  },
  actions: {
    addMessage(role: string, content: string) {
      this.messages.push({ role, content })
    },
    async sendMessage(question: string) {
      if (!question.trim()) return

      this.addMessage('user', question)
      this.addMessage('assistant', 'Thinking...')
      this.isStreaming = true

      const response = await fetch('/openai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: this.auth.password,
          conversation: this.messages.length > 2 ? this.messages.slice(0, -1) : [],
          question,
          data: window.location.pathname.includes('scrape')
            ? this.scrape.results
            : this.importedData.importedResults.length > 0
              ? this.importedData.importedResults
              : this.scrape.results,
        }),
      })

      // Handle the streaming response
      const reader = response.body!.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      let accumulatedMessage = ''

      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone
        const chunk = decoder.decode(value, { stream: true })
        accumulatedMessage += chunk
        this.messages[this.messages.length - 1].content = accumulatedMessage
      }

      this.isStreaming = false
    },
    clearMessages() {
      this.messages = []
    },
  },
})
