"use client"

import type React from "react"
import { useRef, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")

  // Execute formatting command
  const executeCommand = useCallback(
    (command: string, value?: string) => {
      // Focus the editor and restore selection before executing command
      if (editorRef.current) {
        editorRef.current.focus()

        // Give browser time to focus before executing command
        setTimeout(() => {
          const result = document.execCommand(command, false, value)

          // Force update after command execution
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
          }
        }, 10)
      }
    },
    [onChange],
  )

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // Handle paste to clean up formatting
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      // Allow default paste behavior for better user experience
      // but clean up problematic elements afterward

      // Let the paste happen naturally
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)

      // Get clipboard data
      const html = e.clipboardData.getData("text/html")
      const text = e.clipboardData.getData("text/plain")

      // If HTML is available, use it with minimal cleaning
      if (html) {
        e.preventDefault()

        // Clean the HTML but preserve formatting
        const cleanHtml = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
          .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
          .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
          .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, "")
          .replace(/<meta\b[^<]*>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")

        document.execCommand("insertHTML", false, cleanHtml)
      } else {
        // For plain text, just let the default paste happen
        // This is more reliable for cursor positioning
      }

      // Update the value after a short delay to ensure changes are captured
      setTimeout(handleContentChange, 10)
    },
    [handleContentChange],
  )

  // Insert link
  const insertLink = useCallback(() => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">${linkText}</a>`
      document.execCommand("insertHTML", false, linkHtml)
      handleContentChange()
      setLinkUrl("")
      setLinkText("")
      setIsLinkDialogOpen(false)
    }
  }, [linkUrl, linkText, handleContentChange])

  // Check if command is active
  const isCommandActive = useCallback((command: string) => {
    return document.queryCommandState(command)
  }, [])

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    icon: Icon,
    title,
    isActive = false,
  }: {
    onClick: () => void
    icon: React.ElementType
    title: string
    isActive?: boolean
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  )

  return (
    <div className={`border rounded-lg overflow-hidden ${className} w-full`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        <ToolbarButton onClick={() => executeCommand("undo")} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => executeCommand("redo")} icon={Redo} title="Redo" />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton
          onClick={() => executeCommand("bold")}
          icon={Bold}
          title="Bold"
          isActive={isCommandActive("bold")}
        />
        <ToolbarButton
          onClick={() => executeCommand("italic")}
          icon={Italic}
          title="Italic"
          isActive={isCommandActive("italic")}
        />
        <ToolbarButton
          onClick={() => executeCommand("underline")}
          icon={Underline}
          title="Underline"
          isActive={isCommandActive("underline")}
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => executeCommand("formatBlock", "h1")} icon={Heading1} title="Heading 1" />
        <ToolbarButton onClick={() => executeCommand("formatBlock", "h2")} icon={Heading2} title="Heading 2" />
        <ToolbarButton onClick={() => executeCommand("formatBlock", "h3")} icon={Heading3} title="Heading 3" />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => executeCommand("justifyLeft")} icon={AlignLeft} title="Align Left" />
        <ToolbarButton onClick={() => executeCommand("justifyCenter")} icon={AlignCenter} title="Align Center" />
        <ToolbarButton onClick={() => executeCommand("justifyRight")} icon={AlignRight} title="Align Right" />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => executeCommand("insertUnorderedList")} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => executeCommand("insertOrderedList")} icon={ListOrdered} title="Numbered List" />
        <ToolbarButton onClick={() => executeCommand("formatBlock", "blockquote")} icon={Quote} title="Quote" />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Insert Link" className="h-8 w-8 p-0">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  placeholder="Enter link text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={insertLink} disabled={!linkUrl || !linkText}>
                Insert Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
        onPaste={handlePaste}
        onFocus={() => {
          // Ensure cursor is visible when focused
          if (editorRef.current && !editorRef.current.innerHTML) {
            // Place cursor at beginning if empty
            const range = document.createRange()
            const sel = window.getSelection()
            range.setStart(editorRef.current, 0)
            range.collapse(true)
            sel?.removeAllRanges()
            sel?.addRange(range)
          }
        }}
        role="textbox"
        aria-multiline="true"
        tabIndex={0}
        className="min-h-[300px] max-h-[600px] overflow-y-auto p-4 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 prose prose-sm max-w-none resize-none"
        style={{
          lineHeight: "1.6",
          fontFamily: "inherit",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:focus {
          outline: none;
        }
        
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          cursor: text;
        }
        
        /* Rest of the CSS remains the same */
        
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          line-height: 1.2;
        }
        
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
          line-height: 1.3;
        }
        
        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
          line-height: 1.4;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #6b7280;
          background: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 2em;
          margin: 1em 0;
        }
        
        [contenteditable] li {
          margin: 0.5em 0;
        }
        
        [contenteditable] a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
          cursor: pointer;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8 !important;
        }
        
        [contenteditable] strong, [contenteditable] b {
          font-weight: bold !important;
        }
        
        [contenteditable] em, [contenteditable] i {
          font-style: italic !important;
        }
        
        [contenteditable] u {
          text-decoration: underline !important;
        }
        
        /* Add better cursor visibility */
        [contenteditable]::selection {
          background: rgba(59, 130, 246, 0.2);
        }
        
        /* Improve mobile experience */
        @media (max-width: 768px) {
          [contenteditable] {
            font-size: 16px; /* Prevent zoom on iOS */
            padding: 12px;
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  )
}
