import {getCredential} from "@/lib/authHelper";
import LocalStorageHelper from "@/lib/storageHelper";
import {useState} from "react";
import fs from "fs";
import { leftArrow } from "@tiptap/extension-typography";

export class API {
  public static uploadImage = async (_file: File) => {
    // console.log(_file)
    // console.log('11Image upload is disabled in the demo... Please implement the API.uploadImage method in your project.')
    // await new Promise(r => setTimeout(r, 500))
    // return '/placeholder-image.jpg'

    try {
      // 创建 FormData 对象，并将文件附加到其中
      const formData = new FormData();
      formData.append('file', _file);


      // 发送 POST 请求到 /api/upload
      const response = await fetch('./api/upload', {
        method: 'POST',
        body: formData,
      });

      // 如果上传成功
      if (response.ok) {
        const data = await response.json();
        console.log('Image uploaded successfully:', data);
        return data.filePath; // 返回上传成功的文件路径
      } else {
        console.error('Image upload failed:', response.statusText);
        return '/placeholder-image.jpg'; // 返回一个占位符图像路径
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return '/placeholder-image.jpg'; // 返回一个占位符图像路径
    }
  }

  public static sendTokenToServer = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    LocalStorageHelper.setItem('jwtToken', token);
  }

  public static getToken = () => {
    return LocalStorageHelper.getItem('jwtToken');
  }

  public static generatePDf = async (html: string, room: string, coverPage: boolean) => {


    const credential = getCredential();

    try {

      const dataToSend = {
        'html': html,
        'room': room,
        'token': API.getToken(),
        'coverPage': coverPage === true ? 1 : 0,
      };


      const response = await fetch('./api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/html',
          'Authorization': `${credential}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {

        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const contentDisposition = response.headers.get('Content-Disposition');

        let fileName = 'downloaded-file.pdf';
        if (contentDisposition) {
          const matches = contentDisposition.match(/filename=([^"]+)/);
          if (matches && matches.length > 1) {
            fileName = matches[1];
          }
        }

        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(pdfUrl);
      } else {
        return 0;
      }

    } catch (error) {
      return 0;
    }
  }

  public static getConvertToken = async () => {
    try {
      const response = await fetch('./api/getConvertToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('No collaboration token provided, please set TIPTAP_COLLAB_SECRET in your environment')
      }
      const data = await response.json()


      const {token} = data

      console.log(token)
      // set state when the data received
      return token;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      }

      return
    }
  }

  public static saveTip = async (html: string, json: string, room: string) => {
    try {
      const credential = getCredential();

      const response = await fetch('./api/tiptap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${credential}`,
        },
        body: JSON.stringify({
          content_html: html, // HTML 内容
          content_json: json,
          action: 'save', // 附加动作
          file_id: room,
          rtime: new Date().getTime()
        }),
      })


    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      }

      return
    }
  }

  public static saveExtraToEditor = async (room: string|undefined, data: object) => {
    try {
      const credential = getCredential();

      const response = await fetch('./api/tiptap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${credential}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('No collaboration token provided, please set TIPTAP_COLLAB_SECRET in your environment')
      }
      // set state when the data received
      return true;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      }

      return false;
    }
  }


  public static getFileInfo = async (room: string) => {
    try {
      const credential = getCredential();
      const response = await fetch(`./api/file?room=${room}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${credential}`,
        },
      })

      if (!response.ok) {
        throw new Error('No collaboration token provided, please set TIPTAP_COLLAB_SECRET in your environment')
      }
      const data = await response.json();

      // set state when the data received
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      }

      return
    }
  }

  public static getSettings = async (room: string|undefined) => {
    try {
      const credential = getCredential();
      console.log(credential)
      const response = await fetch(`./api/setting?room=${room}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${credential}`,
        },
      })

      if (!response.ok) {
        return []
      }
      const data = await response.json();


      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      }

      return []
    }
  }

}

export default API
