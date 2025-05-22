import { useEffect, useState } from 'react'
import { useEditor, useEditorState } from '@tiptap/react'
import type { AnyExtension, Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { TiptapCollabProvider, WebSocketStatus } from '@hocuspocus/provider'
import type { Doc as YDoc } from 'yjs'

import { ExtensionKit } from '@/extensions/extension-kit'

import type { EditorUser } from '../components/BlockEditor/types'
// import { Ai } from '@/extensions/Ai'
// import { AiImage, AiWriter } from '@/extensions'
//import { ThreadsKit } from '@tiptap-pro/extension-comments'
import API from '@/lib/api';
import { debounce } from 'lodash';
import { useFileInfo, useReadOnly } from './useFileInfo'

const debouncedSave = debounce((content2, contentJSON, room: string) => {
  API.saveTip(content2, contentJSON, room);
}, 4000);

declare global {
  interface Window {
    editor: Editor | null
  }
}



export const useBlockEditor = ({
  aiToken,
  ydoc,
  provider,
  historyObject,
  UserObject,
}: {
  aiToken?: string
  ydoc: YDoc
  provider?: TiptapCollabProvider | null | undefined
  historyObject: object
  UserObject?: object
}) => {
  const [collabState, setCollabState] = useState<WebSocketStatus>(
    provider ? WebSocketStatus.Connecting : WebSocketStatus.Disconnected,
  )

  const isReadOnly = useReadOnly ();
  const { data: fileInfo} = useFileInfo();
  let composing = false;

  const editor = useEditor(
    {
      editable: false,
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      autofocus: false,
      content: fileInfo.content_html?.trim() ? fileInfo.content_html : null,
      onCreate: ctx => {
        if (provider && !provider.isSynced) {
          provider.on('synced', () => {
            setTimeout(() => {
              if (ctx.editor.isEmpty) {
                ctx.editor.commands.setContent(null)
              }
            }, 0)
          })
        } else if (ctx.editor.isEmpty) {
          ctx.editor.commands.setContent(null)
          ctx.editor.commands.focus('start', { scrollIntoView: true })
        }
      },
      onUpdate: ({ editor }) => {
        if (!isReadOnly) {
          const content = editor.getJSON();
          const content2 = editor.getHTML();
          // @ts-ignore
          debouncedSave(content2, JSON.stringify(content), historyObject.room);
        } else {

        }
      },
      extensions: [
        ...ExtensionKit({
          provider, historyObject
        }),

         provider
          ? Collaboration.configure({
              document: ydoc,
            })
          : undefined,
        !isReadOnly && provider
          ? CollaborationCursor.configure({
              provider,
              user: UserObject,
            })
          : undefined,
        // aiToken
        //   ? AiWriter.configure({
        //       authorId: userId,
        //       authorName: userName,
        //     })
        //   : undefined,
        // aiToken
        //   ? AiImage.configure({
        //       authorId: userId,
        //       authorName: userName,
        //     })
        //   : undefined,
        //aiToken ? Ai.configure({ token: aiToken }) : undefined,
      ].filter((e): e is AnyExtension => e !== undefined),
      editorProps: {
        attributes: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          class: 'min-h-full',
        },
        handleDOMEvents: {
          compositionstart: () => {
            composing = true
            return false
          },
          compositionend: () => {
            composing = false
            return false
          },
          beforeinput: (view, event) => {
            if (isReadOnly) {
              event.preventDefault()
              return true
            }
            return false
          },
          input: (view, event) => {
            if (composing && isReadOnly ) {
              setTimeout(() => {
                editor.commands.undo()
              }, 0)
              return true
            }
            return false
          },
          keydown(view, event) {
            if (isReadOnly) {
              event.preventDefault()
              return true
            }
          },
          copy: (view, event) => {
            if (isReadOnly) {
              event.preventDefault()
              return true
            }
          },
          cut: (view, event) => {
            if (isReadOnly) {
              event.preventDefault()
              return true
            }
          },
          click: (view, event) => {
            if (isReadOnly) {
              editor.view.dom.classList.remove('ProseMirror-focused')
              event.preventDefault()
              return true
            }
          },
          contextmenu: (view, event) => {
            if (isReadOnly) {
              event.preventDefault()
              return true
            }
          }
        }
      },

    },
    [ydoc, provider],
  )
  const users = useEditorState({
    editor,
    selector: (ctx): (EditorUser & { initials: string })[] => {
      if (!ctx.editor?.storage.collaborationCursor?.users) {
        return []
      }

      return ctx.editor.storage.collaborationCursor.users.map((user: EditorUser) => {
        const names = user.name?.split(' ')
        const firstName = names?.[0]
        const lastName = names?.[names.length - 1]
        const initials = `${firstName?.[0] || '?'}${lastName?.[0] || '?'}`

        return { ...user, initials: initials.length ? initials : '?' }
      })
    },
  })


  useEffect(() => {
    if (editor && !isReadOnly) {
      editor.setEditable(true);
    }
  }, [editor, isReadOnly]);


  useEffect(() => {
    provider?.on('status', (event: { status: WebSocketStatus }) => {
      setCollabState(event.status)
    })
  }, [provider])

  window.editor = editor

  return { editor, users, collabState }
}
