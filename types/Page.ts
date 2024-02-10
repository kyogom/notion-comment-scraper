import { NOTION_API_LIMIT_PER_SEC, WRITING_WAIT } from "..";
import { sleep } from "../util";
import { Comments, Comment } from "./Comments";
import {
  ResponseDatabaseQuery,
  ResponseDatabaseQueryResult,
} from "./DatabaseQuery";
import { ResponseCommentList } from "./ResponseCommentList";

export class Pages {
  pages: Page[];
  constructor(pages: Page[]) {
    this.pages = pages.map((p) => {
      return new Page(
        p.created_time,
        p.emoji,
        p.id,
        p.title,
        p.url,
        p.parentPageId,
        p.subItemIds,
        pages.some((p2) => p2.subItemIds.includes(p.id)),
        pages.filter((p2) => p.subItemIds.includes(p2.id))
      );
    });
  }
  static fromResponseDatabaseQuery(response: ResponseDatabaseQuery): Page[] {
    return response.results.map((result) => {
      return Page.fromDatabaseQueryResult(result);
    });
  }
  sortPagesByCreatedAt(): void {
    this.pages = this.pages.sort((a, b) => {
      return a.created_time < b.created_time ? -1 : 1;
    });
  }
  async appendBlocks(client: any, NOTION_COMMENT_SUMMARY_PAGE_ID: string) {
    let pageCountCompleted = 0;
    for (const page of this.pages) {
      if (page.isSubItem || page.comments.length === 0) {
        continue;
      }
      await client.blocks.children.append({
        block_id: NOTION_COMMENT_SUMMARY_PAGE_ID,
        children: [
          {
            object: "block",
            type: "heading_3",
            heading_3: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: `${page.emoji === "" ? "" : `${page.emoji} `}${
                      page.title
                    }`,
                    link: { url: page.url },
                  },
                },
              ],
            },
          },
        ],
      });
      await sleep(1000 / NOTION_API_LIMIT_PER_SEC + WRITING_WAIT);
      for (const comment of page.comments) {
        console.log(
          "writing comments ...",
          `${++pageCountCompleted} / ${this.pages.length}`
        );
        await comment.appendComment(client, NOTION_COMMENT_SUMMARY_PAGE_ID);
        await sleep(1000 / NOTION_API_LIMIT_PER_SEC + WRITING_WAIT);
      }
      for (const subPage of page.subPages) {
        for (const comment of subPage.comments) {
          console.log(
            "writing comments ...",
            `${++pageCountCompleted} / ${this.pages.length}`
          );
          await comment.appendComment(client, NOTION_COMMENT_SUMMARY_PAGE_ID);
          await sleep(1000 / NOTION_API_LIMIT_PER_SEC + WRITING_WAIT);
        }
      }
    }
  }
}

export class Page {
  comments: Comment[];
  created_time: string;
  emoji: string;
  id: string;
  title: string;
  url: string;
  parentPageId: string;
  subItemIds: string[];
  isSubItem: boolean;
  subPages: Page[];

  constructor(
    created_time: string,
    emoji: string,
    id: string,
    title: string,
    url: string,
    parentPageId: string,
    subItemIds: string[],
    isSubItem = false,
    subPages: Page[] = []
  ) {
    this.comments = [];
    this.created_time = created_time;
    this.emoji = emoji;
    this.id = id;
    this.title = title;
    this.url = url;
    this.parentPageId = parentPageId;
    this.subItemIds = subItemIds;
    this.isSubItem = isSubItem;
    this.subPages = subPages;
  }

  static async fetchComments(client: any, pageId: string): Promise<Comment[]> {
    const responseCommentList = (await client.comments.list({
      block_id: pageId,
    })) as ResponseCommentList;
    await sleep(1000 / NOTION_API_LIMIT_PER_SEC);
    if (responseCommentList.has_more) {
      throw new Error("This script does not support paginated responses");
    }
    return Comments.fromResponseCommentList(responseCommentList);
  }

  static fromDatabaseQueryResult(result: ResponseDatabaseQueryResult): Page {
    return new Page(
      result.created_time,
      result.icon?.emoji ?? "",
      result.id,
      // @ts-ignore-next-line
      result.properties[process.env.NOTION_DATABASE_PROPERTY_NAME_COLUMN!]
        ?.title[0]?.text?.content ?? "",
      result.url,
      result.parent.database_id,
      result.properties[
        process.env.NOTION_DATABASE_SUB_ITEM_COLUMN!
      ]?.relation.map((r: any) => r.id) ?? []
    );
  }

  sortCommentsByCreatedAt(): void {
    this.comments = this.comments.sort((a, b) => {
      return a.created_time < b.created_time ? -1 : 1;
    });
  }
}
