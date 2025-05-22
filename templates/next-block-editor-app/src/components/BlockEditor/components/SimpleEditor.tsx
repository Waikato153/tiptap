

import {Editor, EditorContent, useEditor} from '@tiptap/react'

import {TextMenu} from "@/components/menus";
import React, {useEffect, useState} from "react";

import {AnyExtension} from "@tiptap/core";
import ExtensionKit from "@/extensions/extension-kit";
import {TiptapCollabProvider} from "@hocuspocus/provider";
import {initialContent} from "@/lib/data/initialContent";

export default function SimpleEditor({ content, setShortContent }: {
  content: string,
  setShortContent: (content: string) => void
}) {

  const [provider, setProvider] = useState<TiptapCollabProvider | null>(null)

  const historyObject = {};

  const editorNew = useEditor(
    {
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      onUpdate({ editor }) {
        setShortContent(editor.getHTML())
      },
      extensions: [
        ...ExtensionKit({
          provider, historyObject
        }),
      ].filter((e): e is AnyExtension => e !== undefined),

      onCreate: ctx => {
          ctx.editor.commands.setContent(content)
      },

    }
  )

  useEffect(() => {



    if (editorNew && editorNew.getText().trim() == '') {
      editorNew.commands.setContent(content)
    }
  }, [content]);


// @ts-ignore
  return (
  <div className="editor" style={{ marginTop: '40px', border: '1px solid #ccc', backgroundColor:'rgb(239 236 235 / 5%)',borderRadius: '4px', height: '40%', overflowY: 'auto' }}>
    <EditorContent className="editor__content" editor={editorNew} />
    {editorNew && <TextMenu showComment={false} editor={editorNew}/>}
  </div>
);
}
