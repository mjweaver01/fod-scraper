<template>
  <div>
    <input class="import-button" type="file" @change="handleFileUpload" accept=".csv" multiple />
  </div>
</template>

<script>
import { useImportedDataStore } from '@/stores/importedData'

export default {
  computed: {
    importedData() {
      return useImportedDataStore()
    },
  },
  methods: {
    handleFileUpload(event) {
      const files = event.target.files
      if (files.length > 0) {
        Array.from(files).forEach((file) => {
          this.importedData
            .importCSV(file)
            .then(() => {
              console.log(`CSV data from ${file.name} imported successfully`)
            })
            .catch((error) => {
              console.error(`Error importing CSV from ${file.name}:`, error)
            })
        })
      }
    },
  },
}
</script>

<style>
.import-button {
  padding: 0.55em;
}
</style>
