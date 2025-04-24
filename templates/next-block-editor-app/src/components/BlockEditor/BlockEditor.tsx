import {Editor, EditorContent} from '@tiptap/react'
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
import { useSearchbar } from '@/hooks/useSearchbar'
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
import VersionHtml from "./components/Version";
import CommentHtml from "./components/CommentHtml";
import MetaDialog from "./components/MetaDialog";
import API from '@/lib/api'
import {Searchbar} from "@/components/Searchbar";

import {Drawer, Button, Accordion, AccordionSummary, AccordionDetails, Typography, AlertColor} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SearchIcon from '@mui/icons-material/Search';
import {CloudUploadIcon} from "lucide-react";
import SuccessSnackbar from "@/components/ui/Snackbar/IntegrationNotistack";

import {ExportModal} from "./modal/ExportModal";
import CustomizedMenus from './components/Settings'
import { CoverPageModal } from './modal/CoverPageModal'
import {hoverOffThread, hoverThread} from "@tiptap-pro/extension-comments";

import { useFileInfo, useReadOnly } from '@/hooks/useFileInfo';
import { useTips } from '@/hooks/useTips';
import { useSelector } from 'react-redux'

export const BlockEditor = ({
  convertToken,
  aiToken,
  ydoc,
  provider,
}: {
  convertToken?: string
  aiToken?: string
  hasCollab: boolean
  ydoc: Y.Doc
  provider?: TiptapCollabProvider | null | undefined
}) => {

  const { data: fileInfo} = useFileInfo();
  const room = fileInfo.file_id;
  const menuContainerRef = useRef(null)
  const isReadOnly = useReadOnly();
  const [showUnresolved, setShowUnresolved] = useState(true)
  const leftSidebar = useSidebar()
  const searchbar = useSearchbar()

  // @ts-ignore
  const user = useUser()

  const userName = user?.name || 'Anonymous';


  const [latestVersion, setLatestVersion] = React.useState(null)
  const [currentVersion, setCurrentVersion] = React.useState(null)
  const [versions, setVersions] = React.useState([])
  const [isAutoVersioning, setIsAutoVersioning] = React.useState(false)
  const [versioningModalOpen, setVersioningModalOpen] = React.useState(false)
  const [exportModalOpen, setExportModalOpen] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  const [coverModalOpen, setCoverModalOpen] = React.useState(false)

  let [collabToken, setCollabToken] = useState<string | null | undefined>()

  const showVersioningModal = useCallback(() => {
    setVersioningModalOpen(true)
  }, [])

  const showExportModal = useCallback((open:boolean) => {
    setExportModalOpen(open)
  }, [])

  const showCoverModal = useCallback((open:boolean) => {
    setCoverModalOpen(open)
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

  const threadClickHandler = (threadId: any) => {
    try {
      // @ts-ignore
      const isResolved = threadsRef.current.find(t => t.id === threadId)?.resolvedAt

      if (!threadId || isResolved) {
        setSelectedThread(null)
        editor.chain().unselectThread().run()
        return
      }

      setSelectedThread(threadId)
      editor.chain().selectThread({ id: threadId, updateSelection: false }).run()
    } catch (error) {
      console.error('Error handling thread click:', error)
      setSelectedThread(null)
      editor.chain().unselectThread().run()
    }
  }

  const historyObject = {
    setVersions: setVersions,
    setIsAutoVersioning: setIsAutoVersioning,
    setLatestVersion: setLatestVersion,
    setCurrentVersion: setCurrentVersion,
    'convertToken': convertToken,
    'room':room,
    'initialContent': fileInfo?.content_html,
    'threadClickHandler': threadClickHandler,
  };

  // @ts-ignore
  const { editor, users, collabState } = useBlockEditor({ aiToken, ydoc, provider, historyObject,userName})


  const { threads = [], createThread } = useThreads(provider, editor, user)
  const [selectedThread, setSelectedThread] = useState(null)
  const threadsRef = useRef([])

  threadsRef.current = threads

  // @ts-ignore
  const selectThreadInEditor = useCallback(threadId => {
    editor.chain().selectThread({ id: threadId }).run()
  }, [editor])

  // @ts-ignore
  const deleteThread = useCallback(threadId => {

    provider && provider.deleteThread(threadId)

    editor.commands.removeThread({ id: threadId })
  }, [editor])

  // @ts-ignore
  const resolveThread = useCallback(threadId => {
    editor.commands.resolveThread({ id: threadId })
  }, [editor])

  // @ts-ignore
  const unresolveThread = useCallback(threadId => {
    editor.commands.unresolveThread({ id: threadId })
  }, [editor])

  // @ts-ignore
  const updateComment = useCallback((threadId, commentId, content, metaData) => {
    editor.commands.updateComment({
      threadId, id: commentId, content, data: metaData,
    })
  }, [editor])

  // @ts-ignore
  const onHoverThread = useCallback(threadId => {
    hoverThread(editor, [threadId])
  }, [editor])

  const onLeaveThread = useCallback(() => {
    hoverOffThread(editor)
  }, [editor])

  if (!editor) {
    return null
  }


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

    console.log(version)

    const versionTitle = versionData ? versionData.name || renderDate(versionData.date) : version

    editor.commands.revertToVersion(version, `Revert to ${versionTitle}`, `Unsaved changes before revert to ${versionTitle}`)
  }, [editor])


  if (!editor || !users) {
    return null
  }

  // @ts-ignore
  const filteredThreads = threads.filter(t => (showUnresolved ? !t.resolvedAt : !!t.resolvedAt))


  const filteredThreads1 = filteredThreads ;


  const handleExport = async () => {
    setExportModalOpen(true);
  };

  const handleCoverExport = async () => {
    setCoverModalOpen(true);
  };

  const importRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)

  const [isImportLoading, setIsImportLoading] = useState(false)

  const handleImportClick = useCallback(() => {
    // @ts-ignore
    importRef.current.click()
  }, [])

  // @ts-ignore
  const handleImportFilePick = useCallback(e => {
    const file = e.target.files[0]

    // @ts-ignore
    importRef.current.value = ''

    if (!file) {
      return
    }


    setIsImportLoading(true)
    try {
        editor.chain().import({
          file,
          onImport(context) {
            // @ts-ignore
            context.setEditorContent()
            setIsImportLoading(false)
          },
        }).run()
    } catch (e) {
      setIsImportLoading(false)
    }
  }, [editor])

  const handleSeach = () => {
    //onClick={}
    searchbar.open()
    setOpen(true);
  }


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {

      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        handleSeach();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSeach]);


  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setOpen(false);
    }
  };

  const handleSave = () => {
    // Add your save logic here
  }

  const handleShare = () => {
    // Add your share logic here
  }


  const { tipsShow, tipsOpen, tipMessage, severity, tipsHandleClose } = useTips();

  // @ts-ignore
  return (
    <>
      <CoverPageModal tipsShow={tipsShow} room={room} isOpen={coverModalOpen} showCoverPageModal={showCoverModal}/>

      <ExportModal tipsShow={tipsShow} room={room} isOpen={exportModalOpen} editor={editor} showExportModal={showExportModal}/>


      <MetaDialog editor={editor} room={room} />
      <SuccessSnackbar open={tipsOpen} handleClose={tipsHandleClose} message={tipMessage} severity={severity} />

      <ThreadsProvider
        onClickThread={selectThreadInEditor}
        onDeleteThread={deleteThread}
        onHoverThread={onHoverThread}
        onLeaveThread={onLeaveThread}
        onResolveThread={resolveThread}
        onUpdateComment={updateComment}
        onUnresolveThread={unresolveThread}
        selectedThreads={editor.storage.comments.focusedThreads}
        selectedThread={selectedThread}
        setSelectedThread={setSelectedThread}
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
              <div className="w-3/4 p-2">

                <Drawer

                  // Add a custom backdrop for outside click detection
                  disableScrollLock={false}
                  disableRestoreFocus={true}
                  anchor='right' open={open} onClose={toggleDrawer(false)}
                  sx={{
                    '.MuiBackdrop-root': {
                      backgroundColor: 'transparent', // Remove gray background
                    },
                    width: 'auto', // Set width of the drawer (can be specific like '300px' or '20%')
                    height: '100px', // Set height to one-third of the viewport height
                    position: 'absolute', // Position it properly on the right side of the screen
                    top: 0, // Ensure it starts from the top of the screen
                  }}
                >
                    <Searchbar editor={editor} isOpen={open}/>
                </Drawer>


                {!isReadOnly && 
                  <div className="flex py-2 flex-row justify-between gap-4" style={{maxWidth: '42rem', margin: '0 auto'}}>

                    <div className="flex gap-4">
                      <Button size="small"
                        variant="contained"
                              style={{ backgroundColor: isLoading ? 'gray' : undefined }}
                        startIcon={<ImportExportIcon />}

                        onClick={handleExport}>
                        Export to PDF
                      </Button>

                      <Button size="small"
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        onClick={handleImportClick}
                        loading={isImportLoading}
                        loadingPosition="start"
                      >
                        Import Docx
                        <input
                          onChange={handleImportFilePick}
                          type="file"
                          accept=".docx"
                          style={{ display: 'none' }}
                          ref={importRef}
                        />
                      </Button>

                      <Button onClick={handleSeach} size="small"
                              variant="contained"
                              startIcon={<SearchIcon />}
                              >
                        Search
                      </Button>
                    </div>

                    <CustomizedMenus  room={room} handleExport={handleCoverExport} />
                  </div>
                }
                {/*{isLoading && <div className="hint purple-spinner">Processing...</div>}*/}


                <EditorContent editor={editor}  />
                <ContentItemMenu editor={editor} />
                <LinkMenu editor={editor} appendTo={menuContainerRef} />
                <TextMenu editor={editor} createThread={createThread} currentVersion={currentVersion} />
                <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
                <TableRowMenu editor={editor} appendTo={menuContainerRef} />
                <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
                <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
              </div>
              {!isReadOnly && 
                <div className="w-1/4 sidebar">

                {fileInfo.publishornot !== 0 && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header" style={{border: '1px solid #f0f0f0',}}>
                      <Typography component="span"

                      >Comments</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        <CommentHtml setShowUnresolved={setShowUnresolved} showUnresolved={showUnresolved}
                                    provider={provider} filteredThreads={filteredThreads1} />
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}
                  <Accordion defaultExpanded={fileInfo.publishornot === 0}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                      style={{
                        border: '1px solid #f0f0f0',

                      }}
                    >
                      <Typography component="span"

                      >Version History</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>
                        <VersionHtml


                          versions={versions}
                                    isAutoVersioning={isAutoVersioning}
                                    hasChanges={hasChanges}
                                    commitDescription={commitDescription}
                                    provider={provider}
                                    versioningModalOpen={versioningModalOpen}
                                    editor={editor}
                                    handleVersioningClose={handleVersioningClose}
                                    handleRevert={handleRevert}
                                    handleCommitDescriptionChange={handleCommitDescriptionChange}
                                    handleNewVersion={handleNewVersion}
                                    showVersioningModal={showVersioningModal}
                        />
                      </Typography>
                    </AccordionDetails>
                  </Accordion>


                </div>
              }
            </div>
        </div>
      </div>
      </ThreadsProvider>
    </>
  )
}

export default BlockEditor
