import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  // Process POST requests
  if (request.method === 'POST') {
    try {
      // Get the raw body text
      const rawBody = await request.text();
      
      // Get content type
      const contentType = request.headers.get('content-type')?.toLowerCase() || '';
      
      let paymentId: string | null = null;
      let channel_user_id: string | null = null;

      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Parse form-urlencoded data
        const formData = new URLSearchParams(rawBody);
        paymentId = formData.get('paymentId');
        channel_user_id = formData.get('channel_user_id');
      } else {
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(rawBody);
          paymentId = jsonData.paymentId;
          channel_user_id = jsonData.channel_user_id;
        } catch (e) {
          console.error('Failed to parse JSON:', e);
        }
      }

      // Get URL parameters
      const { searchParams } = new URL(request.url);
      
      // If parameters are not in body, check URL
      if (!paymentId) {
        paymentId = searchParams.get('paymentId');
      }
      if (!channel_user_id) {
        channel_user_id = searchParams.get('channel_user_id');
      }

      if (paymentId && channel_user_id) {
        // Create the processed data
        const processedData = {
          paymentId,
          channel_user_id,
          // Add any additional URL parameters
          ...Object.fromEntries(searchParams.entries())
        };

        // Clone the request with the processed data
        const processedRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(processedData)
        });

        return NextResponse.next({
          request: processedRequest
        });
      } else {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Missing required parameters',
            received: { paymentId, channel_user_id }
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (e) {
      console.error('Error processing POST request:', e);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Error processing request',
          details: e instanceof Error ? e.message : 'Unknown error'
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  return response;
}

// Configure which routes should be handled by this middleware
export const config = {
  matcher: '/api/:path*',
};