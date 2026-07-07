// server/src/routes/companyRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth';
import User from '../models/User';

const router = Router();

// PUBLIC - widget uses this to get settings
router.get('/:companyId/widget', async (req, res) => {
  const { companyId } = req.params;

  const user = await User.findOne({ companyId }).select('companyName companyLogo widgetSettings');
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }
  
  res.json({
    success: true,
    data: {
      companyName: user.companyName || null,
      companyLogo: user.companyLogo,
      widgetSettings: user.widgetSettings || {},
    },
  });
});

// PRIVATE - user gets their own company ID
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('companyId companyName');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, data: { companyId: user.companyId, companyName: user.companyName } });
});

export default router;