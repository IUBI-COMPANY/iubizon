"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Highlighter,
  Undo2,
  Redo2,
  Heading2,
  ShieldAlert,
} from "lucide-react";
import { detectForbiddenContactInfo } from "@/lib/utils/contactDetector";

const PreservePastedFormat = Extension.create({
  name: "preservePastedFormat",

  addProseMirrorPlugins() {
    return [];
  },

  addKeyboardShortcuts() {
    return {
      "Shift-Enter": () => this.editor.commands.setHardBreak(),
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  maxLength = 2000,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        hardBreak: {
          keepMarks: true,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Describe tu producto...",
      }),
      PreservePastedFormat,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      if (text.length <= maxLength) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-2.5 text-sm text-[#112237]",
      },
      handlePaste: (view, event) => {
        const html = event.clipboardData?.getData("text/html");
        const text = event.clipboardData?.getData("text/plain");

        if (html && html.trim()) {
          return false;
        }

        if (text) {
          event.preventDefault();

          const paragraphs = text.split(/\n/);

          let insertPos = view.state.selection.from;

          for (let i = 0; i < paragraphs.length; i++) {
            const line = paragraphs[i];

            if (line.trim() === "") {
              view.dispatch(
                view.state.tr.insertText("\n", insertPos, insertPos),
              );
              insertPos += 1;
            } else {
              view.dispatch(
                view.state.tr.insertText(line, insertPos, insertPos),
              );
              insertPos += line.length;

              if (i < paragraphs.length - 1) {
                view.dispatch(
                  view.state.tr.insertText("\n", insertPos, insertPos),
                );
                insertPos += 1;
              }
            }
          }

          return true;
        }

        return false;
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          return false;
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  const charCount = editor.getText().length;

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        isActive
          ? "bg-[#f25c05]/10 text-[#f25c05]"
          : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#112237]"
      }`}
    >
      {children}
    </button>
  );

  const contactDetection = detectForbiddenContactInfo(
    content || editor.getHTML(),
  );

  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#f25c05] focus-within:border-transparent transition-colors">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#e2e8f0] bg-[#fafbfc]">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Negrita"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Cursiva"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Subrayado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Tachado"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[#e2e8f0] mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Título"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Lista con viñetas"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[#e2e8f0] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Alinear a la izquierda"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Centrar"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Alinear a la derecha"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[#e2e8f0] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
          title="Resaltar"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("URL del enlace:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive("link")}
          title="Insertar enlace"
        >
          <Link className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[#e2e8f0] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Deshacer"
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Rehacer"
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      {contactDetection.hasViolation && (
        <div className="mx-3 my-2 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-start gap-2.5 shadow-2xs">
          <ShieldAlert className="w-4 h-4 text-[#f25c05] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-orange-950 mb-0.5">
              Aviso de seguridad y privacidad
            </p>
            <p className="text-orange-900 text-[11px] leading-relaxed">
              {contactDetection.reason}{" "}
              {contactDetection.matchedText
                ? `(Detectado: "${contactDetection.matchedText}")`
                : ""}
            </p>
            <p className="text-[10px] text-orange-700 mt-1 font-medium">
              <em>
                En Iubizon, las compras y cotizaciones se gestionan de forma
                protegida a través del sistema oficial de la plataforma.
              </em>
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end px-4 py-1.5 border-t border-[#e2e8f0] bg-[#fafbfc]">
        <span
          className={`text-[10px] ${charCount > maxLength ? "text-[#ef4444]" : "text-[#94a3b8]"}`}
        >
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  );
}
