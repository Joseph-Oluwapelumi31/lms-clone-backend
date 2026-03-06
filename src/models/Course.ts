import mongoose, {Schema, Document} from 'mongoose'

export interface Icourse extends Document {
    title: string;
    description: string;
    instructor: mongoose.Types.ObjectId;
    students: mongoose.Types.ObjectId[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const courseSchema = new Schema<Icourse>({
    title:{
        type: String,
        required: true,
        tirm: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    }

},
{timestamps: true}

)

export const Course = mongoose.model<Icourse>('Course', courseSchema)
