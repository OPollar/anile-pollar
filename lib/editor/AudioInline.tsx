"use client";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audioInline: {
      setAudioInline: (attrs: { src: string; title?: string }) => ReturnType;
    };
  }
}

function AudioInlineView({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const { src, title } = node.attrs;
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const counted = useRef(false);
  const duck = useStore((s) => s.duck);

  // Enquanto este áudio toca, a trilha de fundo abaixa para não brigar com ele.
  const setDucked = (on: boolean) => {
    if (on && !counted.current) {
      counted.current = true;
      duck(+1);
    } else if (!on && counted.current) {
      counted.current = false;
      duck(-1);
    }
  };

  useEffect(
    () => () => {
      ref.current?.pause();
      if (counted.current) {
        counted.current = false;
        duck(-1);
      }
    },
    [duck]
  );

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  return (
    <NodeViewWrapper as="span" className="mx-1 inline-block align-middle" contentEditable={false}>
      <span
        className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full border bg-black/55 py-1 pl-1 pr-3 align-middle backdrop-blur-sm ${
          playing ? "border-accent shadow-glow" : "border-primary/50"
        } ${editor.isEditable && selected ? "outline outline-2 outline-offset-2 outline-accent" : ""}`}
        style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, lineHeight: 1.2, color: "#fff" }}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar áudio" : "Tocar áudio"}
          className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white transition hover:scale-110 hover:shadow-glow"
        >
          {playing ? <Pause size={14} /> : <Play size={14} className="translate-x-px" />}
        </button>
        {playing ? (
          <span className="flex h-4 items-end gap-[2px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-full w-[3px] origin-bottom rounded bg-glow animate-bars"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </span>
        ) : (
          <Volume2 size={14} className="text-glow" aria-hidden />
        )}
        {editor.isEditable && selected ? (
          <input
            value={title || ""}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-32 bg-transparent text-white outline-none"
          />
        ) : (
          <span className="max-w-[12rem] truncate">{title || "Áudio"}</span>
        )}
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary to-accent"
          style={{ width: `${progress * 100}%` }}
        />
        <audio
          ref={ref}
          src={src}
          preload="metadata"
          onPlay={() => {
            setPlaying(true);
            setDucked(true);
          }}
          onPause={() => {
            setPlaying(false);
            setDucked(false);
          }}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
            setDucked(false);
          }}
          onTimeUpdate={(e) => {
            const a = e.currentTarget;
            setProgress(a.duration ? a.currentTime / a.duration : 0);
          }}
        />
      </span>
    </NodeViewWrapper>
  );
}

/** Áudio "inline": pode ficar no MEIO de um parágrafo (efeito sonoro, fala, narração). */
export const AudioInline = Node.create({
  name: "audioInline",
  group: "inline",
  inline: true,
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      title: { default: "Áudio" },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-audio]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-audio": "" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(AudioInlineView);
  },
  addCommands() {
    return {
      setAudioInline:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
