import { defineStore } from 'pinia'

export const useImportedDataStore = defineStore('importedData', {
  state: () => ({
    importedResults: [],
  }),
  actions: {
    importCSV(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const text = event.target?.result
          if (typeof text === 'string') {
            const rows = text.split('\n')
            const headers = rows[0].split(',')

            const csvData = rows
              .slice(1)
              .map((row) => {
                const values = row.split(',')
                const record = headers.reduce((acc, header, index) => {
                  acc[header.trim()] = values[index]?.trim()
                  return acc
                }, {})

                return {
                  name: record['Product Name'],
                  store: record['Store Name'],
                  address: `${record['Store Street']}, ${record['Store City']}, ${record['Store State']} ${record['Store Zip']}`,
                  stock_status: record['Current Inventory'] > 0 ? 'In Stock' : 'Out of Stock',
                  quantity: record['Current Inventory'],
                  in_stock: record['Current Inventory'] > 0,
                }
              })
              .filter(
                (record) =>
                  record.name && record.store && record.address && record.in_stock !== undefined,
              )

            this.importedResults = csvData

            resolve(this.importedResults)
          } else {
            reject(new Error('Failed to read file'))
          }
        }
        reader.onerror = () => reject(new Error('Error reading file'))
        reader.readAsText(file)
      })
    },
  },
})
