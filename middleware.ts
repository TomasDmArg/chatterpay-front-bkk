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

  // Process requests with single quotes
  if (request.body) {
    let text = await request.text();
    console.log('Incoming request body:', text); // Debug incoming data
    try {
      // Check if the text is already valid JSON
      try {
        JSON.parse(text);
      } catch (e) {
        // If not valid JSON, attempt to sanitize it
        const sanitizedText = text
          .replace(/(\w+)'/g, '$1"')  // Replace quotes after word chars
          .replace(/'(\w+)/g, '"$1')  // Replace quotes before word chars
          .replace(/'/g, '"')         // Replace any remaining single quotes
          .replace(/(\w+)=(\w+)/g, '"$1":"$2"'); // Wrap key-value pairs in quotes
        
        console.log('Sanitized text:', sanitizedText); // Debug sanitized data
        
        // Attempt to parse the sanitized text
        try {
          JSON.parse(sanitizedText);
          text = sanitizedText;
        } catch (e) {
          console.error('Unable to parse sanitized text:', e);
          return response;
        }
      }
      
      const body = JSON.parse(text);
      
      if (body.paymentId && body.channel_user_id) {
        const processedRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(body),
        });

        return NextResponse.next({
          request: processedRequest,
        });
      }
    } catch (e) {
      console.error('JSON parsing error:', e); // Debug parsing errors
      return response;
    }
  }

  return response;
}

// Configure which routes should be handled by this middleware
export const config = {
  matcher: '/api/:path*',
};