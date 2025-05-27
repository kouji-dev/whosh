CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"mimetype" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"user_id" text NOT NULL,
	"post_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;