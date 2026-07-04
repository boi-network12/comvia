// endpoint index
import { Router } from 'express';
import AuthRoutes from './authRoutes';
import integrationRoutes from './integrationRoutes';


const router = Router();

router.use('/auth', AuthRoutes);
router.use('/integrations', integrationRoutes);

console.log("API routes initialized");

export default router;