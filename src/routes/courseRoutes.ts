import { Router } from "express";

const router = Router()

import { createCourse, getAllCourses, getCoursesById, enrollInCourse, updateCourse, deleteCourse } from "../controllers/courseController.js";

import { requireAuth } from "../middlewares/requireAuth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

router.get("/",requireAuth, getAllCourses);
router.get("/:id",requireAuth, getCoursesById);

router.post(
    '/',
    requireAuth,
    authorizeRoles('instructor', 'admin'),
     createCourse),

router.post(
    '/:id/enroll',
    requireAuth,
    authorizeRoles('student'),
    enrollInCourse);
router.patch(
    '/:id',
    requireAuth,
    authorizeRoles('insturctor', 'admin'),
    updateCourse);
router.delete(
    '/:id',
    requireAuth,
    authorizeRoles('instructor', 'admin'),
    deleteCourse
)

export default router;