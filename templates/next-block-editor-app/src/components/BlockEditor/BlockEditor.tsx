import { EditorContent } from '@tiptap/react'
import React, { useRef, useState, useCallback,useEffect } from 'react'

import { LinkMenu } from '@/components/menus'

import { useBlockEditor } from '@/hooks/useBlockEditor'

import '@/styles/index.css'

import { Sidebar } from '@/components/Sidebar'
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu'
import { ColumnsMenu } from '@/extensions/MultiColumn/menus'
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus'
import { EditorHeader } from './components/EditorHeader'
import { TextMenu } from '../menus/TextMenu'
import { ContentItemMenu } from '../menus/ContentItemMenu'
import { useSidebar } from '@/hooks/useSidebar'
import * as Y from 'yjs'
import { TiptapCollabProvider } from '@hocuspocus/provider'

import { ThreadsList } from '@/components/ThreadsList'
import { useUser } from '@/hooks/useUser'
import { useThreads } from '@/hooks/useThreads'
import { ThreadsProvider } from '../context'
import { renderDate } from '@/lib/utils'
import CollaborationHistory from '@tiptap-pro/extension-collaboration-history'
// @ts-ignore
import { VersioningModal } from './components/VersioningModal'

export const BlockEditor = ({
  aiToken,
  ydoc,
  provider,
}: {
  aiToken?: string
  hasCollab: boolean
  ydoc: Y.Doc
  provider?: TiptapCollabProvider | null | undefined
}) => {


  const menuContainerRef = useRef(null)

  const [showUnresolved, setShowUnresolved] = useState(true)
  const user = useUser()




  const [latestVersion, setLatestVersion] = React.useState(null)
  const [currentVersion, setCurrentVersion] = React.useState(null)
  const [versions, setVersions] = React.useState([])
  const [isAutoVersioning, setIsAutoVersioning] = React.useState(false)
  const [versioningModalOpen, setVersioningModalOpen] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)


  const showVersioningModal = useCallback(() => {
    setVersioningModalOpen(true)
  }, [])




  useEffect(() => {
    const onUpdate = () => {
      setHasChanges(true)
    }

    const onSynced = () => {
      ydoc.on('update', onUpdate)
    }

    // @ts-ignore
    provider.on('synced', onSynced)

    return () => {
      // @ts-ignore
      provider.off('synced', onSynced)
      ydoc.off('update', onUpdate)
    }
  }, [ydoc])


  const [commitDescription, setCommitDescription] = React.useState('')

  const handleCommitDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommitDescription(event.target.value)
  }


  const historyObject = {
    setVersions: setVersions,
    setIsAutoVersioning: setIsAutoVersioning,
    setLatestVersion: setLatestVersion,
    setCurrentVersion: setCurrentVersion,
  };


  const leftSidebar = useSidebar()
  const { editor, users, collabState } = useBlockEditor({ aiToken, ydoc, provider, historyObject })

  const { threads = [], createThread } = useThreads(provider, editor, user)





  // @ts-ignore
  const selectThreadInEditor = useCallback(threadId => {
    editor.chain().selectThread({ id: threadId, selectAround: true}).run()

  }, [editor])

  const deleteThread = useCallback((threadId: any) => {
    // @ts-ignore
    provider.deleteThread(threadId)
    editor.commands.removeThread({ id: threadId })
    return null
  }, [editor])

  // @ts-ignore
  const resolveThread = useCallback(threadId => {
    editor.commands.resolveThread({ id: threadId })
    return null
  }, [editor])

  // @ts-ignore
  const unresolveThread = useCallback(threadId => {
    editor.commands.unresolveThread({ id: threadId })
    return null
  }, [editor])

  // @ts-ignore
  const updateComment = useCallback((threadId, commentId, content, metaData) => {
    editor.commands.updateComment({
      threadId, id: commentId, content, data: metaData,
    })
    return null
  }, [editor])

  // @ts-ignore
  const onHoverThread = useCallback(threadId => {
    const { tr } = editor.state

    tr.setMeta('threadMouseOver', threadId)
    editor.view.dispatch(tr)
    return null
  }, [editor])

  // @ts-ignore
  const onLeaveThread = useCallback(threadId => {
    const { tr } = editor.state

    tr.setMeta('threadMouseOut', threadId)
    editor.view.dispatch(tr)
    return null
  }, [editor])


  const handleNewVersion = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!commitDescription) {
      return
    }
    editor.commands.saveVersion(commitDescription)
    setCommitDescription('')
    alert(`Version ${commitDescription} created! Open the version history to see all versions.`)
    setHasChanges(false)
  }, [editor, commitDescription])

  const handleVersioningClose = useCallback(() => {
    setVersioningModalOpen(false)
  }, [])

  // @ts-ignore
  const handleRevert = useCallback((version, versionData) => {
    const versionTitle = versionData ? versionData.name || renderDate(versionData.date) : version

    editor.commands.revertToVersion(version, `Revert to ${versionTitle}`, `Unsaved changes before revert to ${versionTitle}`)
  }, [editor])



  if (!editor || !users) {
    return null
  }


  // @ts-ignore
  const filteredThreads = threads.filter(t => (showUnresolved ? !t.resolvedAt : !!t.resolvedAt))



  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <ThreadsProvider
      onClickThread={selectThreadInEditor}
      onDeleteThread={deleteThread}
      onHoverThread={onHoverThread}
      onLeaveThread={onLeaveThread}
      onResolveThread={resolveThread}
      onUpdateComment={updateComment}
      onUnresolveThread={unresolveThread}
      selectedThreads={editor.storage.comments.focusedThreads}
      threads={threads}
    >

    <div className="flex h-full" ref={menuContainerRef}>
      <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} editor={editor} />
      <div className="relative flex flex-col flex-1 h-full overflow-hidden">
        <EditorHeader
          editor={editor}
          collabState={collabState}
          users={users}
          isSidebarOpen={leftSidebar.isOpen}
          toggleSidebar={leftSidebar.toggle}
        />

        <div className="overflow-y-auto flex p-2">
          <div className="flex-1">
            <VersioningModal
              versions={versions}
              isOpen={versioningModalOpen}
              onClose={handleVersioningClose}
              onRevert={handleRevert}
              provider={provider}
            />
            <div className="col-group">
              <div className="sidebar">
                <div className="sidebar-options">
                  <div className="option-group">
                    <div className="label-large">Auto versioning</div>
                    <div className="switch-group">
                      <label>
                        <input
                          type="radio"
                          name="auto-versioning"
                          onChange={() => !isAutoVersioning && editor.commands.toggleVersioning()}
                          checked={isAutoVersioning}
                        />
                        Enable
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="auto-versioning"
                          onChange={() => isAutoVersioning && editor.commands.toggleVersioning()}
                          checked={(!isAutoVersioning)}
                        />
                        Disable
                      </label>
                    </div>
                  </div>
                  <hr />
                  <div className="option-group">
                    <div className="label-large">Manual versioning</div>
                    <div className="label-small">Make adjustments to the document to manually save a new version.</div>
                    <form className="commit-panel">
                      <input disabled={!hasChanges} type="text" placeholder="Version name" value={commitDescription} onChange={handleCommitDescriptionChange} />
                      <button disabled={!hasChanges || commitDescription.length === 0} type="submit" onClick={handleNewVersion}>Create</button>
                    </form>
                  </div>
                  <hr />
                  <button className="primary" type="button" onClick={showVersioningModal}>Show history</button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-auto">
            <EditorContent editor={editor}  />
            <ContentItemMenu editor={editor} />
            <LinkMenu editor={editor} appendTo={menuContainerRef} />
            <TextMenu editor={editor} createThread={createThread} currentVersion={currentVersion} />
            <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
            <TableRowMenu editor={editor} appendTo={menuContainerRef} />
            <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
            <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
          </div>
          <div className="flex-1 sidebar">
            <div className="sidebar-options">
              <div className="option-group">
                <div className="label-large">Comments</div>
                <div className="switch-group">
                  <label>
                    <input type="radio" name="thread-state" onChange={() => setShowUnresolved(true)} checked={showUnresolved} />
                    Open
                  </label>
                  <label>
                    <input type="radio" name="thread-state" onChange={() => setShowUnresolved(false)} checked={!showUnresolved}/>
                    Resolved
                  </label>
                </div>
              </div>
              <ThreadsList provider={provider} threads={filteredThreads} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </ThreadsProvider>
  )
}

export default BlockEditor
