require('dotenv').config();
const { Client } = require("@notionhq/client")

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function main() {
  // https://developers.notion.com/reference/post-database-query
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
  })
  console.log(response)
}
main()