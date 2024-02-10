import { formatDate } from "../util";

export class Post {
  commentBy: string;
  commentContent: string;
  commentCreatedAt: string;
  pageEmoji: string;
  pageId: string;
  pageTitle: string;
  pageUrl: string;

  constructor(
    commentBy: string,
    commentContent: string,
    commentCreatedAt: string,
    pageEmoji: string,
    pageId: string,
    pageTitle: string,
    pageUrl: string
  ) {
    this.commentBy = commentBy;
    this.commentContent = commentContent;
    this.commentCreatedAt = commentCreatedAt;
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
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `${formatDate(this.commentCreatedAt)} -`,
                  link: null,
                },
              },
              {
                type: "text",
                text: {
                  content: this.pageEmoji,
                  link: { url: this.pageUrl },
                },
              },
              {
                type: "text",
                text: {
                  content: `${this.pageTitle} -`,
                  link: { url: this.pageUrl },
                },
                href: null,
              },
              {
                type: "text",
                text: {
                  content: this.commentContent,
                  link: null,
                },
              },
              {
                type: "mention",
                mention: {
                  type: "user",
                  user: {
                    id: this.commentBy,
                  },
                },
              },
            ],
          },
        },
      ],
    };
  }
}
