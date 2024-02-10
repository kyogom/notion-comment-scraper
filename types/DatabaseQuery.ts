interface Sort {
  property: string; // The name of the property to sort against.
  direction: "ascending" | "descending";
}

export interface ParamsDatabaseQuery {
  database_id: string;
  sorts?: Sort[]; // 組み込みのプロパティではソートできない
  start_cursor?: string | null;
  page_size?: number; // max 100
  filter?: object; // https://developers.notion.com/reference/post-database-query-filter#the-filter-object
}

export interface ResponseDatabaseQueryResult {
  object: string;
  id: string;
  created_time: string;
  url: string;
  parent: { type: string; database_id: string };
  properties: any;
  icon: { type: string; emoji: string } | null;
}

export interface ResponseDatabaseQuery {
  object: "list";
  results: ResponseDatabaseQueryResult[];
  has_more: boolean;
  next_cursor: string | null;
}
