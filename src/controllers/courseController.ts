import {Request, Response, NextFunction} from 'express'
import { Course } from '../models/Course.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createCourse = asyncHandler(
    async(req: Request, res: Response,next: NextFunction)=>{
        const {title, description} = req.body;
        const user = (req as any).user;

        if(!title || !description) {
            return next(new AppError('Title and Description are required', 400 ))
        }
        
        const course = await Course.create({
            title, 
            description,
            instructor: user._id
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

export const getCoursesById = asyncHandler(
    async(req: Request, res: Response, next: NextFunction)=>{
        const {id} = req.params;
        const course = await Course.findById(id)
        .populate('instructor', 'name email')
        .populate('students', 'name email');

        if(!course){
            return next( new AppError('Course does not exist', 404));
        }
        res.status(200).json({
            success: true,
            data: course
        })
    }
)

export const enrollInCourse = asyncHandler(
    async(req: Request, res: Response, next: NextFunction)=>{
        
        const user = (req as any).user
        const course = await Course.findById(req.params.id)
        
        if(!course){
            return next( new AppError('Course does not exist', 404));
        }

        const alreadyEnrolled = course.students.some(
            (studentId) => studentId.toString() === user._id.toString()
        );

        if(alreadyEnrolled){
            return next(new AppError('You are already in this course', 400));
        }

        course.students.push(user._id);
        await course.save()
        res.status(200).json({
            success: true,
            message: 'Enrolled successfully',
            data: course
        })
    }
);

export const updateCourse = asyncHandler(
    async(req: Request, res: Response, next: NextFunction)=>{
        const {id} = req.params;
        const user = (req as any).user;
        const {title, description, isPublished} = req.body


        const course = await Course.findById(id);
        if(!course){
            return next(new AppError('Course not found', 404));
        }

        const isOwner = course.instructor.toString() === user._id.toString();
        if(!isOwner && user.role !== 'admin'){
            return next( new AppError('You can only update your own course', 403))
        }
        if (title !== undefined) course.title = title;
        if (description !== undefined) course.description = description;
        if (isPublished !== undefined) course.isPublished = isPublished;

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

        await course.deleteOne()
        res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });
    }
);