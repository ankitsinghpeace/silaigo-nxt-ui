import { apiFetch } from "@/hooks/interceptor";

// frontend/uploadFile.ts
// export const uploadToS3 = async (file: File): Promise<string> => {
//   const res:any = await apiFetch("page-sections/upload-url")

//   console.log(res,"url");
//   await apiFetch(res, {
//     method: "PUT",
//     headers: {
//       "Content-Type": file.type,
//     },
//     body: file,
//   });

//   // Return S3 path or full URL
//   return `https://silaigo-resources-dev--aps1-az1--x-s3.s3.ap-south-1.amazonaws.com/${res}`;
// };

// export const uploadToS3 = async (fileInfo:any,file:File) => {
//   const urlRes:any = await apiFetch("page-sections/upload-url",{
//     method:"POST",
//     body:fileInfo
//   });

//   console.log(urlRes.data.url,"url");

//   const uploadRes = await fetch(urlRes.data.url,{
//     method:"PUT",
//     headers:{
//       "Content-Type":urlRes.data.fileType
//     },
//     body:file
//   });
//   const res = await uploadRes.json();

//   console.log(uploadRes,"upload");
//   return `https://silaigo-resources-dev--aps1-az1--x-s3.s3.ap-south-1.amazonaws.com/${urlRes.data.key}`;
// }

export const uploadToS3 = async (fileInfo:any,file:File) => {
  const fromData = new FormData();
  const fileInfoJson = JSON.stringify(fileInfo);
  const blob = new Blob([fileInfoJson], {
    type: 'application/json'
  });

  fromData.append("file",file);
  fromData.append("fileInfo",blob);

  const urlRes:any = await apiFetch("page-sections/upload-image",{
    method:"POST",
    body:fromData,
    auth:true
  });
  
  return urlRes.data.url;
}

