import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import * as Minio from "minio";
/*const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: process.env.REGION,
}); */
const minio = new Minio.Client({
  endPoint: "127.0.0.1",
  port: 9000,
  secretKey: process.env.MINIO_SECRET_KEY!,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  useSSL: false,
});
export async function GET(req: NextRequest) {
  try {
    const ex = req.nextUrl.searchParams.get("fileType")?.split("/")[1];
    console.log(ex);
    const bucket = process.env.MINIO_DEFAULT_BUCKET || "item-photo";
    const Key = `${nanoid()}.${ex}`;
    // Check if bucket exists
    console.log(`Checking if bucket ${bucket} exists...`);
    const bucketExists = await minio.bucketExists(bucket);
    console.log(bucketExists);
    console.log(`Bucket ${bucket} does not exist. Creating...`);
    if (!bucketExists) {
      try {
        await minio.makeBucket(bucket);
        console.log(`Bucket ${bucket} created successfully.`);
        // Set bucket policy after creation
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: process.env.MINIO_ACCESS_KEY || "minioadmin" },
              Action: ["s3:CreateBucket", "s3:PutObject", "s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucket}`, `arn:aws:s3:::${bucket}/*`],
            },
            {
              Effect: "Allow",
              Principal: { AWS: "*" },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        };
        await minio.setBucketPolicy(bucket, JSON.stringify(policy));
        console.log(`Policy set for bucket ${bucket}.`);
      } catch (error) {
        console.error(`Failed to create or configure bucket ${bucket}:`, error);
        throw new Error(
          `Cannot create bucket ${bucket}: Access Denied or Configuration Error`,
        );
      }
    }

    const uploadUrl = await new Promise((resolve, reject) => {
      minio.presignedPutObject("item-photo", Key, (e, presignedUrl) => {
        if (e) {
          reject(e);
        }
        resolve(presignedUrl);
      });
    });
    return NextResponse.json({
      uploadUrl,
      Key,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const deleteParams = req.nextUrl.searchParams.get("id")?.split(",");
    if (!deleteParams)
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    const deleteObject = await new Promise((resolve, reject) => {
      minio.removeObjects(
        process.env.MINIO_DEFAULT_BUCKET!,
        deleteParams,
        (e) => {
          if (e) {
            reject(NextResponse.json(e));
          }
          resolve(NextResponse.json("Image Deleted Successfully"));
        },
      );
    });
    return NextResponse.json("Image has been deleted");
  } catch (err) {
    return NextResponse.json(err);
  }
}
