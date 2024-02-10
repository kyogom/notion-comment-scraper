interface User {
  object: string;
  id: string;
}

interface SelectOption {
  id: string;
  name: string;
  color: string;
}

interface Title {
  type: string;
  text: {
    content: string;
    link: string;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string;
}

interface Property {
  emoji: any;
  id: string;
  type: string;
  multi_select?: any[]; // 本当の型が不明なので適宜変更してください
  rich_text?: any[]; // 本当の型が不明なので適宜変更してください
  select?: SelectOption | null;
  date: string | null; // 本当の型が不明なので適宜変更してください
  title?: Title[];
}

interface Parent {
  type: string;
  database_id: string;
}

interface Icon {
  type: string;
  emoji: string;
}

interface Page {
  object: string;
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: User;
  last_edited_by: User;
  cover: any;
  icon: null | Icon;
  parent: Parent;
  archived: boolean;
  properties: {
    [key: string]: Property;
  };
  url: string;
  public_url: string;
}

export interface ResponseDatabaseQuery {
  object: string;
  results: Page[];
  next_cursor: string | null;
  has_more: boolean;
}
