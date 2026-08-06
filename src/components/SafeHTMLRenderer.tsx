import DOMPurify from 'dompurify';
import { useMemo } from 'react';

const SECURE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'small',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'div', 'span',"figure","figcaption"
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
    'width', 'height', 'colspan', 'rowspan'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: [
    'script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 
    'button', 'iframe', 'frame', 'frameset', 'applet', 'base', 'link', 
    'meta', 'style', 'title', 'svg', 'math'
  ],
  FORBID_ATTR: [
    'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onabort',
    'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmouseup',
    'onmousemove', 'onmouseout', 'style', 'background', 'expression',
    'behavior', 'binding', 'vbscript', 'javascript', 'mocha', 'livescript'
  ],
  KEEP_CONTENT: true,
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_NAMED_PROPS: true,
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: null,
    attributeNameCheck: null,
    allowCustomizedBuiltInElements: false
  }
};

export const sanitizeHTML = (html: string, config = SECURE_CONFIG) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    const cleanHTML = DOMPurify.sanitize(html, config);

    if (
      /<script/i.test(cleanHTML) ||
      /javascript:/i.test(cleanHTML) ||
      /&#x\s*73\s*cript/i.test(cleanHTML) ||
      /data:text\/html/i.test(cleanHTML)
    ) {
      return '';
    }

    return cleanHTML;
  } catch {
    return '';
  }
};

export const SafeHTMLRenderer = ({ content, className = "quill-content" }: { content: string, className?: string }) => {
  const sanitizedContent = useMemo(() => sanitizeHTML(content), [content]);

  return (
    <article
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
