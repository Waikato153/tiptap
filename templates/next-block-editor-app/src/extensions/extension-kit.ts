'use client'

import {HocuspocusProvider, TiptapCollabProvider} from '@hocuspocus/provider'

import { API } from '@/lib/api'

import {
  BlockquoteFigure,
  CharacterCount,
  CodeBlock,
  Color,
  Details,
  DetailsContent,
  DetailsSummary,
  Document,
  Dropcursor,
  Emoji,
  Figcaption,
  FileHandler,
  Focus,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalRule,
  ImageBlock,
  Link,
  Placeholder,
  Selection,
  SlashCommand,
  StarterKit,
  Subscript,
  Superscript,
  Table,
  TableOfContents,
  TableCell,
  TableHeader,
  TableRow,
  TextAlign,
  TextStyle,
  TrailingNode,
  Typography,
  Underline,
  emojiSuggestion,
  Columns,
  Column,
  TaskItem,
  TaskList,
  UniqueID,
  CommentsKit,
  ShowModal,

} from '.'

import { ImageUpload } from './ImageUpload'
import { TableOfContentsNode } from './TableOfContentsNode'
import { isChangeOrigin } from '@tiptap/extension-collaboration'
import CollaborationHistory from '@tiptap-pro/extension-collaboration-history'
import { Import } from '@tiptap-pro/extension-import'

import { SearchAndReplace } from "@sereneinserenade/tiptap-search-and-replace";

interface ExtensionKitProps {
  provider?: TiptapCollabProvider | null,
  historyObject: object
}


// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
export const ExtensionKit = ({ provider, historyObject }: ExtensionKitProps) => [
  Document,
  Columns,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Column,
  Selection,
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  HorizontalRule,
  ShowModal,
  UniqueID.configure({
    types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'table'],
    filterTransaction: transaction => !isChangeOrigin(transaction),
  }),
  StarterKit.configure({
    document: false,
    dropcursor: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
    history: false,
    codeBlock: false,
  }),
  Details.configure({
    persist: true,
    HTMLAttributes: {
      class: 'details',
    },
  }),
  DetailsContent,
  DetailsSummary,
  CodeBlock,
  TextStyle,
  FontSize,
  FontFamily,
  Color,
  TrailingNode,
  Link.configure({
    openOnClick: false,
  }),
  Highlight.configure({ multicolor: true }),
  Underline,
  CharacterCount.configure({ limit: 50000 }),
  TableOfContents,
  TableOfContentsNode,
  ImageUpload.configure({
    clientId: provider?.document?.clientID,
  }),
  ImageBlock,

  FileHandler.configure({
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    onDrop: (currentEditor, files, pos) => {
      files.forEach(async file => {
        const url = await API.uploadImage(file)

        currentEditor.chain().setImageBlockAt({ pos, src: url }).focus().run()
      })
    },
    onPaste: (currentEditor, files) => {
      files.forEach(async file => {
        const url = await API.uploadImage(file)

        return currentEditor
          .chain()
          .setImageBlockAt({ pos: currentEditor.state.selection.anchor, src: url })
          .focus()
          .run()
      })
    },
  }),
  Emoji.configure({
    enableEmoticons: true,
    suggestion: emojiSuggestion,
  }),
  TextAlign.extend({
    addKeyboardShortcuts() {
      return {}
    },
  }).configure({
    types: ['heading', 'paragraph'],
  }),
  Subscript,
  Superscript,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  Typography,
  Placeholder.configure({
    includeChildren: true,
    showOnlyCurrent: false,
    placeholder: () => '',
  }),
  SlashCommand,
  Focus,
  Figcaption,
  BlockquoteFigure,
  Dropcursor.configure({
    width: 2,
    class: 'ProseMirror-dropcursor border-black',
  }),
  CommentsKit.configure({
    provider: provider,

  }),

  CommentsKit.configure({
    provider,
    useLegacyWrapping: false,
    onClickThread: threadId => {
      // @ts-ignore
      historyObject.threadClickHandler(threadId);
    },
  }),


  CollaborationHistory.configure({
    provider: provider!,
    onUpdate: data => {
      if ("setVersions" in historyObject) {
          // @ts-ignore
          historyObject.setVersions(data.versions)
      }
      if ("setIsAutoVersioning" in historyObject) {
          // @ts-ignore
          historyObject.setIsAutoVersioning(data.versioningEnabled)
      }

      if ("setLatestVersion" in historyObject) {
        // @ts-ignore
        historyObject.setLatestVersion(data.version)
      }
      if ("setCurrentVersion" in historyObject) {
        // @ts-ignore
        historyObject.setCurrentVersion(data.currentVersion)
      }
    },
  }),

  Import.configure({
    // The Convert App-ID from the Convert settings page: https://cloud.tiptap.dev/convert-settings
    appId: 'xm41ppym',

    // The JWT token you generated in the previous step
    //token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzM2ODg0NTgsIm5iZiI6MTczMzY4ODQ1OCwiZXhwIjoxNzMzNzc0ODU4LCJpc3MiOiJodHRwczovL2Nsb3VkLnRpcHRhcC5kZXYiLCJhdWQiOiJiYWU0NjkxZS0zYjQ0LTQzOGMtYjZjZi1jYTZlMGNiNDU5ODUifQ.AVYqzAwEjCh1YL-2U4nQ1bCdIKyWHjeJC9CMehPVbJs',
    // @ts-ignore
    token: historyObject.convertToken
    //token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MzM3MDI3MTR9.vZWycjkRUnAcSoBrndVHmLGjV9nClivAslqCw9noPdY'
  }),

  SearchAndReplace.configure({
    searchResultClass: "search-result", // class to give to found items. default 'search-result'
    // @ts-ignore
    caseSensitive: false, // no need to explain
    disableRegex: false, // also no need to explain

  }),




]

export default ExtensionKit
