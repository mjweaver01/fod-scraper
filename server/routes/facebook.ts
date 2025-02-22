import dotenv from 'dotenv'
import { Router, Request, Response } from 'express'
import fetch from 'node-fetch'

dotenv.config()
const router = Router()

const adAccountId = process.env.AD_ACCOUNT_ID
const accessToken = process.env.ACCESS_TOKEN

router.post('/push', async (req: Request, res: Response) => {
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

    const url = `https://graph.facebook.com/v22.0/act_${adAccountId}/adsets`
    const formData = new URLSearchParams()
    formData.append('name', payload.name)
    formData.append('optimization_goal', payload.optimization_goal)
    formData.append('billing_event', payload.billing_event)
    formData.append('bid_amount', payload.bid_amount.toString())
    formData.append('daily_budget', payload.daily_budget.toString())
    formData.append('campaign_id', payload.campaign_id)
    formData.append('targeting', JSON.stringify(payload.targeting))
    formData.append('status', payload.status)
    formData.append('promoted_object', JSON.stringify(payload.promoted_object))
    formData.append('access_token', accessToken)

    const fbResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: formData,
    })
    const fbResult = await fbResponse.json()

    return res.json({
      code: 200,
      message: 'Ad set pushed successfully',
      data: fbResult,
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

router.get('/campaigns', async (req: Request, res: Response) => {
  if (!adAccountId || !accessToken) {
    return res.status(500).json({
      code: 500,
      message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
      error: true,
    })
  }

  try {
    // Get all campaign data through insights endpoint
    const insightsUrl = `https://graph.facebook.com/v17.0/${adAccountId}/insights`
    const params = new URLSearchParams({
      level: 'campaign',
      fields: 'campaign_id,campaign_name,objective,status,spend,impressions,clicks,reach,ctr',
      date_preset: 'last_30d',
      access_token: accessToken,
    })

    const insightsResponse = await fetch(`${insightsUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const insightsResult = await insightsResponse.json()

    if (insightsResult.error) {
      return res.status(500).json({
        code: 500,
        message: insightsResult.error.message,
        error: true,
      })
    }

    // Transform the data to match the expected format
    const transformedData = insightsResult.data.map((campaign: any) => ({
      id: campaign.campaign_id,
      name: campaign.campaign_name,
      status: campaign.status,
      objective: campaign.objective,
      insights: {
        spend: campaign.spend || '0',
        impressions: campaign.impressions || 0,
        clicks: campaign.clicks || 0,
        reach: campaign.reach || 0,
        ctr: campaign.ctr || '0',
      },
    }))

    return res.json({
      code: 200,
      message: 'Campaigns and insights fetched successfully',
      data: {
        data: transformedData,
        paging: insightsResult.paging,
      },
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

router.get('/promoted-pages', async (req: Request, res: Response) => {
  const accessToken = process.env.ACCESS_TOKEN

  if (!accessToken) {
    return res.status(500).json({
      code: 500,
      message: 'Missing Facebook configuration (ACCESS_TOKEN).',
      error: true,
    })
  }

  const url = `https://graph.facebook.com/v22.0/me/accounts?access_token=${accessToken}`
  const fbResponse = await fetch(url)
  const fbResult = await fbResponse.json()

  if (fbResult.error) {
    return res.status(500).json({
      code: 500,
      message: fbResult.error.message,
      error: true,
    })
  }

  return res.json({
    code: 200,
    message: 'Promoted pages fetched successfully',
    data: fbResult,
    error: false,
  })
})

export default router
