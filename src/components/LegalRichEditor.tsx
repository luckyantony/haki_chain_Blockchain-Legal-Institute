import { useEffect, useMemo } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"

interface LegalRichEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  className?: string
}

const toHtml = (input: string): string => {
  if (!input || input.trim().length === 0) {
    return "<p></p>"
  }

  return input
    .split(/\n{2,}/)
    .map((paragraph) => {
      const safe = paragraph.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      return `<p>${safe.replace(/\n/g, "<br />")}</p>`
    })
    .join("")
}

const toPlain = (html: string): string => {
  if (!html) return ""

  return html
    .replace(/<\/?p>/g, "\n")
    .replace(/<br\s*\/?>(?=\n?)/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function LegalRichEditor({ value, onChange, readOnly = false, placeholder, className }: LegalRichEditorProps) {
  const initialHtml = useMemo(() => toHtml(value), [value])

  const editor = useEditor({
    content: initialHtml,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Placeholder.configure({ placeholder: placeholder || "Start drafting your legal document…" }),
    ],
    onUpdate({ editor }) {
      const plain = toPlain(editor.getHTML())
      onChange(plain)
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = toPlain(editor.getHTML())
    if (current !== value) {
      editor.commands.setContent(toHtml(value), false)
    }
  }, [value, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly)
    }
  }, [readOnly, editor])

  return (
    <div className={`legal-editor ${readOnly ? "legal-editor--readonly" : ""} ${className || ""}`.trim()}>
      <EditorContent editor={editor} />
    </div>
  )
}
