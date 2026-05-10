import { Window } from 'happy-dom';

const window = new Window({ url: 'http://localhost' });

// Fix missing constructors that @testing-library/dom expects
(window as unknown as Record<string, unknown>).SyntaxError = SyntaxError;
(window as unknown as Record<string, unknown>).TypeError = TypeError;
(window as unknown as Record<string, unknown>).Error = Error;

global.document = window.document as unknown as Document;
global.window = window as unknown as Window & typeof globalThis;

// Ensure document.body exists for @testing-library/dom screen queries
if (!document.body) {
  const body = document.createElement('body');
  document.appendChild(body);
}

// Expose common DOM globals
global.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
global.Element = window.Element as unknown as typeof Element;
global.Node = window.Node as unknown as typeof Node;
global.DocumentFragment = window.DocumentFragment as unknown as typeof DocumentFragment;
