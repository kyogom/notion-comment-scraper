# 概要
Notion のタスク管理において、コメント機能を有効活用したいので、カンバンにあるコメントを一箇所に集めるスクリプトを書いた

https://youtu.be/Pk4S8smM2yc

# いまいちなところ
- APIのレート制限が厳しく、特に書き込みは時間を空けないと409が返ってくるため、パフォーマンスが悪い
- N + 1
- タスクを100件までしか取ってないので、100件以上のタスクがあるカンバンの場合は、コードをいじって絞り込むかページング処理を追加するしかない
- セットアップがめっちゃ大変↓なので、notionページからインライン実行できるようにしたい

# 使い方

1. notionの開発者サイトからAPI_KEYを発行して、.env.NOTION_TOKENにセットします。権限を多めにつけといてください  
2. カンバン(=データベース)のIDをURLから特定し、env.NOTION_DATABASE_ID にセットします 
3. コメントを貼り付けたいページのIDをURLから特定し、env.NOTION_COMMENT_SUMMARY_PAGE_ID にセットします 
4. カンバンのプロパティを見て、名前とサブサイテムを示すラベルを、それぞれ env.NOTION_DATABASE_PROPERTY_NAME_COLUMN, env.NOTION_DATABASE_SUB_ITEM_COLUMNにセットします。  
![image](https://github.com/kyogom/notion-comment-scraper/assets/23183700/9bcca4b1-7af2-4d05-bc58-1a6891dee791)
↑この場合なら、"名前"と"サブアイテム"

5. [インテグレーションにページの閲覧と書き込みの権限を付与します。 ](https://developers.notion.com/docs/create-a-notion-integration#give-your-integration-page-permissions)

6. スクリプトを実行します
