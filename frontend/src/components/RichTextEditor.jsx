// src/components/RichTextEditor.jsx

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from 'lucide-react';

function sanitize(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const ALLOWED_TAGS = new Set([
    'B', 'STRONG', 'I', 'EM', 'U', 'P', 'BR', 'DIV', 'UL', 'OL', 'LI',
    'SPAN', 'A', 'H1', 'H2', 'H3', 'H4',
  ]);
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 1) {
        if (!ALLOWED_TAGS.has(child.tagName)) {
          const text = document.createTextNode(child.textContent || '');
          child.replaceWith(text);
        } else {
          [...child.attributes].forEach((attr) => {
            const name = attr.name.toLowerCase();
            if (child.tagName === 'A' && name === 'href') return;
            if (name === 'style' && child.tagName === 'SPAN') return;
            child.removeAttribute(attr.name);
          });
          if (child.tagName === 'A') {
            child.setAttribute('rel', 'noopener noreferrer');
            child.setAttribute('target', '_blank');
          }
          walk(child);
        }
      } else if (child.nodeType !== 3) {
        child.remove();
      }
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

function ToolbarButton({ active, onMouseDown, title, children }) {
  return (
    <span
      role="button"
      tabIndex={-1}
      aria-label={title}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onMouseDown?.(e);
      }}
      className={`inline-flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded-md text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-brand-600 active:scale-95 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-brand-400 ${
        active ? 'bg-slate-100 text-brand-600 dark:bg-ink-700 dark:text-brand-400' : ''
      }`}
    >
      {children}
    </span>
  );
}

const RichTextEditor = forwardRef(function RichTextEditor(
  { initialValue = '', onChange, placeholder = 'Write a description...', className = '' },
  ref,
) {
  const editorRef = useRef(null);
  const changeTimer = useRef(null);
  const mounted = useRef(false);

 
  useEffect(() => {
    if (editorRef.current && !mounted.current) {
      editorRef.current.innerHTML = initialValue || '';
      mounted.current = true;
    }
  }, [initialValue]);

  const emitChange = () => {
    if (!editorRef.current) return;
    if (changeTimer.current) clearTimeout(changeTimer.current);
    changeTimer.current = setTimeout(() => {
      const html = sanitize(editorRef.current.innerHTML);
      onChange?.(html);
    }, 150);
  };

  const exec = (command, valueArg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, valueArg);
    emitChange();
  };

  useImperativeHandle(ref, () => ({
    getHtml: () => sanitize(editorRef.current?.innerHTML || ''),
    setHtml: (html) => {
      if (editorRef.current) editorRef.current.innerHTML = html || '';
    },
    focus: () => editorRef.current?.focus(),
  }));

  return (
    <div
      onClick={(e) => {
        
        e.stopPropagation();
      }}
      className={`relative rounded-md border border-slate-300 bg-white transition-colors duration-150 ease-out focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 dark:border-ink-600 dark:bg-ink-800 ${className}`}
    >
      {/* Toolbar */}
      <div
        
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-ink-700 dark:bg-ink-900/40"
      >
        <ToolbarButton title="Bold (Ctrl+B)" onMouseDown={() => exec('bold')}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" onMouseDown={() => exec('italic')}>
          <Italic size={15} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-ink-700" />

        <ToolbarButton title="Bulleted list" onMouseDown={() => exec('insertUnorderedList')}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onMouseDown={() => exec('insertOrderedList')}>
          <ListOrdered size={15} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-ink-700" />

        <ToolbarButton title="Undo (Ctrl+Z)" onMouseDown={() => exec('undo')}>
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton title="Redo (Ctrl+Y)" onMouseDown={() => exec('redo')}>
          <Redo2 size={15} />
        </ToolbarButton>
      </div>

      {/* Editor surface */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onMouseDown={(e) => e.stopPropagation()}
        spellCheck
        data-placeholder={placeholder}
        className="min-h-40 max-h-70 overflow-y-auto px-3 py-2 text-sm leading-[1.6] text-slate-900 outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] dark:text-slate-100 dark:empty:before:text-slate-500 [&_a]:text-brand-600 [&_a]:underline [&_b]:font-semibold [&_i]:italic [&_strong]:font-semibold [&_em]:italic [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal [&_li]:my-0.5"
      />
    </div>
  );
});

export default RichTextEditor;
