<template>
  <div>
    <input class="import-button" type="file" @change="handleFileUpload" accept=".csv" />
  </div>
</template>

<script>
import { useImportedDataStore } from '@/stores/importedData'

export default {
  setup() {
    const importedDataStore = useImportedDataStore()

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        importedDataStore
          .importCSV(file)
          .then(() => {
            console.log('CSV data imported successfully')
          })
          .catch((error) => {
            console.error('Error importing CSV:', error)
          })
      }
    }

    return {
      handleFileUpload,
    }
  },
}
</script>

<style>
.import-button {
  padding: 0.85em;
}
</style>
