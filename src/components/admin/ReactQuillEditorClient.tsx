"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import ImagePickerModal from "./modals/image.picker.modal";
import Quill from "quill";
import "./quill-figure-blot";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const icons = Quill.import("ui/icons");

icons["figure"] = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M23 4C23 2.34315 21.6569 1 20 1H4C2.34315 1 1 2.34315 1 4V20C1 21.6569 2.34315 23 4 23H20C21.6569 23 23 21.6569 23 20V4ZM21 4C21 3.44772 20.5523 3 20 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V4Z" fill="#0F0F0F"></path> <path d="M4.80665 17.5211L9.1221 9.60947C9.50112 8.91461 10.4989 8.91461 10.8779 9.60947L14.0465 15.4186L15.1318 13.5194C15.5157 12.8476 16.4843 12.8476 16.8682 13.5194L19.1451 17.5039C19.526 18.1705 19.0446 19 18.2768 19H5.68454C4.92548 19 4.44317 18.1875 4.80665 17.5211Z" fill="#0F0F0F"></path> <path d="M18 8C18 9.10457 17.1046 10 16 10C14.8954 10 14 9.10457 14 8C14 6.89543 14.8954 6 16 6C17.1046 6 18 6.89543 18 8Z" fill="#0F0F0F"></path> </g></svg>
`;

icons["full-screen"] =
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 9.99739C6.01447 8.29083 6.10921 7.35004 6.72963 6.72963C7.35004 6.10921 8.29083 6.01447 9.99739 6" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> <path d="M6 14.0007C6.01447 15.7072 6.10921 16.648 6.72963 17.2684C7.35004 17.8888 8.29083 17.9836 9.99739 17.998" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> <path d="M17.9976 9.99739C17.9831 8.29083 17.8883 7.35004 17.2679 6.72963C16.6475 6.10921 15.7067 6.01447 14.0002 6" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> <path d="M17.9976 14.0007C17.9831 15.7072 17.8883 16.648 17.2679 17.2684C16.6475 17.8888 15.7067 17.9836 14.0002 17.998" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>`;

interface ReactQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ReactQuillEditorClient({
  value,
  onChange,
}: ReactQuillEditorProps) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const editorRef = useRef<any>(null);

  const formats = useMemo(() => {
    return [
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "indent",
      "link",
      "blockquote",
      "figure",
      "header",
      "full-screen",
    ];
  }, []);

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "blockquote", "strike"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "figure", "full-screen"],
          ["clean"],
        ],
        handlers: {
          figure: function () {
            setImagePickerOpen(true);
          },
          "full-screen": function () {
            const elem = document.querySelector(
              ".react-quill-editor-container",
            );
            if (elem && !document.fullscreenElement) {
              (elem as HTMLElement).requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          },
        },
      },
      clipboard: {
        matchVisual: true,
      },
    };
  }, []);

  const handleImageSelect = (url: string) => {
    const editor = editorRef.current;
    if (editor) {
      const quillEditor = editor.getEditor();
      const range = quillEditor.getSelection(true);
      if (range) {
        const caption = prompt("Enter a caption for the image");
        quillEditor.insertEmbed(range.index, "figure", {
          src: url,
          alt: caption,
          caption,
        });
        quillEditor.setSelection(range.index + 1, 0);
      }
      setImagePickerOpen(false);
    }
  };

  return (
    <div className="react-quill-editor-container h-[80%]">
      <ReactQuill
        {...({ ref: editorRef } as any)}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder="Write something awesome..."
        formats={formats}
        modules={modules}
        style={{
          height: "100%",
          backgroundColor: "white",
        }}
      />

      <ImagePickerModal
        open={imagePickerOpen}
        onOpenChange={() => setImagePickerOpen(false)}
        onImageSelect={handleImageSelect}
        imageInfo={{
          resourceName: "blog",
          resourceId: 1,
        }}
      />
    </div>
  );
}
