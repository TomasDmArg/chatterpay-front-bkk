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

      // Parse body based on content type
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Parse form-urlencoded data
        const formData = new URLSearchParams(rawBody);
        paymentId = formData.get('paymentId');
        channel_user_id = formData.get('channel_user_id');
      } else if (contentType.includes('application/json')) {
        try {
          // Only try to parse as JSON if content type is application/json
          const jsonData = JSON.parse(rawBody);
          paymentId = jsonData.paymentId;
          channel_user_id = jsonData.channel_user_id;
        } catch (e) {
          return new NextResponse(
            JSON.stringify({ 
              error: 'Invalid JSON format',
              details: e instanceof Error ? e.message : 'Unknown error'
            }),
            { 
              status: 400,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
      } else if (rawBody.includes('=')) {
        // Fallback: If body contains '=' character, try parsing as form data
        const formData = new URLSearchParams(rawBody);
        paymentId = formData.get('paymentId');
        channel_user_id = formData.get('channel_user_id');
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
          // Add any additional URL parameters, excluding the ones we already processed
          ...Object.fromEntries(
            Array.from(searchParams.entries())
              .filter(([key]) => !['paymentId', 'channel_user_id'].includes(key))
          )
        };

        // Clone the request with the processed data
        const processedRequest = new NextRequest(request.url, {
          method: request.method,
          headers: new Headers({
            ...Object.fromEntries(request.headers),
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(processedData)
        });

        return NextResponse.next({
          request: processedRequest
        });
      } else {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Missing required parameters',
            received: { 
              paymentId, 
              channel_user_id,
              contentType,
              bodyPreview: rawBody.slice(0, 100) // Include first 100 chars of body for debugging
            }
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