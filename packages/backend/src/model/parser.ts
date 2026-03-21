import { load } from 'cheerio';

export type ParsedDocument = ReturnType<typeof load>;

export function parseHtml(html: string): ParsedDocument {
  return load(html);
}

export function selectElements(
  $: ParsedDocument,
  selector: string
): ReturnType<ParsedDocument['root']> {
  return $(selector);
}

export function getText(element: ReturnType<ParsedDocument['root']>): string {
  return element.text().trim();
}

export function getAttribute(
  element: ReturnType<ParsedDocument['root']>,
  attr: string
): string | undefined {
  return element.attr(attr);
}
