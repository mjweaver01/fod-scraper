import type { Handler, Context } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  // Parse the request body.
  const { password } = JSON.parse(event.body || '{}')

  if (password === process.env.AUTH_SECRET) {
    // @TODO SCRAPE
    //
    // return Response.json({
    //   code: 200,
    //   message: 'Authorized',
    //   error: false,
    // })
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Authorized' }),
    }
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    }
  }
}
