export interface FieldSelector {
  selector: string;
  attribute?: string;
}

export interface ScraperSchema {
  name: string;
  baseUrl: string;
  items: {
    selector: string;
    fields: Record<string, string | FieldSelector>;
  };
}

export interface SchemaListItem {
  name: string;
  baseUrl: string;
}
