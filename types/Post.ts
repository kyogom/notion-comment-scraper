export class Posts {
  posts: Post[] | RootPageH3[];
  constructor(posts: Post[]) {
    this.posts = posts;
  }
  // groupByPageId() {
  //
}

// カンバンの一覧で表示されるページ (= 親タスク) を示すh3の文字列
export class RootPageH3 {
  emoji: string;
  id: string;
  title: string;
  url: string;
  constructor(
    emoji: string,
    id: string,
    title: string,
    url: string //
  ) {
    this.emoji = emoji;
    this.id = id;
    this.title = title;
    this.url = url;
  }
  convertToNotionBlock() {
    return {
      object: "block",
      type: "heading_3",
      parent: {
        type: "page_id",
        page_id: this.id,
      },
      heading_3: {
        rich_text: [
          {
            type: "text",
            text: {
              content: `${this.emoji === "" ? "" : `${this.emoji} `}${
                this.title
              }`,
              link: null,
            },
          },
        ],
      },
    };
  }
}
export class Post {
  commentCreatedAt: string;
  commentId: string;
  pageEmoji: string;
  pageId: string;
  pageTitle: string;
  pageUrl: string;

  constructor(
    commentCreatedAt: string,
    commentId: string,
    pageEmoji: string,
    pageId: string,
    pageTitle: string,
    pageUrl: string
  ) {
    this.commentCreatedAt = commentCreatedAt;
    this.commentId = commentId;
    this.pageEmoji = pageEmoji;
    this.pageId = pageId;
    this.pageTitle = pageTitle;
    this.pageUrl = pageUrl;
  }
  convertToNotionBlock() {
    return {
      children: [
        {
          object: "block",
          parent: {
            type: "page_id",
            page_id: this.pageId,
          },
          type: "link_to_page",
          link_to_page: {
            type: "comment_id",
            comment_id: this.commentId,
          },
        },
      ],
    };
  }
}
