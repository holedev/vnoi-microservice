import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function QuillEditor({ value, setValue }) {
  return <ReactQuill theme='snow' value={value} onChange={setValue} />;
}

export default QuillEditor;
