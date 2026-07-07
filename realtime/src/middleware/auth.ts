// src/middleware/auth.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const API_URL = process.env.API_URL || 'http://localhost:8080/api';

// Types
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

interface UserData {
  id: string;
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
  }
}

export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    // ✅ Always set a userId even for visitors
    socket.data.isVisitor = true;
    socket.data.userId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


    // Get token from auth header or handshake query
    const token = socket.handshake.auth.token || 
                  socket.handshake.query.token ||
                  socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    // if (!token) {
    //   // For visitors, allow connection without token
    //   // They will have limited access
    //   socket.data.isVisitor = true;
    //   socket.data.userId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    //   return next();
    // }

     if (token) {
      try {
        // Try to authenticate but don't fail
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
        if (decoded.id) {
          socket.data.isVisitor = false;
          socket.data.userId = decoded.id;
          // You can fetch user data here if needed
        }
      } catch (e) {
        // Token invalid, keep as visitor
        console.log('Invalid token, connecting as visitor');
      }
    }
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      
      if (!decoded.id) {
        throw new Error('Invalid token: no user ID');
      }

      // Fetch user data from API
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000
      });

      if (!response.data?.success) {
        throw new Error('Failed to fetch user data');
      }

      const userData = response.data.data;
      
      // Attach user data to socket
      socket.data.user = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user',
        companyName: userData.companyName
      };
      socket.data.userId = userData._id;
      socket.data.isVisitor = false;
      
      console.log(`✅ Authenticated user: ${userData.name} (${userData._id})`);
      
    } catch (tokenError: any) {
      if (tokenError.name === 'TokenExpiredError') {
        console.log('⚠️ Token expired, connecting as visitor');
        socket.data.isVisitor = true;
        socket.data.userId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return next();
      }
      
      console.log('⚠️ Invalid token, connecting as visitor:', tokenError.message);
      socket.data.isVisitor = true;
      socket.data.userId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    next();
  } catch (error: any) {
    console.error('❌ Socket authentication error:', error.message);
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
  return socket.data.userId || socket.data.user?.id || `visitor_${socket.id}`;
};