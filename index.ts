require("dotenv").config();
const { Client } = require("@notionhq/client");
import {
  ParamsDatabaseQuery,
  ResponseDatabaseQuery,
} from "./types/DatabaseQuery";
import { sleep } from "./util";
import { Page, Pages } from "./types/Page";

export const NOTION_API_LIMIT_PER_SEC = 3;
export const WRITING_WAIT = 1000; // 書き込み処理を連続で行うとNotionが処理できずにエラーが出るようなので、少し待つ
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function getPagesIncludingComments(): Promise<Pages> {
  const query: ParamsDatabaseQuery = {
    database_id: process.env.NOTION_DATABASE_ID!,
  };
  let response = (await notion.databases.query(query)) as ResponseDatabaseQuery;

  if (response.has_more) {
    throw new Error("This script does not support paginated responses");
  }

  const pages = new Pages(Pages.fromResponseDatabaseQuery(response));
  let i = 0;
  for (const page of pages.pages) {
    if (page.isSubItem) continue;
    console.log(`fetching comments ... ${++i} / ${pages.pages.length}`);
    page.comments = await Page.fetchComments(notion, page.id);

    for (const subPage of page.subPages) {
      console.log(`fetching comments ... ${++i} / ${pages.pages.length}`);
      subPage.comments = await Page.fetchComments(notion, subPage.id);
    }
  }
  return pages;
}

// async function appendBlocks(pages: Pages) {
//   for (const post of pages) {
//     await notion.blocks.children.append({
//       block_id: post.pageId,
//       ...post.convertToNotionBlock(),
//     });
//     await sleep(1000 / NOTION_API_LIMIT_PER_SEC);
//   }
// }

async function main() {
  if (
    !process.env.NOTION_TOKEN ||
    !process.env.NOTION_DATABASE_ID ||
    !process.env.NOTION_COMMENT_SUMMARY_PAGE_ID
  ) {
    throw new Error("You need to set .env");
  }
  const pages = await getPagesIncludingComments();
  pages.appendBlocks(notion, process.env.NOTION_COMMENT_SUMMARY_PAGE_ID);
}
main();
