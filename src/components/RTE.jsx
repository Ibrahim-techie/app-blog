import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import config from "../Config/Config";

// The editor page is an iframe and can't read the app's CSS variables, so the
// INK surface and text colours are passed in directly for each theme.
const PAGE = {
  light: { background: "#faf9f5", text: "#111412" },
  dark: { background: "#2d3b35", text: "#f3f1ea" },
};

const contentStyle = ({ background, text }) =>
  "@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap');" +
  `body { font-family: Manrope, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.7; background: ${background}; color: ${text}; margin: 24px 32px; }`;

function RTE({ name, control, defaultValue = "", label, ...props }) {
  // The skin is chosen once, when the editor mounts — TinyMCE can't re-skin a
  // live editor, and remounting it would throw away unsaved text.
  const isDark = useSelector((state) => state.system.theme === "dark");

  return (
    <div>
      {label && (
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.3px] text-ink-muted">
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
