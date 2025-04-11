import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';



// 处理 POST 请求并生成 PDF
export async function POST(req: NextRequest) {
  const content = await req.text(); // 获取 HTML 内容


  if (!content) {
    return NextResponse.json({ error: 'No content provided' }, { status: 400 });
  }

  // @ts-ignore
  const headersList = req.headers;

  const authstring = req.headers.get('authorization');



   try {
  //   // 向 PHP 接口发起请求
   const phpApiUrl = "https://dev-portal.fluidbusinesssystems.co.nz/api2/editor/save_tiptap";

   //  const cloudfare = "https://browser-worker.winter-sunset-6f36.workers.dev";

    const response = await fetch(phpApiUrl, {
      method: 'POST',
      // @ts-ignore
      headers: {
        'Content-Type': 'text/html', // 根据你的 PHP 接口需要设置头部
        'Authorization': authstring, // 如果需要身份验证
      },
      body: content, // 直接将 HTML 内容作为请求体发送
    });

    if (!response.ok) {
      throw new Error(`PHP API returned an error: ${response.statusText}`);
    }

     return NextResponse.json(123, { status: 200 });


  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 });
  }
}


export function GET(req: NextRequest): Promise<NextResponse> {
  return new Promise((resolve, reject) => {
    try {
      // 从查询参数中获取文件名
      const { searchParams } = new URL(req.url);
      const fileName = searchParams.get('file');

      if (!fileName) {
        resolve(NextResponse.json({ status: "fail", error: "File name is required." }, { status: 400 }));
        return;
      }

      // 构建文件的完整路径
      const filePath = path.join(process.cwd(), '../../../upload/', fileName);
      console.log(`Checking file at: ${filePath}`);

      // 检查文件是否存在
      fs.access(filePath, (err) => {
        if (err) {
          console.error('Error accessing file:', err);
          resolve(NextResponse.json({ status: "fail", error: "File not found." }, { status: 404 }));
          return;
        } else {
          console.log('File exists and is accessible.');
        }

        // 文件存在，读取文件内容
        fs.readFile(filePath, (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            resolve(NextResponse.json({ status: "fail", error: "Could not read file.", details: err.message }, { status: 500 }));
            return;
          }
          console.log('File content read successfully.');

          // Determine content type based on file extension (you can expand this for other formats)
          const extname = path.extname(filePath).toLowerCase();
          let contentType = 'application/pdf';


          // Return image as response with proper content type
          resolve(
            new NextResponse(data, {
              status: 200,
              headers: {
                'Content-Type': contentType,  // Set the correct content type for the image
              },
            })
          );
        });
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      reject(NextResponse.json(
        { status: "fail", error: "An unexpected error occurred.", details: error.message || "Unknown error" },
        { status: 500 }
      ));
    }
  });
}
