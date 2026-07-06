import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getWidgetSettings,
  updateWidgetAppearance,
  updateWidgetContent,
  getWidgetEmbedScript,
  previewWidget,
} from '../controllers/widgetController';
import { getVisitors, trackVisitor } from '../controllers/visitorController';

const router = Router();

// Public routes (for widget)
router.post('/track', trackVisitor);

router.use(protect);

router.get('/settings', getWidgetSettings);
router.put('/appearance', updateWidgetAppearance);
router.put('/content', updateWidgetContent);
router.get('/embed', getWidgetEmbedScript);
router.get('/preview', previewWidget);
router.get('/visitors', getVisitors);

export default router;