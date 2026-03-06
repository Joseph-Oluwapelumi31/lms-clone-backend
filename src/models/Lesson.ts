import mongoose, {Schema, Document} from 'mongoose'
import { title } from 'node:process'

export interface ILesson extends Document {
    title: string;
    type: 'text' | 'video' | 'image' | 'pdf';
    content?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    order: number;
    course: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date
}

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "video", "image", "pdf"],
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    mediaUrl: {
      type: String,
      trim: true,
    },
       thumbnailUrl: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
);

export const Lesson = mongoose.model<ILesson>("Lesson", lessonSchema);