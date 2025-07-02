'use client'

import Heading from '@tiptap/extension-heading'
import TextAlign from '@tiptap/extension-text-align'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

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
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none border border-border rounded-md p-4 min-h-[300px] focus:outline-none dark:prose-invert',
      },
    },
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className='flex flex-col justify-stretch gap-4'>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
