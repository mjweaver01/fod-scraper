import { defineStore } from 'pinia'
import { type ResultsDataType } from './scrape'

export const useImportedDataStore = defineStore('importedData', {
  state: () => ({
    importedResults: (window.localStorage.getItem('importedResults')
      ? JSON.parse(window.localStorage.getItem('importedResults') || '[]')
      : []) as ResultsDataType[],
  }),
  actions: {
    importCSV(file: File) {
      this.importedResults = []

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
                const record = headers.reduce(
                  (acc: Record<string, any>, header, index) => {
                    acc[header.trim()] = values[index]?.trim()
                    return acc
                  },
                  {} as Record<string, any>,
                )

                return {
                  name: record['Product Name'],
                  store: record['Store Name'],
                  address: `${record['Store Street']}, ${record['Store City']}, ${record['Store State']} ${record['Store Zip']}`,
                  stock_status: record['Current Inventory'] > 0 ? 'In Stock' : 'Out of Stock',
                  quantity: Number(record['Current Inventory']),
                  in_stock: record['Current Inventory'] > 0,
                }
              })
              .filter(
                (record) =>
                  record.name && record.store && record.address && record.in_stock !== undefined,
              ) as ResultsDataType[]

            this.importedResults = [...this.importedResults, ...csvData]
            window.localStorage.setItem('importedResults', JSON.stringify(this.importedResults))

            resolve(this.importedResults)
          } else {
            reject(new Error('Failed to read file'))
          }
        }
        reader.onerror = () => reject(new Error('Error reading file'))
        reader.readAsText(file)
      })
    },

    clearImportedResults() {
      this.importedResults = []
      window.localStorage.removeItem('importedResults')
    },
  },
})
