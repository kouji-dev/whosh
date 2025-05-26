CREATE TABLE "platforms" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platforms_code_unique" UNIQUE("code")
);

INSERT INTO "platforms" ("id", "code", "name", "icon", "color") VALUES
('twitter', 'twitter', 'Twitter', 'twitter', '#1DA1F2'),
('facebook', 'facebook', 'Facebook', 'facebook', '#4267B2'), 
('instagram', 'instagram', 'Instagram', 'instagram', '#E1306C'),
('linkedin', 'linkedin', 'LinkedIn', 'linkedin', '#0077B5'),
('youtube', 'youtube', 'YouTube', 'youtube', '#FF0000'),
('tiktok', 'tiktok', 'TikTok', 'tiktok', '#000000');

--> statement-breakpoint
CREATE TABLE "post_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_analytics_post_id_unique" UNIQUE("post_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"media_urls" json NOT NULL,
	"status" text NOT NULL,
	"scheduled_for" timestamp,
	"published_at" timestamp,
	"error" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"channel_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_channels" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"platform_id" text NOT NULL,
	"platform_user_id" text NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"profile_image" text,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires" timestamp,
	"scopes" json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "post_analytics" ADD CONSTRAINT "post_analytics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_channel_id_social_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."social_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_channels" ADD CONSTRAINT "social_channels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_channels" ADD CONSTRAINT "social_channels_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "status_scheduled_for_idx" ON "posts" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_platform_channel_idx" ON "social_channels" USING btree ("user_id","platform_id","platform_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_user_idx" ON "team_members" USING btree ("team_id","user_id");