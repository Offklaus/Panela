// Monta o DOM sem innerHTML: texto do usuário sempre entra como textContent (research.md §14).

const PROPERTIES = new Set(['value', 'checked', 'disabled', 'hidden']);
const SVG_NS = 'http://www.w3.org/2000/svg';

function appendChildren(element, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === null || value === undefined || value === false) continue;

    if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'class') {
      element.className = value;
    } else if (key === 'style') {
      for (const [name, styleValue] of Object.entries(value)) element.style.setProperty(name, styleValue);
    } else if (key === 'dataset') {
      Object.assign(element.dataset, value);
    } else if (PROPERTIES.has(key)) {
      element[key] = value;
    } else {
      element.setAttribute(key, value === true ? '' : String(value));
    }
  }

  appendChildren(element, children);
  return element;
}

export function s(tag, attributes = {}, ...children) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== null && value !== undefined) element.setAttribute(key, String(value));
  }
  appendChildren(element, children);
  return element;
}

export function clear(node) {
  node.replaceChildren();
}
