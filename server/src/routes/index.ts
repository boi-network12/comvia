import { Router } from 'express';
import AuthRoutes from './authRoutes';
import integrationRoutes from './integrationRoutes';
import conversationRoutes from './conversationRoutes';
import teamRoutes from './teamRoutes';
import analyticsRoutes from './analyticsRoutes';
import widgetRoutes from './widgetRoutes';
import messageRoutes from './messageRoutes';
import companyRoutes from './companyRoutes';

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/integrations', integrationRoutes);
router.use('/conversations', conversationRoutes);
router.use('/team', teamRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/widget', widgetRoutes);
router.use('/messages', messageRoutes); 
router.use('/company', companyRoutes);

console.log("API routes initialized");

export default router;