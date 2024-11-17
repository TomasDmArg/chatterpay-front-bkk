import NextCors from 'nextjs-cors';
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
      const body = await request.json();
      
      // Capture the parameters from the request body
      const { paymentId, channel_user_id } = body;
      
      // Capture the URL parameters
      const { searchParams } = new URL(request.url);
      const urlParams = Object.fromEntries(searchParams.entries());
      
      if (paymentId && channel_user_id) {
        const processedRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(body),
        });

        return NextResponse.next({
          request: processedRequest,
        });
      } else {
        return new NextResponse(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
      }
    } catch (e) {
      console.error('Error processing POST request:', e);
      return new NextResponse(JSON.stringify({ error: 'Error processing request' }), { status: 500 });
    }
  }
}

// Configure which routes should be handled by this middleware
export const config = {
  matcher: '/api/:path*',
};