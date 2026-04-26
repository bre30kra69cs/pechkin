import { parseHtml, selectElements, getText, getAttribute } from './parser';
import type { ScraperSchema } from '../types/schema';

export interface ExtractedItem {
  [key: string]: unknown;
}

type CheerioElement = ReturnType<ReturnType<ReturnType<typeof parseHtml>['root']>['first']>;

export function extractItems(
  html: string,
  schema: ScraperSchema
): { items: ExtractedItem[]; errors: string[] } {
  const $ = parseHtml(html);
  const items: ExtractedItem[] = [];
  const errors: string[] = [];

  const itemElements = selectElements($, schema.items.selector);

  if (itemElements.length === 0) {
    errors.push(`No elements found for selector: ${schema.items.selector}`);
    return { items, errors };
  }

  itemElements.each((index: number, element: unknown) => {
    const item: ExtractedItem = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const $element = $(element as any);

    for (const [fieldName, fieldConfig] of Object.entries(schema.items.fields)) {
      try {
        const selector = typeof fieldConfig === 'string' ? fieldConfig : fieldConfig.selector;
        const attribute = typeof fieldConfig === 'string' ? undefined : fieldConfig.attribute;

        const fieldElement = $element.find(selector).first();

        if (fieldElement.length === 0) {
          item[fieldName] = null;
          continue;
        }

        if (attribute) {
          item[fieldName] = getAttribute(fieldElement, attribute) ?? null;
        } else {
          item[fieldName] = getText(fieldElement);
        }
      } catch {
        item[fieldName] = null;
      }
    }

    items.push(item);
  });

  return { items, errors };
}
