import { useCallback, useEffect, useState } from 'react'
import { subscribeToThreads } from '@tiptap-pro/extension-comments'

import API from '@/lib/api'

export const useThreads = (provider, editor, user) => {
  const [threads, setThreads] = useState()

  useEffect(() => {
    if (provider) {
      const updateHandler = () => {

        let threadsList = provider.getThreads()


        if (threadsList.length == 0 && user?.file?.comment) {
          //threadsList = JSON.parse(user.file.comment)
        }

        let data = {
          'data': threadsList,
          action: 'comment',
          file_id: user.room,
          rtime: new Date().getTime()
        }

        API.saveExtraToEditor(user.room, data)

        setThreads(threadsList)

      }

      provider.watchThreads(updateHandler)
      provider.on('synced', updateHandler)

      return () => {
        provider.unwatchThreads(updateHandler)
        provider.off('synced', updateHandler)
      }
    }
  }, [provider])

  useEffect(() => {
    if (provider) {
      const unsubscribe = subscribeToThreads({
        provider,
        callback: currentThreads => {

          console.log('currentThreads', currentThreads)

          let data = {
            'data': currentThreads,
            action: 'comment',
            file_id: user.room,
            rtime: new Date().getTime()
          }

          API.saveExtraToEditor(user.room, data)

          setThreads(currentThreads)
        },
      })

      return () => {
        unsubscribe()
      }
    }
  }, [provider])

  const createThread = useCallback((input, currentVersion) => {

    if (!editor) {
      return false;
    }
    editor.chain().focus().setThread({
      content: input, commentData: {
        userId: user.id,
        userName: user.name,
        version: currentVersion,
      } }).run()

    return true
  }, [editor, user])

  const removeThread = useCallback(() => {
    editor.chain().focus().removeThread().run()
  }, [editor])

  return { threads, createThread, removeThread }
}
