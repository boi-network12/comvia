// endpoint index
import { Router } from 'express';
import AuthRoutes from './authRoutes';


const router = Router();

router.use('/auth', AuthRoutes);

console.log("API Auth routes initialized");

export default router;