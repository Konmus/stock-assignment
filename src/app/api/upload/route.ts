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
    const Key = `${nanoid()}.${ex}`;
    console.log(Key);
    const s3Params = {
      Bucket: process.env.BUCKET_NAME,
      Key,
      //ContentType: `image/${ex}`,
    };
    const command = new PutObjectCommand(s3Params);
    /*const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60,
    }); */
    const uploadUrl = await new Promise((resolve, reject) => {
      minio.presignedPutObject(
        process.env.MINIO_DEFAULT_BUCKET!,
        Key,
        (e, presignedUrl) => {
          if (e) {
            reject(e);
          }
          resolve(presignedUrl);
        },
      );
    });
    return NextResponse.json({
      uploadUrl,
      Key,
    });
  } catch (err) {
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
    return deleteObject;
  } catch (err) {
    return NextResponse.json(err);
  }
}
