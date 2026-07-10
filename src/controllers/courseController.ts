import {Request, Response, NextFunction} from 'express'
import { Course } from '../models/Course.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Enrollment } from '../models/Enrollment.js'
import { Lesson } from '../models/Lesson.js'
import cloudinary from '../config/cloudinary.js'
import { UploadApiResponse } from 'cloudinary'

export const createCourse = asyncHandler(
    async(req: Request, res: Response,next: NextFunction)=>{
        const {title, description, code} = req.body;
        const user = (req as any).user;
        const file = req.file;

        if(!title || !description || !code) {
            return next(new AppError('Title, Description, and Code are required', 400 ))
        }

        if(!file) {
            return next(new AppError('Thumbnail is required', 400))
        }

        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "courses" },
              (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("No result from Cloudinary"));
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });
        
        const course = await Course.create({
            title, 
            description,
            instructor: user._id,
            thumbnail: {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            },
            code
        })
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: course,
        })
    }
);

export const getAllCourses = asyncHandler(
    async(req: Request, res: Response, next: NextFunction) =>{
        const courses = await Course.find().populate(
            'instructor',
            'name email'
        )
        res.status(200).json({
            success: true,
            result: courses.length,
            data: courses
        })

    }
);

export const getPublishedCourses = asyncHandler(
    async(req: Request, res: Response, next: NextFunction) =>{
        const courses = await Course.find({isPublished: true}).populate(
            'instructor',
            'name email'
        )
        res.status(200).json({
            success: true,
            result: courses.length,
            data: courses
        })

    }
);

export const getCoursesById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("instructor", "name email")
      .populate("lessons");

    if (!course) {
      return next(new AppError("Course does not exist", 404));
    }

    const enrollmentCount = await Enrollment.countDocuments({
      course: course._id,
    });

    res.status(200).json({
      success: true,
      data: {
        course,
        enrollmentCount,
      },
    });
  }
);



export const enrollInCourse = asyncHandler(
    async(req: Request, res: Response, next: NextFunction)=>{
        
        const user = (req as any).user
        const course = await Course.findById(req.params.id)
        
        if(!course){
            return next( new AppError('Course does not exist', 404));
        }

        if(!course.isPublished){
            return next(new AppError('You can only enroll in published courses', 400))
        }


        const existingEnrollment = await Enrollment.findOne({
            student: user._id,
            course: course._id,
        })

        if(existingEnrollment){
            return next(new AppError('You are already in this course', 400));
        }

        const enrollment = await Enrollment.create({
            student: user._id,
            course: course._id,
        });

        course.students.push(user._id);
        await course.save()
        res.status(200).json({
            success: true,
            message: 'Enrolled successfully',
            data: course
        })
    }
);

export const getMyEnrolledCourses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    const enrollments = await Enrollment.find({ student: user._id })
      .populate({
        path: "course",
        populate: [ {
          path: "instructor",
          select: "name email",
        },
        {
            path: 'lessons'
        }
    
        ],
      });

    const courses = enrollments.map((enrollment) => enrollment.course);

    res.status(200).json({
      success: true,
      data: courses,
    });
  }
);

export const getCourseEnrollments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;
    const user = (req as any).user;

    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    const isOwner = course.instructor.toString() === user._id.toString();

    if (!isOwner && user.role !== "admin") {
      return next(new AppError("Not allowed", 403));
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate("student", "name email");

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  }
);


export const updateCourse = asyncHandler(
    async(req: Request, res: Response, next: NextFunction)=>{
        const {id} = req.params;
        const user = (req as any).user;
        const {title, description, code, isPublished} = req.body;
        const file = req.file;

        const course = await Course.findById(id);
        if(!course){
            return next(new AppError('Course not found', 404));
        }

        const isOwner = course.instructor.toString() === user._id.toString();
        if(!isOwner && user.role !== 'admin'){
            return next( new AppError('You can only update your own course', 403))
        }

        // Update basic fields
        if (title !== undefined) course.title = title;
        if (description !== undefined) course.description = description;
        if (code !== undefined) course.code = code;
        if (isPublished !== undefined) course.isPublished = isPublished;

        // Handle thumbnail update
        if (file) {
            try {
                // Delete old thumbnail from Cloudinary if it exists
                if (course.thumbnail?.public_id) {
                    try {
                        await cloudinary.uploader.destroy(course.thumbnail.public_id);
                    } catch (error) {
                        console.error("Error deleting old thumbnail from Cloudinary:", error);
                    }
                }

                // Upload new thumbnail
                const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                      { folder: "courses" },
                      (error, result) => {
                        if (error) return reject(error);
                        if (!result) return reject(new Error("No result from Cloudinary"));
                        resolve(result);
                      }
                    );
                    stream.end(file.buffer);
                });

                course.thumbnail = {
                    url: uploadResult.secure_url,
                    public_id: uploadResult.public_id
                };
            } catch (error) {
                return next(new AppError('Failed to upload thumbnail', 500));
            }
        }

        await course.save();

        res.status(200).json({
          success: true,
          message: "Course updated successfully",
          data: course,
        });
    }

);

export const deleteCourse = asyncHandler(
    async(req: Request, res: Response, next: NextFunction)=>{
        const {id} = req.params;
        const user = (req as any).user;


        const course = await Course.findById(id);
        if(!course){
            return next(new AppError('Course not found', 404));
        }

        const isOwner = course.instructor.toString() === user._id.toString();
        if(!isOwner && user.role !== 'admin'){
            return next( new AppError('You can only update your own course', 403))
        }

        // Delete thumbnail from Cloudinary if it exists
        if (course.thumbnail?.public_id) {
            try {
                await cloudinary.uploader.destroy(course.thumbnail.public_id);
            } catch (error) {
                console.error("Error deleting thumbnail from Cloudinary:", error);
                // Continue with course deletion even if Cloudinary deletion fails
            }
        }

        await Lesson.deleteMany({ course: course._id });
        await Enrollment.deleteMany({ course: course._id });
        await course.deleteOne()
        res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });
    }
);