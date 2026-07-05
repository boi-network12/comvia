import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getWidgetSettings,
  updateWidgetAppearance,
  updateWidgetContent,
  getWidgetEmbedScript,
  previewWidget,
} from '../controllers/widgetController';

const router = Router();

router.use(protect);

router.get('/settings', getWidgetSettings);
router.put('/appearance', updateWidgetAppearance);
router.put('/content', updateWidgetContent);
router.get('/embed', getWidgetEmbedScript);
router.get('/preview', previewWidget);

export default router;