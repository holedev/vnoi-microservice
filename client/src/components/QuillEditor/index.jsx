import { useMemo } from 'react';
import { useQuill } from 'react-quilljs';
import BlotFormatter from 'quill-blot-formatter';
import 'react-quill/dist/quill.snow.css';
import { useEffect } from 'react';

function QuillEditor() {
  const { quill, quillRef, Quill } = useQuill({
    modules: { blotFormatter: {} },
  });

  if (Quill && !quill) {
    Quill.register('modules/blotFormatter', BlotFormatter);
  }

  useEffect(() => {
    if (quill) {
      quill.on('text-change', (delta, oldContents, source) => {
        console.log(quillRef.current.firstChild.innerHTML);
      });
    }
  }, [quill, Quill]);

  return <div ref={quillRef} />;
}

export default QuillEditor;
