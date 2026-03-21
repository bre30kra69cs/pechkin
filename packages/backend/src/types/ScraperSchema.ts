import type { FieldSelector } from './FieldSelector.js';

export interface ScraperSchema {
  name: string;
  baseUrl: string;
  items: {
    selector: string;
    fields: Record<string, string | FieldSelector>;
  };
}
