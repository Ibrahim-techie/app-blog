import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";
import config from "../Config/Config";

function RTE({ name, control, defaultValue = "", ...props }) {
  return (
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
            height: 500,
            skin: "oxide-dark",
            content_css: "dark",
            plugins:
              "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
            toolbar:
              "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",

            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          }}
        />
      )}
    />
  );
}

export default RTE;
