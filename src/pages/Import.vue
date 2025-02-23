<template>
  <div class="form-container page import-page">
    <h1>Import Data</h1>
    <hr />
    <ImportedFacebook :showActions="false" />
  </div>
</template>

<script>
import ImportedFacebook from '@/pages/ImportedFacebook.vue'

export default {
  components: { ImportedFacebook },
}
</script>
