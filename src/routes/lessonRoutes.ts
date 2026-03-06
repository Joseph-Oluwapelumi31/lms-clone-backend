import {Router} from 'express'
import { createLesson, getLessonByCourse, getLessonById, updateLesson, deleteLesson } from '../controllers/lessoncontroller.js'
import { requireAuth } from '../middlewares/requireAuth.js'
import { authorizeRoles } from '../middlewares/authorizeRoles.js'

const router = Router();

router.get('/course/:courseId', getLessonByCourse);
router.get('/:id', getLessonById);

router.post(
    '/course/:courseId',
    requireAuth,
    authorizeRoles('instructor', 'admin'),
    createLesson
);

router.patch(
    '/:id',
    requireAuth,
    authorizeRoles('instructor', 'admin'),
    updateLesson
);

router.delete(
    '/:id', 
    requireAuth,
    authorizeRoles('instructor', 'admin'),
    deleteLesson
);

export default router
