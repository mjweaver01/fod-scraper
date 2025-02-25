import dotenv from 'dotenv'
import { Router, Request, Response } from 'express'
import { AdAccount, FacebookAdsApi, CustomAudience, AdSet } from 'facebook-nodejs-business-sdk'
import crypto from 'crypto'

dotenv.config()
const router = Router()

const adAccountId = process.env.AD_ACCOUNT_ID
const accessToken = process.env.ACCESS_TOKEN

// Initialize the Facebook Ads API
FacebookAdsApi.init(accessToken)

// Cache implementation
interface CacheItem {
  data: any
  timestamp: number
}

const cache: Record<string, CacheItem> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

function getCacheKey(route: string, params: any = {}): string {
  return `${route}:${JSON.stringify(params)}`
}

function getFromCache(key: string): any | null {
  const item = cache[key]
  if (!item) return null

  const now = Date.now()
  if (now - item.timestamp > CACHE_TTL) {
    // Cache expired
    delete cache[key]
    return null
  }

  return item.data
}

function setCache(key: string, data: any): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  }
}

router.get('/audiences', async (req: Request, res: Response) => {
  if (!adAccountId || !accessToken) {
    return res.status(500).json({
      code: 500,
      message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
      error: true,
    })
  }

  const cacheKey = getCacheKey('audiences')
  const cachedData = getFromCache(cacheKey)

  if (cachedData) {
    return res.json({
      code: 200,
      message: 'Audiences fetched successfully (cached)',
      data: cachedData,
      error: false,
      cached: true,
    })
  }

  try {
    const adAccount = new AdAccount(adAccountId)
    const audiences = await adAccount.getCustomAudiences(['id', 'name', 'description'])

    // Only cache successful responses
    setCache(cacheKey, audiences)

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

  const cacheKey = getCacheKey('campaigns')
  const cachedData = getFromCache(cacheKey)

  if (cachedData) {
    return res.json({
      code: 200,
      message: 'Campaigns fetched successfully (cached)',
      data: cachedData,
      error: false,
      cached: true,
    })
  }

  try {
    const adAccount = new AdAccount(adAccountId)
    const campaigns = await adAccount.getCampaigns(['id', 'name'])

    // Only cache successful responses
    setCache(cacheKey, campaigns)

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

  const cacheKey = getCacheKey('adsets')
  const cachedData = getFromCache(cacheKey)

  if (cachedData) {
    return res.json({
      code: 200,
      message: 'Ad sets fetched successfully (cached)',
      data: cachedData,
      error: false,
      cached: true,
    })
  }

  try {
    const adAccount = new AdAccount(adAccountId)
    const adSets = await adAccount.getAdSets(['id', 'name'])

    // Only cache successful responses
    setCache(cacheKey, adSets)

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

    // Invalidate adsets cache after creating a new one
    delete cache[getCacheKey('adsets')]

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

// Define interface for AdSet update payload
interface AdSetUpdatePayload {
  id: string
  [key: string]: any // Other fields to update
}

router.post('/update-adset', async (req: Request, res: Response) => {
  const { payload, password } = req.body as { payload: AdSetUpdatePayload; password: string }
  const { id, ...updates } = payload

  console.log(payload)

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

    // Create AdSet instance with just the ID
    const adSet = new AdSet(id)

    // Update the ad set with the correct method signature
    // The first parameter should be an array of fields to update (can be empty)
    // The second parameter should be the update data
    const updatedAdSet = await adSet.update([], updates)

    // Invalidate adsets cache after updating
    delete cache[getCacheKey('adsets')]

    return res.json({
      code: 200,
      message: 'Ad set updated successfully',
      data: updatedAdSet,
      error: false,
    })
  } catch (error: any) {
    console.error('Error updating ad set:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Internal Server Error',
      error: true,
    })
  }
})

router.post('/delete-adset', async (req: Request, res: Response) => {
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

    const adSet = new AdSet(payload.id)

    // Delete the ad set using the payload directly
    const deletedAdSet = await adSet.delete([payload.id])

    // Invalidate adsets cache after deleting
    delete cache[getCacheKey('adsets')]

    return res.json({
      code: 200,
      message: 'Ad set deleted successfully',
      data: deletedAdSet,
      error: false,
    })
  } catch (error: any) {
    console.error('Error deleting ad set:', error)
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

  const cacheKey = getCacheKey('custom-audiences')
  const cachedData = getFromCache(cacheKey)

  if (cachedData) {
    return res.json({
      code: 200,
      message: 'Custom audiences fetched successfully (cached)',
      data: cachedData,
      error: false,
      cached: true,
    })
  }

  try {
    const adAccount = new AdAccount(adAccountId)
    const audiences = await adAccount.getCustomAudiences(['id', 'name', 'description'])

    // Only cache successful responses
    setCache(cacheKey, audiences)

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

    // Invalidate audiences caches after creating a new one
    delete cache[getCacheKey('audiences')]
    delete cache[getCacheKey('custom-audiences')]

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

router.post('/create-campaign', async (req: Request, res: Response) => {
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

    // Create the campaign using the payload
    const campaign = await adAccount.createCampaign([], {
      name: payload.name,
      objective: payload.objective,
      status: payload.status,
    })

    // Invalidate campaigns cache after creating a new one
    delete cache[getCacheKey('campaigns')]

    return res.json({
      code: 200,
      message: 'Campaign created successfully',
      data: campaign,
      error: false,
    })
  } catch (error: any) {
    console.error('Error creating campaign:', error)
    return res.status(500).json({
      code: 500,
      message: error.message || 'Internal Server Error',
      error: true,
    })
  }
})

// Add a utility endpoint to clear the cache if needed
router.post('/clear-cache', async (req: Request, res: Response) => {
  const { password } = req.body

  if (password !== process.env.AUTH_SECRET) {
    return res.json({
      code: 401,
      message: 'Unauthorized',
      error: true,
    })
  }

  // Clear all cache
  Object.keys(cache).forEach((key) => delete cache[key])

  return res.json({
    code: 200,
    message: 'Cache cleared successfully',
    error: false,
  })
})

export default router
