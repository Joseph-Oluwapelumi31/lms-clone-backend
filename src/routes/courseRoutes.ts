import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getCoursesById,
  enrollInCourse,
  getCourseEnrollments,
  getMyEnrolledCourses,
  getPublishedCourses,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import upload from "../middlewares/multer.js";

const router = Router();

// specific GET routes first
router.get(
  "/published",
  requireAuth,
  getPublishedCourses
);

router.get(
  "/enrolled",
  requireAuth,
  authorizeRoles("student"),
  getMyEnrolledCourses
);

router.get(
  "/:courseId/enrollments",
  requireAuth,
  authorizeRoles("instructor", "admin"),
  getCourseEnrollments
);



router.get(
  "/",
  requireAuth,
  authorizeRoles("instructor", "admin"),
  getAllCourses
);

router.get(
  "/:id",
  requireAuth,
  getCoursesById
);

// post routes
router.post(
  "/",
  requireAuth,
  authorizeRoles("instructor", "admin"),
  upload.single("thumbnail"),
  createCourse
);

router.post(
  "/:id/enroll",
  requireAuth,
  authorizeRoles("student"),
  enrollInCourse
);

// update/delete
router.patch(
  "/:id",
  requireAuth,
  authorizeRoles("instructor", "admin"),
  upload.single("thumbnail"),
  updateCourse
);

router.delete(
  "/:id",
  requireAuth,
  authorizeRoles("instructor", "admin"),
  deleteCourse
);

export default router;