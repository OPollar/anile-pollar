"use client";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { LivingImageFx, IMAGE_EFFECTS, IMAGE_SIZES } from "@/components/LivingImageFx";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    livingImage: {
      setLivingImage: (attrs: { src: string; alt?: string }) => ReturnType;
    };
  }
}

function LivingImageView({ node, updateAttributes, selected, editor, deleteNode }: NodeViewProps) {
  const { src, alt, effect, size } = node.attrs;
  const editing = editor.isEditable;
  return (
    <NodeViewWrapper
      className={editing && selected ? "rounded-2xl outline outline-2 outline-offset-4 outline-accent" : ""}
      contentEditable={false}
    >
      <LivingImageFx src={src} alt={alt} effect={effect} size={size} />
      {editing && selected && (
        <div
          className="mx-auto -mt-4 mb-6 flex max-w-full flex-wrap items-center justify-center gap-2 rounded-xl border border-primary/40 bg-black/80 p-2 text-xs text-white backdrop-blur"
          style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, lineHeight: 1.2 }}
        >
          <select
            value={effect}
            onChange={(e) => updateAttributes({ effect: e.target.value })}
            className="rounded bg-white/10 px-2 py-1"
          >
            {IMAGE_EFFECTS.map((o) => (
              <option key={o.value} value={o.value} className="text-black">
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={size}
            onChange={(e) => updateAttributes({ size: e.target.value })}
            className="rounded bg-white/10 px-2 py-1"
          >
            {IMAGE_SIZES.map((o) => (
              <option key={o.value} value={o.value} className="text-black">
                {o.label}
              </option>
            ))}
          </select>
          <input
            value={alt || ""}
            onChange={(e) => updateAttributes({ alt: e.target.value })}
            placeholder="Descrição (alt)"
            className="w-36 rounded bg-white/10 px-2 py-1 placeholder:text-white/40"
          />
          <button onClick={deleteNode} className="rounded bg-red-600/80 px-2 py-1 hover:bg-red-600">
            Remover
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const LivingImage = Node.create({
  name: "livingImage",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      effect: { default: "full" },
      size: { default: "md" },
    };
  },
  parseHTML() {
    return [{ tag: "img[data-living]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes, { "data-living": "" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(LivingImageView);
  },
  addCommands() {
    return {
      setLivingImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
