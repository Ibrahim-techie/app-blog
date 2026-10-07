import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import config from "../Config/Config";

// The editor page is an iframe and can't read the app's CSS variables, so the
// INK v2 surface and text colours are passed in directly for each theme.
const PAGE = {
  light: { background: "#faf9f5", text: "#1c2420", soft: "rgba(28,36,32,0.72)" },
  dark: { background: "#252f29", text: "#eceae3", soft: "rgba(236,234,227,0.72)" },
};

// Body copy in Newsreader and headings in Inter, as on the published post.
// Phones get slimmer margins so the writing column isn't squeezed.
const contentStyle = ({ background, text, soft }) =>
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');" +
  `body { font-family: Newsreader, Georgia, serif; font-size: 19px; line-height: 1.6; background: ${background}; color: ${soft}; margin: 24px 48px; }` +
  `h1, h2, h3, h4 { font-family: Inter, Helvetica, Arial, sans-serif; font-weight: 600; color: ${text}; letter-spacing: -0.02em; }` +
  `blockquote { border-left: 2px solid ${soft}; margin-left: 0; padding-left: 1em; font-style: italic; color: ${text}; }` +
  `.mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { color: ${soft}; }` +
  `@media (max-width: 640px) { body { margin: 16px; font-size: 18px; line-height: 1.7; } .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { left: 16px; } }`;

function RTE({ name, control, defaultValue = "", label, ...props }) {
  // The skin is chosen once, when the editor mounts — TinyMCE can't re-skin a
  // live editor, and remounting it would throw away unsaved text.
  const isDark = useSelector((state) => state.system.theme === "dark");

  return (
    <div>
      {label && (
        <p className="mb-1.5 font-mono text-xs uppercase tracking-[0.96px] text-ink-text-2">
          {label}
        </p>
      )}
      <Controller
        name={name || "content"}
        control={control}
        {...props}
        render={({ field: { onChange } }) => (
          <Editor
            apiKey={config.TinyMCE}
            initialValue={defaultValue}
            onEditorChange={onChange}
            init={{
              branding: false,
              elementpath: false,
              menubar: false,
              statusbar: false,
              height: 480,
              // Every button stays visible, wrapping onto a second row on
              // narrow screens instead of hiding behind a sideways scroll
              // (TinyMCE's default on touch devices).
              toolbar_mode: "wrap",
              mobile: { toolbar_mode: "wrap", height: 420 },
              skin: isDark ? "oxide-dark" : "oxide",
              content_css: isDark ? "dark" : "default",
              placeholder: "Start writing your story…",
              plugins:
                "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
              // The INK design's toolbar: style, inline marks, lists, quote,
              // image, undo/redo.
              toolbar:
                "blocks | bold italic underline codesample link | bullist numlist blockquote image | undo redo",

              content_style: contentStyle(PAGE[isDark ? "dark" : "light"]),
            }}
          />
        )}
      />
    </div>
  );
}

export default RTE;
