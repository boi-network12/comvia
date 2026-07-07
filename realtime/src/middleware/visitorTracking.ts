// realtime/src/middleware/visitorTracking.ts
import { Socket } from 'socket.io';
import axios from 'axios';

const API_URL = process.env.API_URL || 'https://comvia-backend-endpoint.vercel.app/api';

export interface VisitorData {
  visitorId: string;
  name?: string;
  email?: string;
  page?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

export async function trackVisitor(socket: Socket, data: VisitorData) {
  try {
    const response = await axios.post(`${API_URL}/widget/track`, {
      visitorId: data.visitorId,
      name: data.name || 'Anonymous Visitor',
      email: data.email,
      page: data.page || 'unknown',
      referrer: data.referrer,
      userAgent: data.userAgent || socket.handshake.headers['user-agent'],
      ip: data.ip || socket.handshake.address,
      socketId: socket.id,
    }, {
      timeout: 3000,
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to track visitor:', error);
    return null;
  }
}