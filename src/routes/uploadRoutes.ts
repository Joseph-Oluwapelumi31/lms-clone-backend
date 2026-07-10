import express from "express";
import cloudinary from "../config/cloudinary.js";
import upload from "../middlewares/multer.js";
import type { UploadApiResponse, UploadApiOptions } from "cloudinary";

const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });
    console.log("FILE RECEIVED:", req.file);
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: "ecommerce" },
    (error, result) => {
      if (error) {
        console.error("Cloudinary error:", error);
        return reject(error);
      }
      if (!result) return reject(new Error("No result from Cloudinary"));
      resolve(result);
    }
  );

  stream.on("error", (err) => {
    console.error("Stream error:", err);
    reject(err);
  });

  stream.end(file.buffer);
});

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Intern server error";
    res.status(500).json({ error: errorMessage });
  }
});

export default router;