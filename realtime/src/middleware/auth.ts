// // src/middleware/auth.ts
// realtime/src/middleware/auth.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { API_URL } from '../config/baseApi';

const JWT_SECRET = process.env.JWT_SECRET || '8bc54b3f415d679a36567169f0168110434e69205880e0044eb01b70336c8e4c';


// Types
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  companyName?: string;
}

// Extend Socket type
declare module 'socket.io' {
  interface Socket {
    user?: UserData;
    userId?: string;
    isVisitor?: boolean;
  }
}

export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    // Get token from auth header or handshake query
    const token = socket.handshake.auth.token || 
                  socket.handshake.query.token ||
                  socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    console.log(`🔐 [AUTH] Socket ${socket.id} - Token present:`, !!token);

    // If no token, treat as visitor
    if (!token) {
      console.log(`👤 [AUTH] No token - treating as visitor`);
      socket.data.isVisitor = true;
      socket.data.userId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return next();
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      console.log(`✅ [AUTH] Token verified for user ID: ${decoded.id}`);

      // ✅ STORE THE TOKEN ON THE SOCKET
      socket.data.authToken = token;
      socket.data.userId = decoded.id;
      socket.data.isVisitor = false;

      // ✅ Try to fetch user data from API
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 5000
        });

        if (response.data?.success) {
          const userData = response.data.data;
          
          // ✅ Attach user data to socket - THIS IS THE KEY FIX
          socket.data.user = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'user',
            companyName: userData.companyName
          };
          socket.data.userId = userData._id;
          socket.data.isVisitor = false; // ✅ IMPORTANT: Set to false for authenticated users
          
          console.log(`✅ [AUTH] Authenticated user: ${userData.name} (${userData._id})`);
          return next();
        }
      } catch (apiError: any) {
        console.log(`⚠️ [AUTH] Failed to fetch user data: ${apiError.message}`);
        // Fall through to token-only auth
      }

      // ✅ If API call fails, still authenticate with token data
      socket.data.userId = decoded.id;
      socket.data.isVisitor = false; // ✅ IMPORTANT: Set to false for authenticated users
      socket.data.user = {
        _id: decoded.id,
        name: 'User',
        email: '',
        role: 'user'
      };
      
      console.log(`✅ [AUTH] Authenticated with token only: ${decoded.id}`);
      return next();

    } catch (tokenError: any) {
      if (tokenError.name === 'TokenExpiredError') {
        console.log(`⚠️ [AUTH] Token expired - treating as visitor`);
      } else {
        console.log(`⚠️ [AUTH] Invalid token - treating as visitor: ${tokenError.message}`);
      }
      
      // Token invalid - treat as visitor
      socket.data.isVisitor = true;
      socket.data.userId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return next();
    }
  } catch (error: any) {
    console.error(`❌ [AUTH] Socket authentication error: ${error.message}`);
    // Allow connection as visitor
    socket.data.isVisitor = true;
    socket.data.userId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    next();
  }
};

// Helper to check if socket is authenticated
export const isAuthenticated = (socket: Socket): boolean => {
  return !socket.data.isVisitor && !!socket.data.user;
};

// Helper to get user ID
export const getUserId = (socket: Socket): string => {
  return socket.data.userId || socket.data.user?._id || `visitor_${socket.id}`;
};