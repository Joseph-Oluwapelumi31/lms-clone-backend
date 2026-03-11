import {Request, Response, NextFunction} from 'express'
import { Lesson } from '../models/Lesson.js'
import { Course } from '../models/Course.js'
import { Enrollment } from '../models/Enrollment.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AppError } from '../utils/AppError.js'

export const createLesson = asyncHandler(
    async(req: Request, res: Response, next: NextFunction)=>{
        const {title, type, content, mediaUrl, thumbnailUrl, duration, order,} = req.body;
        const {courseId} = req.params;
        const user = (req as any).user;
        const course = await Course.findById(courseId);

        if(!course){
            return next(new AppError('Course not found', 404));

        }

        const isOwner = course.instructor.toString() === user._id.toString();

        if(!isOwner && user.role !== 'admin'){
            return next(new AppError('You can only add lessons to your own course', 403))
        }

        if(!title || !type){
            return next(new AppError('Title and type are required', 400));
        }
        if (type === "text" && !content) {
      return next(new AppError("Text lessons require content", 400));
        }

        if (["video", "image", "pdf"].includes(type) && !mediaUrl) {
          return next(new AppError(`${type} lessons require a mediaUrl`, 400));
        }
        const lessonsCount = await Lesson.countDocuments({ course: courseId });

        const lesson = await Lesson.create({
  title,
  type,
  content,
  mediaUrl,
  thumbnailUrl,
  duration,
  order: order ?? lessonsCount + 1,
  course: courseId,
        });

        course.lessons.push(lesson._id)
        await course.save();

        res.status(201).json({
          success: true,
          message: "Lesson created successfully",
          data: lesson,
        });
        }
);

export const getLessonByCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;
    const user = (req as any).user;

    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    const isOwner = course.instructor.toString() === user._id.toString();

    if(!isOwner && user.role !== 'admin'){
      return next(new AppError("You can only view lessons in your own course"))
    }

    

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      results: lessons.length,
      data: lessons,
    });
  }
);

export const getLessonById = asyncHandler(
    async(req: Request, res: Response, next: NextFunction)=>{
        const lesson = await Lesson.findById(req.params.id).populate(
            'course',
            'title description'
        
        )
        if(!lesson){
            return next(new AppError('Lesson not found', 404));

        }

        res.status(200).json({
            success: true,
            data: lesson
        })
    }
);

export const getStudentLessonById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { lessonId } = req.params;
    const user = (req as any).user;

    const lesson = await Lesson.findById(lessonId).populate(
      'course', 
      'title description isPublished'
    );

    if (!lesson) {
      return next(new AppError("Lesson not found", 404));
    }

    const course = lesson.course as any;

    if (!course || !course.isPublished) {
      return next(new AppError("Course not found", 404));
    }

    const enrollment = await Enrollment.findOne({
      student: user._id,
      course: course._id,
    });

    if (!enrollment) {
      return next(new AppError("You are not enrolled in this course", 403));
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  }
);

export const updateLesson = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return next(new AppError("Lesson not found", 404));
    }

    const course = await Course.findById(lesson.course);

    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    const user = (req as any).user;

    const isOwner = course.instructor.toString() === user._id.toString();

    if (!isOwner && user.role !== "admin") {
      return next(
        new AppError("You can only edit lessons in your own course", 403)
      );
    }

    const { type, content, mediaUrl } = req.body;

    const nextType = type ?? lesson.type;
    const nextContent = content ?? lesson.content;
    const nextMediaUrl = mediaUrl ?? lesson.mediaUrl;

    if (nextType === "text" && !nextContent) {
      return next(new AppError("Text lessons require content", 400));
    }

    if (["video", "image", "pdf"].includes(nextType) && !nextMediaUrl) {
      return next(new AppError(`${nextType} lessons require a mediaUrl`, 400));
    }

    const allowedFields = [
      "title",
      "type",
      "content",
      "mediaUrl",
      "thumbnailUrl",
      "duration",
      "order",
    ];

    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    Object.assign(lesson, updates);

    await lesson.save();

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  }
);
export const deleteLesson = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return next(new AppError("Lesson not found", 404));
    }

    const course = await Course.findById(lesson.course);

    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    const user = (req as any).user;

    const isOwner = course.instructor.toString() === user._id.toString();

    if (!isOwner && user.role !== "admin") {
      return next(
        new AppError("You can only delete lessons in your own course", 403)
      );
    }

    course.lessons = course.lessons.filter(
      (lessonId) => lessonId.toString() !== lesson._id.toString()
    );

    await course.save();
    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  }
);