import client from "./internal/httpClient";

export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return client.post("/backend/v1/upload/image", formData);
}

export function minioUploadId(extension: string) {
  return client.get("/backend/v1/upload/minio/upload-id", {
    extension,
  });
}

export function minioPreSignUrl(
  uploadId: string,
  filename: string,
  partNumber: number
) {
  return client.get("/backend/v1/upload/minio/pre-sign-url", {
    upload_id: uploadId,
    filename,
    part_number: partNumber,
  });
}

export function minioMergeVideo(
  filename: string,
  uploadId: string,
  categoryIds: string,
  originalFilename: string,
  extension: string,
  size: number,
  duration: number,
  poster: string
) {
  return client.post("/backend/v1/upload/minio/merge-file", {
    filename,
    upload_id: uploadId,
    original_filename: originalFilename,
    category_ids: categoryIds,
    size,
    duration,
    extension,
    poster,
  });
}
