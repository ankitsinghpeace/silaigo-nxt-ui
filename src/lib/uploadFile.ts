import { apiFetch } from "@/hooks/interceptor";

// Define your maximum file size limit (e.g., 5MB)
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const uploadToS3 = async (fileInfo: any, file: File) => {
  // Check file size on the UI side before making any API call
  const fileSize = fileInfo?.fileSize || fileInfo?.size || file.size;
  
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size is too large (${(fileSize / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`
    );
  }

  const fromData = new FormData();
  const normalizedFileInfo = {
    resourceName: fileInfo?.resourceName || "orders",
    resourceId: fileInfo?.resourceId || "alteration",
    fileType: fileInfo?.fileType || fileInfo?.type || file.type || "image/jpeg",
    fileSize: fileSize,
    fileName: fileInfo?.fileName || fileInfo?.filename || fileInfo?.name || file.name || "photo.jpg",
    filename: fileInfo?.fileName || fileInfo?.filename || fileInfo?.name || file.name || "photo.jpg",
    name: fileInfo?.fileName || fileInfo?.filename || fileInfo?.name || file.name || "photo.jpg",
    ...fileInfo,
  };
  
  const fileInfoJson = JSON.stringify(normalizedFileInfo);
  const blob = new Blob([fileInfoJson], {
    type: 'application/json'
  });

  fromData.append("file", file);
  fromData.append("fileInfo", blob);

  const urlRes: any = await apiFetch("page-sections/upload-image", {
    method: "POST",
    body: fromData,
    auth: true
  });

  return urlRes.data.url;
};