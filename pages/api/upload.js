
import multer from "multer";
const cloudinary = require("cloudinary").v2;
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({ storage });
const myUploadMiddleware = upload.array("file");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, myUploadMiddleware);
  for (const file of req.files) {
    try {
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const response = await cloudinary.uploader.upload(dataURI, {
        folder: "dropzone-images",
      });
    } catch (error) {
      res.status(400).json(error);
      return;
    }
  }
  res.status(200).json({message: "Upload successfull"});
}

export const config = {
  api: {
    bodyParser: false,
  },
};
