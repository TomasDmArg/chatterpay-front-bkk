/**
 * Utility functions for ChatterPay integration
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/"

/**
 * Response from the connect endpoint
 */
interface ConnectResponse {
  status: string
  data: {
    message: string
    accessToken: string
    user: {
      id: string
      status: 'verified'
    }
  }
  timestamp: string
}

/**
 * Initiates ChatterPay connection flow
 */
export const connectWithChatterPay = async (channel_user_id: string, app_name: string = "ChatterPay Store"): Promise<ConnectResponse> => {
  const response = await fetch(`${API_URL}/business/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel_user_id,
      app_name
    })
  })
  
  return response.json()
}

/**
 * Verifies connection with OTP code
 */
export const verifyConnection = async (channel_user_id: string, code: string): Promise<ConnectResponse> => {
  const response = await fetch(`${API_URL}/business/verify`, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel_user_id,
      code: parseInt(code)
    })
  })

  return response.json()
}