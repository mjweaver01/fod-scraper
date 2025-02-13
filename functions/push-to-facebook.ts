import type { Context } from '@netlify/functions'
import fetch from 'node-fetch'

interface FacebookAdSetPayload {
  name: string
  optimization_goal: string
  billing_event: string
  bid_amount: number
  daily_budget: number
  campaign_id: string
  targeting: {
    geo_locations: {
      custom_locations: Array<{
        address_string: string
        radius: number
        distance_unit: string
      }>
    }
  }
  status: string
  promoted_object: {
    page_id: string
  }
}

export default async (req: Request, context: Context) => {
  try {
    const payload: FacebookAdSetPayload = await req.json()

    const adAccountId = process.env.AD_ACCOUNT_ID
    const accessToken = process.env.ACCESS_TOKEN

    if (!adAccountId || !accessToken) {
      return Response.json({
        code: 500,
        message: 'Missing Facebook configuration (AD_ACCOUNT_ID or ACCESS_TOKEN).',
        error: true,
      })
    }

    // Facebook Graph API endpoint for creating ad sets.
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
      body: formData,
    })
    const fbResult = await fbResponse.json()

    return Response.json({
      code: 200,
      message: 'Ad set pushed successfully',
      data: fbResult,
      error: false,
    })
  } catch (error) {
    console.error('Error in pushFacebookAds:', error)
    return Response.json({
      code: 500,
      message: 'Internal Server Error',
      error: true,
    })
  }
}
