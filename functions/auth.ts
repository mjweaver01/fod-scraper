import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  try {
    // Your function logic here
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Auth function working' }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to execute function' }),
    }
  }
}
