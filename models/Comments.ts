import { NOTION_API_LIMIT_PER_SEC, WRITING_WAIT_MS } from "..";
import { NotionClient } from "../client";
import { sleep } from "../util";
import {
  ResponseCommentList,
  ResponseCommentListResult,
} from "./ResponseCommentList";

export class Comments {
  async appendComments(pageId: string) {
    for await (const comment of this.comments) {
      sleep(1000 / NOTION_API_LIMIT_PER_SEC);
      await comment.appendComment(pageId);
    }
  }
  comments: Comment[];
  constructor(comments: Comment[]) {
    this.comments = comments;
  }
  static fromResponseCommentList(response: ResponseCommentList): Comments {
    return new Comments(
      response.results.map((result) => {
        return Comment.fromResponseCommentListResult(result);
      })
    );
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

  async appendComment(pageId: string) {
    const client = new NotionClient();
    await client.appendBlocks({
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
