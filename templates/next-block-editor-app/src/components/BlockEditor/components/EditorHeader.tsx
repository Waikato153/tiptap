import { Icon } from '@/components/ui/Icon'
import { EditorInfo } from './EditorInfo'
import { EditorUser } from '../types'
import { WebSocketStatus } from '@hocuspocus/provider'
import { Toolbar } from '@/components/ui/Toolbar'
import { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { useState, useRef, useEffect } from 'react'
import { useFileInfo } from '@/hooks/useFileInfo'
import API from "@/lib/api";

export type EditorHeaderProps = {
  isSidebarOpen?: boolean
  toggleSidebar?: () => void
  editor: Editor
  collabState: WebSocketStatus
  users: EditorUser[]
}

export const EditorHeader = ({ editor, collabState, users, isSidebarOpen, toggleSidebar }: EditorHeaderProps) => {
  const { characters, words } = useEditorState({
    editor,
    selector: (ctx): { characters: number; words: number } => {
      const { characters, words } = ctx.editor?.storage.characterCount || { characters: () => 0, words: () => 0 }
      return { characters: characters(), words: words() }
    },
  })
 


  const { data: fileInfo} = useFileInfo();

  const [isEditing, setIsEditing] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditing && divRef.current) {
      divRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    console.log('handleSave')
    if (divRef.current) {
      const newFileName = divRef.current.textContent || '';

      if (!newFileName) {
        divRef.current.textContent = "Untitled File";
        setIsEditing(false);
        return;
      }
        
      if (newFileName !== fileInfo.file.name) {
        const titleData = {
          file_name: newFileName,
       };

       let data = {
         'data': titleData,
         action: 'rename',
         file_id: fileInfo.file_id,
         rtime: new Date().getTime()
       }
       console.log(JSON.stringify(data))     
       API.saveExtraToEditor(fileInfo.file_id, data)

      }
    }
  

    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return (
    <div className="flex flex-row items-center justify-between flex-none py-2 pl-6 pr-3 text-black bg-white border-b border-neutral-200 dark:bg-black dark:text-white dark:border-neutral-800">
      <div className="flex flex-row gap-x-1.5 items-center">
        <div className="flex items-center gap-x-1.5">
          <Toolbar.Button
            tooltip={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            onClick={toggleSidebar}
            active={isSidebarOpen}
            className={isSidebarOpen ? 'bg-transparent' : ''}
          >
            <Icon name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeft'} />
          </Toolbar.Button>
        </div>
        <div className="flex-1 text-center">
          <div
            ref={divRef}
            contentEditable={isEditing}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={() => setIsEditing(true)}
            title="Rename"
            className={`
              w-[270px]
              bg-transparent 
              text-left
              border-0
              hover:border hover:border-gray-300 dark:hover:border-gray-600
              focus:border focus:border-blue-500 dark:focus:border-blue-400
              rounded
              px-2 py-1
              outline-none
              transition-colors
              ${isEditing ? 'cursor-text' : 'cursor-pointer'}
              whitespace-nowrap overflow-hidden
            `}
            suppressContentEditableWarning
          >
            {fileInfo.file.name}
          </div>
        </div>
      </div>

      <EditorInfo characters={characters} words={words} collabState={collabState} users={users} />
    </div>
  )
}
