import { useCallback, useEffect, useState } from 'react'

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

  const createThread = useCallback((currentVersion) => {
    const input = window.prompt('Comment content')

    if (!input) {
      return
    }

    if (!editor) {
      return
    }

    editor.chain().focus().setThread({

      content: input, commentData: { userName: user.name,
        version: currentVersion,
      } }).run()
  }, [editor, user])

  const removeThread = useCallback(() => {
    editor.chain().focus().removeThread().run()
  }, [editor])

  return { threads, createThread, removeThread }
}
