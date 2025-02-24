import dotenv from 'dotenv'
import { Router, Request, Response } from 'express'
import { AdAccount, FacebookAdsApi, CustomAudience } from 'facebook-nodejs-business-sdk'
import crypto from 'crypto'

dotenv.config()
const router = Router()

const adAccountId = process.env.AD_ACCOUNT_ID
const accessToken = process.env.ACCESS_TOKEN

// Initialize the Facebook Ads API
FacebookAdsApi.init(accessToken)

router.post('/push-audience', async (req: Request, res: Response) => {
  const { payload, password } = req.body

  if (password !== process.env.AUTH_SECRET) {
    return res.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }

  try {
    if (!adAccountId || !accessToken) {
      return res.status(500).json({
        code: 500,
        message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
        error: true,
      })
    }

    const adAccount = new AdAccount(adAccountId)
    const audienceData = {
      name: payload.name,
      subtype: payload.subtype,
      description: payload.description,
    }

    const audience = await adAccount.createCustomAudience([], audienceData)

    return res.json({
      code: 200,
      message: 'Audience pushed successfully',
      data: audience,
      error: false,
    })
  } catch (error: any) {
    console.error('Error in pushToFacebook:', error)
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error',
      error: true,
    })
  }
})

router.get('/audiences', async (req: Request, res: Response) => {
  if (!adAccountId || !accessToken) {
    return res.status(500).json({
      code: 500,
      message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
      error: true,
    })
  }

  try {
    const adAccount = new AdAccount(adAccountId)

    const audiences = await adAccount.getCustomAudiences(['id', 'name', 'description'])

    return res.json({
      code: 200,
      message: 'Audiences fetched successfully',
      data: audiences,
      error: false,
    })
  } catch (error: any) {
    console.error('Error fetching audiences:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Internal Server Error',
      error: true,
    })
  }
})

router.get('/campaigns', async (req: Request, res: Response) => {
  if (!adAccountId || !accessToken) {
    return res.status(500).json({
      code: 500,
      message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
      error: true,
    })
  }

  try {
    const adAccount = new AdAccount(adAccountId)
    const campaigns = await adAccount.getCampaigns(['id', 'name'])

    return res.json({
      code: 200,
      message: 'Campaigns fetched successfully',
      data: campaigns,
      error: false,
    })
  } catch (error: any) {
    console.error('Error fetching campaigns:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Internal Server Error',
      error: true,
    })
  }
})

router.get('/adsets', async (req: Request, res: Response) => {
  if (!adAccountId || !accessToken) {
    return res.status(500).json({
      code: 500,
      message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
      error: true,
    })
  }

  try {
    const adAccount = new AdAccount(adAccountId)
    const adSets = await adAccount.getAdSets(['id', 'name'])

    return res.json({
      code: 200,
      message: 'Ad sets fetched successfully',
      data: adSets,
      error: false,
    })
  } catch (error: any) {
    console.error('Error fetching ad sets:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Internal Server Error',
      error: true,
    })
  }
})

router.post('/push-adset', async (req: Request, res: Response) => {
  const { payload, password } = req.body

  if (password !== process.env.AUTH_SECRET) {
    return res.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }

  try {
    if (!adAccountId || !accessToken) {
      return res.status(500).json({
        code: 500,
        message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
        error: true,
      })
    }

    const adAccount = new AdAccount(adAccountId)

    // Create the ad set using the payload directly
    const adSet = await adAccount.createAdSet([], payload)

    return res.json({
      code: 200,
      message: 'Ad set created successfully',
      data: adSet,
      error: false,
    })
  } catch (error: any) {
    console.error('Error creating ad set:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Internal Server Error',
      error: true,
    })
  }
})

router.get('/custom-audiences', async (req: Request, res: Response) => {
  if (!adAccountId || !accessToken) {
    return res.status(500).json({
      code: 500,
      message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
      error: true,
    })
  }

  try {
    const adAccount = new AdAccount(adAccountId)
    const audiences = await adAccount.getCustomAudiences(['id', 'name', 'description'])

    return res.json({
      code: 200,
      message: 'Custom audiences fetched successfully',
      data: audiences,
      error: false,
    })
  } catch (error: any) {
    console.error('Error fetching custom audiences:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Internal Server Error',
      error: true,
    })
  }
})

router.post('/push-custom-audience', async (req: Request, res: Response) => {
  const { payload, password } = req.body

  if (password !== process.env.AUTH_SECRET) {
    return res.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }

  try {
    if (!adAccountId || !accessToken) {
      return res.status(500).json({
        code: 500,
        message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
        error: true,
      })
    }

    const adAccount = new AdAccount(adAccountId)

    // Create the custom audience using the payload directly
    const audience = await adAccount.createCustomAudience([], payload)
    console.log(audience)

    return res.json({
      code: 200,
      message: 'Custom audience pushed successfully with address locations',
      data: audience,
      error: false,
    })
  } catch (error: any) {
    console.error('Error pushing custom audience:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Internal Server Error',
      error: true,
    })
  }
})

// Helper function to hash data
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex')
}

export default router
