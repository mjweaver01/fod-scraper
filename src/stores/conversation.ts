import { defineStore } from 'pinia'

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    messages: [] as Array<{ role: string; content: string }>,
  }),
  actions: {
    addMessage(role: string, content: string) {
      this.messages.push({ role, content })
    },
    async sendMessage(prompt: string) {
      if (!prompt.trim()) return

      // Add user message to the store
      this.addMessage('user', prompt)

      // Send the message to the server
      const response = await fetch('/openai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      // Handle the streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      let accumulatedMessage = '' // Initialize an empty string to accumulate the message
      let isFirstChunk = true // Flag to check if it's the first chunk

      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone
        const chunk = decoder.decode(value, { stream: true })

        // Clean up the chunk by removing unwanted prefixes
        const cleanedChunk = chunk.replace(/data:\s*/g, '')

        // Accumulate the cleaned chunk into the message
        accumulatedMessage += cleanedChunk

        // Remove spaces before punctuation and quotes
        accumulatedMessage = accumulatedMessage.replace(/\s+([.,!?;:])/g, '$1')
        accumulatedMessage = accumulatedMessage.replace(/\s+(['"])/g, '$1')

        // Add the assistant message placeholder on the first chunk
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
