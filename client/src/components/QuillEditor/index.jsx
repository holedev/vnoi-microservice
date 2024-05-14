// import { useQuill } from 'react-quilljs';
// import BlotFormatter from 'quill-blot-formatter/dist/BlotFormatter';
// import 'react-quill/dist/quill.snow.css';
// import { useEffect } from 'react';

// function QuillEditor({ value, setValue }) {
//   const { quill, quillRef, Quill } = useQuill({
//     modules: { blotFormatter: {} },
//   });

//   if (Quill && !quill) {
//     Quill.register('modules/blotFormatter', BlotFormatter);
//   }

//   useEffect(() => {
//     if (quill) {
//       if (value) {
//         quill.clipboard.dangerouslyPasteHTML(value);
//       }

//       quill.on('text-change', (delta, oldContents, source) => {
//         setValue(quillRef.current.firstChild.innerHTML);
//       });
//     }
//   }, [quill, Quill]);

//   return <div ref={quillRef} />;
// }

// export default QuillEditor;

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function QuillEditor({ value, setValue }) {
  return <ReactQuill theme="snow" value={value} onChange={setValue} />;
}

export default QuillEditor;
