import multer from "multer";

const toSafeFileName = (name = "") =>
  name
    .normalize("NFKD")
    .replace(/[^\w.\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

const storage = multer.diskStorage({
    destination: function(req, file , cb){
        cb(null , "public")
    },
    filename: function(req , file , cb){
        const safeOriginal = toSafeFileName(file.originalname || "file");
        const filename = `${Date.now()}-${safeOriginal}`;
        cb(null , filename)
    }
})


export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
