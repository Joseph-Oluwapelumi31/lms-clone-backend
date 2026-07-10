import mongoose, {Schema, Document} from 'mongoose'

export interface ILesson extends Document {
    title: string;
    type: 'text' | 'video' | 'image' | 'pdf';
    content?: string;
    media?: {
        url: string;
        public_id: string;
    };
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
    media: {
      type: {
        url: {
          type: String,
          required: true,
          trim: true,
        },
        public_id: {
          type: String,
          required: true,
          trim: true,
        }
      },
      required: false,
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