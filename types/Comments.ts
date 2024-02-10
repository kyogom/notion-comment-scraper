import {
  ResponseCommentList,
  ResponseCommentListResult,
} from "./ResponseCommentList";

export class Comments {
  comments: Comment[];
  constructor(comments: Comment[]) {
    this.comments = comments;
  }
  static fromResponseCommentList(response: ResponseCommentList): Comment[] {
    return response.results.map((result) => {
      return Comment.fromResponseCommentListResult(result);
    });
  }
}

export class Comment {
  created_time: string;
  id: string;
  pageId: string;

  constructor(created_time: string, id: string, pageId: string) {
    this.created_time = created_time;
    this.id = id;
    this.pageId = pageId;
  }

  static fromResponseCommentListResult(
    result: ResponseCommentListResult
  ): Comment {
    return new Comment(result.created_time, result.id, result.parent.page_id);
  }

  async appendComment(client: any, pageId: string) {
    await client.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: "block",
          type: "link_to_page",
          link_to_page: {
            type: "comment_id",
            comment_id: this.id,
          },
        },
      ],
    });
  }
}
