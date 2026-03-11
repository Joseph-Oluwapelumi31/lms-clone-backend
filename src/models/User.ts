import mongoose from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "instructor" | "admin";
  enrolledCourses: mongoose.Types.ObjectId[];
}


const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student"
    },
    nationality: {
      type: String,
      required: false,
      trim: true
    }


  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);