// server/src/config/corsConfig.ts
import { CorsOptions } from 'cors';
import { ServerOptions } from 'socket.io';

/**
 * Dynamic CORS configuration that handles multiple origins and subdomains
 */
export const getCorsOptions = (): CorsOptions => {
  // Get allowed origins from environment
  const allowedOrigins = process.env.FRONTEND_ORIGIN?.split(',') || [];
  const isProduction = process.env.NODE_ENV === 'production';
  
  // For Vercel, always add the production URL
  const defaultOrigins = [
    'https://comvia-web.vercel.app',
    'https://comvia-widget.vercel.app',
    'https://comvia-backend-endpoint.vercel.app',
    'https://comvia-realtime.fly.dev',
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  // Merge all allowed origins
  const allOrigins = [...defaultOrigins, ...allowedOrigins];
  
  // Remove duplicates
  const uniqueOrigins = [...new Set(allOrigins)];
  
  console.log('🌐 Configured CORS origins:', uniqueOrigins);

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl)
      if (!origin) {
        return callback(null, true);
      }
      
      // In development, allow all origins
      if (!isProduction) {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (uniqueOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Check for subdomain matches
      const isSubdomainAllowed = uniqueOrigins.some(allowedOrigin => {
        try {
          const allowedUrl = new URL(allowedOrigin);
          const requestUrl = new URL(origin);
          const allowedDomain = allowedUrl.hostname.replace('www.', '');
          const requestDomain = requestUrl.hostname.replace('www.', '');
          
          return allowedUrl.protocol === requestUrl.protocol && 
                 requestDomain.endsWith(allowedDomain);
        } catch {
          return false;
        }
      });
      
      if (isSubdomainAllowed) {
        return callback(null, true);
      }
      
      console.warn('❌ CORS blocked:', origin, 'Allowed:', uniqueOrigins);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token',
      'X-API-Key',
      'Cookie',
      'Set-Cookie',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials'
    ],
    exposedHeaders: [
      'Content-Range',
      'X-Content-Range',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials'
    ],
    maxAge: 86400, // 24 hours for preflight cache
  };
};

export const getSocketCorsConfig = (): Partial<ServerOptions> => ({
  cors: {
    origin: getCorsOptions().origin,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
  transports: ['websocket', 'polling'],
});