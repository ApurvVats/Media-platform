import { Router } from 'express';
import * as mediaController from '../controllers/mediaController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware'; // This will now resolve correctly
import { validate } from '../middleware/validationMiddleware';
import { mediaUploadSchema } from '../utils/validationSchemas';
const router = Router();
router.use(protect);
router.get('/', mediaController.getAllMedia);
// POST /api/media/upload - Uploads a new media file
router.get('/stream/:token', mediaController.streamMedia);
router.post('/upload', upload.single('mediaFile'), mediaController.uploadMedia);
router.get('/:id/stream-url', mediaController.getMediaStreamUrl);
router.delete('/:id', mediaController.deleteMedia);
export default router;