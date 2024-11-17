import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

function parseBody(body: string): Record<string, any> {
  try {
    // Primero intentamos parsear como JSON
    return JSON.parse(body);
  } catch {
    // Si falla, asumimos que es form-urlencoded
    const params = new URLSearchParams(body);
    const result: Record<string, any> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

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
      // Obtener el content-type del request
      const contentType = request.headers.get('content-type')?.toLowerCase() || '';
      
      let bodyData: Record<string, any>;
      
      if (contentType.includes('application/json')) {
        // Para JSON
        bodyData = await request.json();
      } else {
        // Para form-urlencoded y otros formatos de texto
        const bodyText = await request.text();
        bodyData = parseBody(bodyText);
      }
      
      // Capture the parameters from the request body
      const { paymentId, channel_user_id } = bodyData;
      
      // Capture the URL parameters
      const { searchParams } = new URL(request.url);
      const urlParams = Object.fromEntries(searchParams.entries());
      
      if (paymentId && channel_user_id) {
        // Crear un nuevo request con los datos procesados
        const processedRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(bodyData),
        });

        return NextResponse.next({
          request: processedRequest,
        });
      } else {
        return new NextResponse(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400 }
        );
      }
    } catch (e) {
      console.error('Error processing POST request:', e);
      return new NextResponse(
        JSON.stringify({ error: 'Error processing request' }),
        { status: 500 }
      );
    }
  }

  return response;
}

// Configure which routes should be handled by this middleware
export const config = {
  matcher: '/api/:path*',
};