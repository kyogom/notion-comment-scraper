interface RichText {
  type: string;
  text: {
    content: string;
    link?: {
      url: string;
    };
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
}
export interface ResponseCommentListResult {
  object: string;
  id: string;
  parent: {
    type: string;
    page_id: string;
  };
  discussion_id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: string;
    id: string;
  };
  rich_text: RichText[];
}

export interface ResponseCommentList {
  object: string;
  results: ResponseCommentListResult[];
  next_cursor: string | null;
  has_more: boolean;
}
