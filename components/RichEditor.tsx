"use client";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading2, Highlighter, Italic, List, Quote, Redo2, Underline as UnderlineIcon, Undo2,
} from "lucide-react";
import type { ReactNode } from "react";
import { BODY_FONTS } from "@/lib/theme";

function Btn({ active, onClick, label, children }: { active?: boolean; onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded p-1.5 transition hover:bg-primary/20 ${active ? "bg-primary/25 text-primary" : "text-ink/80"}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const chain = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-primary/20 p-2">
      <Btn label="Negrito" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}><Bold size={16} /></Btn>
      <Btn label="Itálico" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}><Italic size={16} /></Btn>
      <Btn label="Sublinhado" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()}><UnderlineIcon size={16} /></Btn>
      <Btn label="Destaque" active={editor.isActive("highlight")} onClick={() => chain().toggleHighlight().run()}><Highlighter size={16} /></Btn>
      <Btn label="Título" active={editor.isActive("heading", { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Btn>
      <Btn label="Citação" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}><Quote size={16} /></Btn>
      <Btn label="Lista" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}><List size={16} /></Btn>
      <Btn label="Esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => chain().setTextAlign("left").run()}><AlignLeft size={16} /></Btn>
      <Btn label="Centro" active={editor.isActive({ textAlign: "center" })} onClick={() => chain().setTextAlign("center").run()}><AlignCenter size={16} /></Btn>
      <Btn label="Direita" active={editor.isActive({ textAlign: "right" })} onClick={() => chain().setTextAlign("right").run()}><AlignRight size={16} /></Btn>
      <Btn label="Desfazer" onClick={() => chain().undo().run()}><Undo2 size={16} /></Btn>
      <Btn label="Refazer" onClick={() => chain().redo().run()}><Redo2 size={16} /></Btn>
      <select
        aria-label="Fonte"
        className="rounded border border-primary/30 bg-black/40 px-2 py-1 text-xs"
        defaultValue=""
        onChange={(e) => {
          const v = e.target.value;
          if (v) chain().setFontFamily(v).run();
          else chain().unsetFontFamily().run();
        }}
      >
        <option value="">Fonte padrão</option>
        {BODY_FONTS.map((f) => (
          <option key={f.label} value={f.family}>{f.label}</option>
        ))}
      </select>
      <input
        type="color"
        aria-label="Cor do texto"
        title="Cor do texto"
        className="h-7 w-7 cursor-pointer rounded border border-primary/30 bg-transparent"
        onChange={(e) => chain().setColor(e.target.value).run()}
      />
    </div>
  );
}

export default function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Escreva o capítulo..." }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: { attributes: { class: "chapter-body min-h-[340px] px-4 py-3 outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return <div className="card min-h-[400px]" />;

  return (
    <div className="rounded-lg border border-primary/30 bg-black/20">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
