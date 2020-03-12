# Database
## post
`columns: id, title, body, writer, encrypted_password, hit_count, created_at, updated_at, parent_id, sort_key, status`

`indexs: sort_key`

```rb
class CreatePosts < ActiveRecord::Migration[6.0]
  def change
    create_table :posts do |t|
      t.text :title, null: false
      t.text :body, null: false
      t.string :writer, null: false
      t.string :encrypted_password, null: false
      t.integer :hit_count, default: 0
      t.integer :parent_id
      t.string :sort_key, null: false
      t.integer :status, default: 0

      t.timestamps
    end
    add_index :posts, [:sort_key]
  end
end
```

```sql
-- create_table(:posts)
   (20.1ms)  CREATE TABLE "posts" ("id" bigserial primary key, "title" text NOT NULL, "body" text NOT NULL, "writer" character varying NOT NULL, "encrypted_password" character varying NOT NULL, "hit_count" integer DEFAULT 0, "parent_id" integer, "sort_key" character varying NOT NULL, "status" integer DEFAULT 0, "created_at" timestamp(6) NOT NULL, "updated_at" timestamp(6) NOT NULL)
   -> 0.1829s
-- add_index(:posts, [:sort_key])
   (7.4ms)  CREATE  INDEX  "index_posts_on_sort_key" ON "posts"  ("sort_key")
   -> 0.0245s
=> #<PG::Result:0x00007ff53777ce80 status=PGRES_COMMAND_OK ntuples=0 nfields=0 cmd_tuples=0>
```

## port_comment
`columns: id, post_id, body,  writer, encrypted_password, created_at, updated_at, status`

`indexs: post_id`

```rb
class CreatePostComments < ActiveRecord::Migration[6.0]
  def change
    create_table :post_comments do |t|
      t.integer :post_id, null: false
      t.text :body, null: false
      t.string :writer, null: false
      t.string :encrypted_password, null: false
      t.integer :status, default: 0

      t.timestamps
    end
    add_index :post_comments, [:post_id]
  end
end
```

```sql
-- create_table(:post_comments)
   (12.8ms)  CREATE TABLE "post_comments" ("id" bigserial primary key, "post_id" integer NOT NULL, "body" text NOT NULL, "writer" character varying NOT NULL, "encrypted_password" character varying NOT NULL, "status" integer DEFAULT 0, "created_at" timestamp(6) NOT NULL, "updated_at" timestamp(6) NOT NULL)
   -> 0.0189s
-- add_index(:post_comments, [:post_id])
   (11.6ms)  CREATE  INDEX  "index_post_comments_on_post_id" ON "post_comments"  ("post_id")
   -> 0.0314s
=> #<PG::Result:0x00007ff53876e938 status=PGRES_COMMAND_OK ntuples=0 nfields=0 cmd_tuples=0>
```

# 참고
[Node.js에서 exports와 mudule.exports의 차이](http://happinessoncode.com/2018/05/20/nodejs-exports-and-module-exports/)

- module.exports는 개별 함수가 아닌 객체를 통째로 exports 하는 경우에 사용.
- Node.js에서 익스포트되는 객체는 module.exports이다.
- module.exports 빈 오브젝트({})로 초기화되어 있다.
- exports는 module.exports를 참조하는 변수이다.


[テンプレートエンジンEJSで使える便利な構文まとめ](https://qiita.com/y_hokkey/items/31f1daa6cecb5f4ea4c9)

