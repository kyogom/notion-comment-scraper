require("dotenv").config();
const { Client } = require("@notionhq/client");
import { Post } from "./types/Post";
import { QueryDatabase } from "./types/QueryDatabase";
import { ResponseComment } from "./types/ResponseComment";
import { ResponseDatabaseQuery } from "./types/ResponseDatabaseQuery";
import { sleep } from "./util";

const NOTION_API_LIMIT_PER_SEC = 3;
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function scrapeComments(): Promise<Post[]> {
  const query: QueryDatabase = {
    database_id: process.env.NOTION_DATABASE_ID!,
    // filter: {
    //   property: "Status",
    //   select: {
    //     equals: "new",
    //   },
    // },
  };
  let response = (await notion.databases.query(query)) as ResponseDatabaseQuery;

  if (response.has_more) {
    console.log(response.has_more);
  }

  const posts: Post[] = [];
  let i = 0;
  for (const page of response.results) {
    console.log(`fetching comments ... ${i++} / ${response.results.length}`);
    const commentResponse = (await notion.comments.list({
      block_id: page.id,
    })) as ResponseComment;
    if (commentResponse.has_more) {
      throw new Error("This script does not support paginated responses");
    }
    posts.push(
      ...commentResponse.results.map((comment) => {
        return new Post(
          comment.created_by.id,
          comment.rich_text[0].text.content,
          comment.created_time,
          page.icon?.emoji ?? "",
          process.env.NOTION_COMMENT_SUMMARY_PAGE_ID!,
          page.properties[
            process.env.NOTION_DATABASE_PROPERTY_NAME_COLUMN!
          ]?.title![0]?.plain_text,
          page.url
        );
      })
    );
    await sleep(1000 / NOTION_API_LIMIT_PER_SEC);
  }
  return posts;
}

async function writePosts(posts: Post[]) {
  for (const post of posts) {
    await notion.blocks.children.append({
      block_id: post.pageId,
      ...post.convertToNotionBlock(),
    });
    await sleep(1000 / NOTION_API_LIMIT_PER_SEC);
  }
}

async function main() {
  if (
    !process.env.NOTION_TOKEN ||
    !process.env.NOTION_DATABASE_ID ||
    !process.env.NOTION_COMMENT_SUMMARY_PAGE_ID
  ) {
    throw new Error("You need to set .env");
  }
  const posts = await scrapeComments();
  await writePosts(posts);
}
main();
