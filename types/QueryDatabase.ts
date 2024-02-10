interface Sort {
  property: string; // The name of the property to sort against.
  direction: "ascending" | "descending";
}

export interface QueryDatabase {
  database_id: string;
  sorts?: Sort[]; // 組み込みのプロパティではソートできない
  start_cursor?: string | null;
  page_size?: number; // max 100
  filter?: object; // https://developers.notion.com/reference/post-database-query-filter#the-filter-object
}
