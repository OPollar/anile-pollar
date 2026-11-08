import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize } from "./FontSize";
import { LineHeight } from "./LineHeight";
import { LivingImage } from "./LivingImage";
import { AudioInline } from "./AudioInline";

/** Mesma lista no editor do Mestre e no leitor => o que o Mestre vê é o que o leitor vê. */
export function getExtensions(opts: { placeholder?: string } = {}) {
  return [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Underline,
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    LineHeight,
    LivingImage,
    AudioInline,
    ...(opts.placeholder ? [Placeholder.configure({ placeholder: opts.placeholder })] : []),
  ];
}
