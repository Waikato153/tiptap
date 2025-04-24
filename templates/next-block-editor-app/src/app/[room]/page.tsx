'use client'

import { TiptapCollabProvider } from '@hocuspocus/provider'
import 'iframe-resizer/js/iframeResizer.contentWindow'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Doc as YDoc } from 'yjs'
import { BlockEditor } from '@/components/BlockEditor'
import { createPortal } from 'react-dom'
import { Surface } from '@/components/ui/Surface'
import { Toolbar } from '@/components/ui/Toolbar'
import { Icon } from '@/components/ui/Icon'
import API from '@/lib/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { setFileInfo, setFileInfoLoading, setFileInfoError } from '@/lib/slices/fileInfoSlice';
import { setReadOnly } from '@/lib/slices/editorSlice'


const useDarkmode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setIsDarkMode(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = useCallback(() => setIsDarkMode(isDark => !isDark), [])
  const lightMode = useCallback(() => setIsDarkMode(false), [])
  const darkMode = useCallback(() => setIsDarkMode(true), [])

  return {
    isDarkMode,
    toggleDarkMode,
    lightMode,
    darkMode,
  }
}

export default function Document({ params }: { params: { room: string } }) {
  const { isDarkMode, darkMode, lightMode } = useDarkmode()
  const [provider, setProvider] = useState<TiptapCollabProvider | null>(null)
  const [collabToken, setCollabToken] = useState<string | null | undefined>()
  const [convertToken, setConvertToken] = useState<string | null | undefined>()
  const [aiToken, setAiToken] = useState<string | null | undefined>()
  const searchParams = useSearchParams()
  const dispatch = useDispatch();
  const { data: fileInfo, loading, error: fileInfoError } = useSelector((state: RootState) => state.fileInfo);


  const hasCollab = parseInt(searchParams?.get('noCollab') as string) !== 1 && collabToken !== null

  const { room } = params
 
  useEffect(() => {
    const queryReadOnly = searchParams?.get('readonly');   
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashReadOnly = hashParams.get('readonly');
    const isReadOnly = queryReadOnly === '1' || hashReadOnly === '1';
    dispatch(setReadOnly(isReadOnly));
  }, [searchParams, dispatch]);

  useEffect(() => {
    // fetch data
    const dataFetch = async () => {
      try {
        const response = await fetch('/api_document/collaboration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('No collaboration token provided, please set TIPTAP_COLLAB_SECRET in your environment')
        }
        const data = await response.json()
        const { token } = data
        // set state when the data received
        setCollabToken(token)
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        setCollabToken(null)
        return
      }
    }
    dataFetch()
    API.sendTokenToServer();
  }, [])

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        dispatch(setFileInfoLoading(true));
        dispatch(setFileInfoError(null));
        const data = await API.getFileInfo(room);       
        dispatch(setFileInfo(data));
      } catch (error) {
        console.log(error);
        dispatch(setFileInfoError(error.message))
        dispatch(setFileInfo(null));
      } finally {
        dispatch(setFileInfoLoading(false));
      }
    };
    
    fetchFileInfo();
  }, [room, dispatch]);

  useEffect(() => {
    // fetch data
    const dataFetch = async () => {

      try {
        const response = await fetch('/api_document/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('No AI token provided, please set TIPTAP_AI_SECRET in your environment')
        }
        const data = await response.json()

        const { token } = data

        // set state when the data received
        setAiToken(token)
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message)
        }
        setAiToken(null)
        return
      }
    }

    dataFetch()
  }, [])
  useEffect(() => {
    const dataFetch = async () => {
    try {
      const response = await fetch('/api_document/getConvertToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No convert token provided, please set TIPTAP_CONVERT_SECRET in your environment');
      }
      const data = await response.json();
      const { token } = data;

      // Set state when the data is received
      setConvertToken(token);

    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      setConvertToken(null);
    }
  };
    dataFetch();
  }, [])


  const ydoc = useMemo(() => new YDoc(), [])

  useLayoutEffect(() => {
    if (hasCollab && collabToken) {
      setProvider(
        new TiptapCollabProvider({
          name: `${process.env.NEXT_PUBLIC_COLLAB_DOC_PREFIX}${room}`,
          appId: process.env.NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID ?? '',
          token: collabToken,
          document: ydoc,
        }),
      )
    }
  }, [setProvider, collabToken, ydoc, room, hasCollab])

  if (loading || (hasCollab && !provider) || convertToken === undefined || aiToken === undefined || collabToken === undefined || !fileInfo) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black bg-opacity-95 dark:bg-opacity-95 z-1000">
        <div className="flex flex-col items-center gap-4">
          {fileInfoError ? (
            <div className="text-red-500 dark:text-red-400 text-lg font-medium text-center max-w-md">
              {fileInfoError}
            </div>
          ) : (
            <div className="relative">
              
              <div className="w-16 h-16 border-4 border-blue-500/20 dark:border-blue-400/20 rounded-full"></div>
              
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const DarkModeSwitcher = createPortal(
    <Surface className="flex items-center gap-1 fixed bottom-6 right-6 z-[1] p-1">
      <Toolbar.Button onClick={lightMode} active={!isDarkMode}>
        <Icon name="Sun" />
      </Toolbar.Button>
      <Toolbar.Button onClick={darkMode} active={isDarkMode}>
        <Icon name="Moon" />
      </Toolbar.Button>
    </Surface>,
    document.body,
  )

  return (
    <>
      {DarkModeSwitcher}
      <BlockEditor convertToken={convertToken ?? undefined}  aiToken={aiToken ?? undefined} hasCollab={hasCollab} ydoc={ydoc} provider={provider} />
    </>
  )
}
