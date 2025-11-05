export function pascalToKebab(value: string): string {
  return value
    .trim()
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export function isSelector(candidate: unknown): candidate is string {
  return typeof candidate === 'string' && candidate.trim().length > 0;
}

export function isEmpty(value: unknown): boolean {
  return value == null;
}

export type SelectorCollection<T> = string | NodeListOf<Element> | T[];

export function ensureAllElements<T extends HTMLElement>(
  selectorElement: SelectorCollection<T>,
  context: HTMLElement | Document = document,
): T[] {
  if (isSelector(selectorElement)) {
    return Array.from(context.querySelectorAll(selectorElement)) as T[];
  }

  if (selectorElement instanceof NodeList) {
    return Array.from(selectorElement) as T[];
  }

  if (Array.isArray(selectorElement)) {
    return selectorElement;
  }

  throw new Error('Unsupported selector element');
}

export type SelectorElement<T> = T | string;

export function ensureElement<T extends HTMLElement>(
  selectorElement: SelectorElement<T>,
  context?: HTMLElement | Document,
): T {
  if (isSelector(selectorElement)) {
    const elements = ensureAllElements<T>(selectorElement, context ?? document);

    if (elements.length > 1) {
      console.warn(`Selector "${selectorElement}" matched more than one element.`);
    }

    const target = elements.at(-1);

    if (!target) {
      throw new Error(`Selector "${selectorElement}" did not return any elements.`);
    }

    return target;
  }

  if (selectorElement instanceof HTMLElement) {
    return selectorElement as T;
  }

  throw new Error('Unsupported selector element provided to ensureElement');
}

export function cloneTemplate<T extends HTMLElement>(query: string | HTMLTemplateElement): T {
  const template = ensureElement<HTMLTemplateElement>(query);

  const firstChild = template.content.firstElementChild;

  if (!firstChild) {
    throw new Error(`Template "${query}" is empty and cannot be cloned.`);
  }

  return firstChild.cloneNode(true) as T;
}

export function bem(
  block: string,
  element?: string,
  modifier?: string,
): { name: string; class: string } {
  const parts = [block];

  if (element) {
    parts.push(`__${element}`);
  }

  if (modifier) {
    parts.push(`_${modifier}`);
  }

  const name = parts.join('');

  return {
    name,
    class: `.${name}`,
  };
}

export function getObjectProperties(
  obj: object,
  filter?: (name: string, prop: PropertyDescriptor) => boolean,
): string[] {
  const prototype = Object.getPrototypeOf(obj);

  if (!prototype) {
    return [];
  }

  const descriptors = Object.getOwnPropertyDescriptors(prototype);

  return Object.entries(descriptors)
    .filter(([name, descriptor]) => {
      if (filter) {
        return filter(name, descriptor);
      }
      return name !== 'constructor';
    })
    .map(([name]) => name);
}

/** Writes data-* attributes based on the provided record. */
export function setElementData<T extends Record<string, unknown> | object>(
  element: HTMLElement,
  data: T,
): void {
  for (const [key, rawValue] of Object.entries(data)) {
    element.dataset[key] = String(rawValue);
  }
}

/** Reads data-* attributes and normalises them with the supplied parsers. */
export function getElementData<T extends Record<string, unknown>>(
  element: HTMLElement,
  scheme: Record<string, Function>,
): T {
  const result: Partial<T> = {};

  for (const key of Object.keys(scheme)) {
    const parser = scheme[key];
    if (typeof parser !== 'function') {
      continue;
    }
    result[key as keyof T] = parser(element.dataset[key]);
  }

  return result as T;
}

export function isPlainObject(obj: unknown): obj is object {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(obj);

  return prototype === null || prototype === Object.prototype;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Minimal DOM factory that creates a node, applies props, and appends children.
 */
export function createElement<T extends HTMLElement>(
  tagName: keyof HTMLElementTagNameMap,
  props?: Partial<Record<keyof T, string | boolean | object>>,
  children?: HTMLElement | HTMLElement[],
): T {
  const element = document.createElement(tagName) as T;

  if (props) {
    for (const key in props) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        continue;
      }

      const value = props[key];

      if (value === undefined) {
        continue;
      }

      if (key === 'dataset' && isPlainObject(value)) {
        setElementData(element, value);
        continue;
      }

      // @ts-expect-error dynamic assignment for HTMLElement properties
      element[key] = isBoolean(value) ? value : String(value);
    }
  }

  if (children) {
    const nodes = Array.isArray(children) ? children : [children];
    for (const child of nodes) {
      element.append(child);
    }
  }

  return element;
}
