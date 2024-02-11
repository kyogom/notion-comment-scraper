require("dotenv").config();
const { Client } = require("@notionhq/client");
import { NotionClient } from "./client";
import { ParamsDatabaseQuery } from "./models/DatabaseQuery";
import { Pages } from "./models/Page";

export const NOTION_API_LIMIT_PER_SEC = 3;
export const WRITING_WAIT_MS = 0; // 書き込みを待たずに連続すると409が返ってくる

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function main() {
  if (
    !process.env.NOTION_TOKEN ||
    !process.env.NOTION_DATABASE_ID ||
    !process.env.NOTION_COMMENT_SUMMARY_PAGE_ID
  ) {
    throw new Error("You need to set .env");
  }
  const query: ParamsDatabaseQuery = {
    database_id: process.env.NOTION_DATABASE_ID!,
  };
  const client = new NotionClient();
  const response = await client.queryDatabase(query);
  if (response.has_more) {
    // TODO: ページングは未実装
    throw new Error(
      "pages > 100. This script does not support pagination yet."
    );
  }
  const pages = new Pages(Pages.fromResponseDatabaseQuery(response));

  await pages.fetchComments();
  await pages.appendBlocks(process.env.NOTION_COMMENT_SUMMARY_PAGE_ID);
}
main();
