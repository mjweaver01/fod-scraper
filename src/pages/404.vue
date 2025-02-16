<template>
  <div class="form-container not-found">
    <h1>404 Not Found</h1>
    <p>Oops! The page you're looking for doesn't exist.</p>
    <router-link class="button go-to-chat" to="/">Go Home</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
}
</script>

<style lang="scss" scoped>
.not-found {
  text-align: center;

  .go-to-chat {
    max-width: 10em;
    margin: 0 auto;
  }
}
</style>
