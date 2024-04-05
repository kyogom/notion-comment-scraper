import { NOTION_API_LIMIT_PER_SEC } from ".";
import {
  ParamsDatabaseQuery,
  ResponseDatabaseQuery,
} from "./models/DatabaseQuery";
import { ResponseCommentList } from "./models/ResponseCommentList";
import { sleep } from "./util";

const { Client } = require("@notionhq/client");

export class NotionClient {
  private static instance: NotionClient;
  private client: any;
  private lastRequestTime: Date = new Date();

  constructor() {
    if (!NotionClient.instance) {
      const notion = new Client({
        auth: process.env.NOTION_TOKEN,
      });
      this.client = notion;
      NotionClient.instance = this;
    }

    return NotionClient.instance;
  }

  private async waitForRateLimit(): Promise<void> {
    const currentTime = new Date();
    const elapsedTime = currentTime.getTime() - this.lastRequestTime.getTime();
    const timeToWait = Math.max(0, NOTION_API_LIMIT_PER_SEC - elapsedTime);
    await sleep(timeToWait);
    this.lastRequestTime = new Date();
  }

  async queryDatabase(
    query: ParamsDatabaseQuery
  ): Promise<ResponseDatabaseQuery> {
    await this.waitForRateLimit();
    const result = await this.client.databases.query(query);
    return result;
  }

  async listComments(pageId: string): Promise<ResponseCommentList> {
    await this.waitForRateLimit();
    const responseCommentList = await this.client.comments.list({
      block_id: pageId,
    });
    return responseCommentList;
  }

  async appendBlocks(params: any) {
    await this.waitForRateLimit();
    await this.client.blocks.children.append(params);
  }
}
