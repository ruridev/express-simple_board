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

# 참고
[Node.js에서 exports와 mudule.exports의 차이](http://happinessoncode.com/2018/05/20/nodejs-exports-and-module-exports/)

- module.exports는 개별 함수가 아닌 객체를 통째로 exports 하는 경우에 사용
- Node.js에서 익스포트되는 객체는 module.exports이다.
- module.exports 빈 오브젝트({})로 초기화되어 있다.
- exports는 module.exports를 참조하는 변수이다.
