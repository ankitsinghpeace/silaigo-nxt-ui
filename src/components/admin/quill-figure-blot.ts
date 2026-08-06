import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

class FigureBlot extends BlockEmbed {
  static blotName = 'figure';
  static tagName = 'figure';

  static create(value) {
    const node = super.create();
    node.setAttribute('contenteditable', 'false');
    const img = document.createElement('img');
    img.setAttribute('src', value.src);
    img.setAttribute('alt', value.alt || '');
    
    const figcaption = document.createElement('figcaption');
    figcaption.innerText = value.caption || '';

    node.appendChild(img);
    node.appendChild(figcaption);

    return node;
  }

  static value(node) {
    const img = node.querySelector('img');
    const caption = node.querySelector('figcaption');
    return {
      src: img?.getAttribute('src') || '',
      alt: img?.getAttribute('alt') || '',
      caption: caption?.innerText || ''
    };
  }
}

Quill.register(FigureBlot);
