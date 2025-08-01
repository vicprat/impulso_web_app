'use client'

import Heading from '@tiptap/extension-heading'
import TextAlign from '@tiptap/extension-text-align'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

import { Toolbar } from './Toolbar'

interface Props {
  content: string
  onChange: (content: string) => void
}

export const Editor: React.FC<Props> = ({ content, onChange }) => {
  const editor = useEditor({
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl prose-slate dark:prose-invert max-w-none w-full h-full p-4 focus:outline-none bg-transparent resize-none border-none outline-none',
      },
    },
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [ 1, 2, 3 ],
      }),
      TextAlign.configure({
        types: [ 'heading', 'paragraph' ],
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [ editor, content ])

  return (
    <div className='flex size-full flex-col'>
      <Toolbar editor={editor} />
      <div className='flex-1 overflow-auto'>
        <EditorContent
          editor={editor}
          className='size-full [&_.ProseMirror]:h-full [&_.ProseMirror]:min-h-full [&_.ProseMirror]:border-none [&_.ProseMirror]:outline-none'
        />
      </div>
    </div>
  )
}