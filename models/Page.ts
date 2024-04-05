import { NotionClient } from "../client";
import { Comments } from "./Comments";
import {
  ResponseDatabaseQuery,
  ResponseDatabaseQueryResult,
} from "./DatabaseQuery";

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

  async fetchComments() {
    let i = 0;
    for await (const page of this.pages) {
      console.log(`fetching comments ... ${++i}/${this.pages.length}`);
      if (page.isSubItem) continue;
      page.comments = await Page.fetchComments(page.id);

      for await (const subPage of page.subPages) {
        subPage.comments = await Page.fetchComments(subPage.id);
      }
    }
  }

  async appendBlocks(NOTION_COMMENT_SUMMARY_PAGE_ID: string) {
    let i = 0;
    for await (const page of this.pages) {
      console.log(`writing comments ... ${++i}/${this.pages.length}`);
      if (page.isSubItem || page.comments.comments.length === 0) {
        continue;
      }
      await page.appendHeading(NOTION_COMMENT_SUMMARY_PAGE_ID);

      await page.comments.appendComments(NOTION_COMMENT_SUMMARY_PAGE_ID);
      for await (const subPage of page.subPages) {
        await subPage.comments.appendComments(NOTION_COMMENT_SUMMARY_PAGE_ID);
      }
    }
  }
}

export class Page {
  comments: Comments;
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
    this.comments = new Comments([]);
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

  static async fetchComments(pageId: string): Promise<Comments> {
    const client = new NotionClient();
    const responseCommentList = await client.listComments(pageId);

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
      result.properties[process.env.NOTION_DATABASE_PROPERTY_NAME_COLUMN!]
        ?.title[0]?.text?.content ?? "",
      result.url,
      result.parent.database_id,
      result.properties[
        process.env.NOTION_DATABASE_SUB_ITEM_COLUMN!
      ]?.relation.map((r: any) => r.id) ?? []
    );
  }

  async appendHeading(NOTION_COMMENT_SUMMARY_PAGE_ID: string) {
    const client = new NotionClient();
    await client.appendBlocks({
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
                  content: `${this.emoji === "" ? "" : `${this.emoji} `}${
                    this.title
                  }`,
                  link: { url: this.url },
                },
              },
            ],
          },
        },
      ],
    });
  }
}
