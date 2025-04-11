'use client'


import 'iframe-resizer/js/iframeResizer.contentWindow'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import API from '@/lib/api';

import '@/styles/index.css'



export default function Document({ params }: { params: { room: string } }) {
  const [fileInfo, setFileInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true); // 用于跟踪加载状态

  const { room } = params; // 'room' 是路由参数名

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        API.sendTokenToServer();
        const info = await API.getFileInfo(room); // 异步获取数据
        setFileInfo(info);
      } catch (error) {
        console.error('Failed to fetch file info:', error);
        setFileInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [room]);

  if (loading) {
    return <div>Loading...</div>; // 显示加载状态
  }

  return (

    <div className="flex h-full" >

      <div className="relative flex flex-col flex-1 h-full overflow-hidden">


        <div className="overflow-y-auto flex p-2">
          <div className="flex-1">  </div>
          <div className="flex-auto">
            <div className="ProseMirror tiptap">
              {/* 使用 dangerouslySetInnerHTML 插入 HTML */}
              {fileInfo?.content_html ? (
                <div className="HtmlReady">
                <div  dangerouslySetInnerHTML={{ __html: fileInfo.content_html }} />
                </div>
              ) : (
                <p>No file information available.</p>
              )}
            </div>
          </div>
          <div className="flex-1 sidebar">
          </div>
        </div>
      </div>
    </div>





  );
}
