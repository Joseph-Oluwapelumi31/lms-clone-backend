import { Router } from "express";
import {
  createLesson,
  getLessonByCourse,
  getLessonById,
  getStudentLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessoncontroller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

// lesson list by course
router.get(
  "/course/:courseId",
  requireAuth,
  getLessonByCourse
);

// student lesson detail
router.get(
  "/student/:lessonId",
  requireAuth,
  authorizeRoles("student"),
  getStudentLessonById
);

// instructor/admin lesson detail
router.get(
  "/:id",
  requireAuth,
  authorizeRoles("instructor", "admin"),
  getLessonById
);

router.post(
  "/course/:courseId",
  requireAuth,
  authorizeRoles("instructor", "admin"),
  createLesson
);

router.patch(
  "/:id",
  requireAuth,
  authorizeRoles("instructor", "admin"),
  updateLesson
);

router.delete(
  "/:id",
  requireAuth,
  authorizeRoles("instructor", "admin"),
  deleteLesson
);

export default router;