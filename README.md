# Database
## post
`columns: id, title, body, writer, encrypted_password, hit_count, created_at, updated_at, parent_id, sort_key`

`indexs: sort_key`
```
-- create_table(:posts)
   (17.9ms)  CREATE TABLE "posts" ("id" bigserial primary key, "title" text NOT NULL, "body" text NOT NULL, "writer" character varying NOT NULL, "encrypted_password" character varying NOT NULL, "hit_count" integer DEFAULT 0, "parent_id" integer, "sort_key" character varying NOT NULL, "created_at" timestamp(6) NOT NULL, "updated_at" timestamp(6) NOT NULL)
   -> 0.0365s
-- add_index(:posts, [:sort_key])
   (11.1ms)  CREATE  INDEX  "index_posts_on_sort_key" ON "posts"  ("sort_key")
   -> 0.0271s
```

## port_comment
`columns: id, post_id, body,  writer, encrypted_password, created_at, updated_at`

`indexs: post_id`
```
-- create_table(:post_comments)
   (16.3ms)  CREATE TABLE "post_comments" ("id" bigserial primary key, "post_id" integer NOT NULL, "body" text NOT NULL, "writer" character varying NOT NULL, "encrypted_password" character varying NOT NULL, "created_at" timestamp(6) NOT NULL, "updated_at" timestamp(6) NOT NULL)
   -> 0.7858s
-- add_index(:post_comments, [:post_id])
   (10.6ms)  CREATE  INDEX  "index_post_comments_on_post_id" ON "post_comments"  ("post_id")
   -> 0.0384s
```
