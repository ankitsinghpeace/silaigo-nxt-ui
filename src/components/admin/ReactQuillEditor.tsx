"use client";

import dynamic from "next/dynamic";

const ReactQuillEditorClient = dynamic(
  () => import("./ReactQuillEditorClient"),
  { ssr: false },
);

interface ReactQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ReactQuillEditor({
  value,
  onChange,
}: ReactQuillEditorProps) {
  return <ReactQuillEditorClient value={value} onChange={onChange} />;
}
