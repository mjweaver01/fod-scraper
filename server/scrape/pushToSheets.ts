import { google } from 'googleapis'

export default async function pushToGoogleSheets(data) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json', // Replace with your service account key file
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  const spreadsheetId = process.env.SPREADSHEET_ID
  const range = 'Sheet1!A:B' // Adjust range as needed

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: {
      values: [[new Date().toISOString(), data]],
    },
  })

  console.log('Data added:', response.data.updates.updatedCells)
}
