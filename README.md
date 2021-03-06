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
      t.integer :depth, default: 0

      t.timestamps
    end
    add_index :posts, [:sort_key]
  end
end
```

```sql
-- create_table(:posts)
   (19.2ms)  CREATE TABLE "posts" ("id" bigserial primary key, "title" text NOT NULL, "body" text NOT NULL, "writer" character varying NOT NULL, "encrypted_password" character varying NOT NULL, "hit_count" integer DEFAULT 0, "parent_id" integer, "sort_key" character varying NOT NULL, "status" integer DEFAULT 0, "depth" integer DEFAULT 0, "created_at" timestamp(6) NOT NULL, "updated_at" timestamp(6) NOT NULL)
   -> 0.0637s
-- add_index(:posts, [:sort_key])
   (14.1ms)  CREATE  INDEX  "index_posts_on_sort_key" ON "posts"  ("sort_key")
   -> 0.0547s
```

## port_comment

`columns: id, post_id, body, writer, encrypted_password, created_at, updated_at, status`

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

## post_files

`columns: id, post_id, original_name, path, size`

`indexs: post_id`

```rb
class CreatePostFiles < ActiveRecord::Migration[6.0]
  def change
  drop_table :post_files
    create_table :post_files do |t|
      t.integer :post_id, null: false
      t.string :original_name, null: false
      t.string :file_name, null: false
      t.string :mimetype, null: false
      t.integer :size, default: 0

      t.timestamps
    end
    add_index :post_files, [:post_id]
    add_index :post_files, [:file_name]
  end
end
```

```sql
-- create_table(:post_files)
   (17.9ms)  CREATE TABLE "post_files" ("id" bigserial primary key, "post_id" integer NOT NULL, "original_name" character varying NOT NULL, "file_name" character varying NOT NULL, "mimetype" character varying NOT NULL, "size" integer DEFAULT 0, "created_at" timestamp(6) NOT NULL, "updated_at" timestamp(6) NOT NULL)
   -> 0.0272s
-- add_index(:post_files, [:post_id])
   (10.6ms)  CREATE  INDEX  "index_post_files_on_post_id" ON "post_files"  ("post_id")
   -> 0.0357s
-- add_index(:post_files, [:file_name])
   (14.6ms)  CREATE  INDEX  "index_post_files_on_file_name" ON "post_files"  ("file_name")
   -> 0.0361s
```

# 참고

[Node.js에서 exports와 mudule.exports의 차이](http://happinessoncode.com/2018/05/20/nodejs-exports-and-module-exports/)

- module.exports는 개별 함수가 아닌 객체를 통째로 exports 하는 경우에 사용.
- Node.js에서 익스포트되는 객체는 module.exports이다.
- module.exports 빈 오브젝트({})로 초기화되어 있다.
- exports는 module.exports를 참조하는 변수이다.


[テンプレートエンジン EJS で使える便利な構文まとめ](https://qiita.com/y_hokkey/items/31f1daa6cecb5f4ea4c9)
