import { pgTable, text, timestamp, integer, boolean, json, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const platforms = pgTable('platforms', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const socialChannels = pgTable('social_channels', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platformId: text('platform_id').notNull().references(() => platforms.id, { onDelete: 'cascade' }),
  platformUserId: text('platform_user_id').notNull(),
  username: text('username').notNull(),
  displayName: text('display_name'),
  profileImage: text('profile_image'),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpires: timestamp('token_expires'),
  scopes: json('scopes').$type<string[]>().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastSync: timestamp('last_sync'),
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Ensure unique combination of user, platform, and platform user ID
  userPlatformChannelIdx: uniqueIndex('user_platform_channel_idx').on(
    table.userId,
    table.platformId,
    table.platformUserId
  ),
}));

export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  content: text('content').notNull(),
  mediaUrls: json('media_urls').$type<string[]>().notNull(),
  status: text('status').notNull(),
  scheduledFor: timestamp('scheduled_for'),
  publishedAt: timestamp('published_at'),
  error: text('error'),
  retryCount: integer('retry_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  channelId: text('channel_id').notNull().references(() => socialChannels.id, { onDelete: 'cascade' }),
}, (table) => ({
  statusScheduledForIdx: index('status_scheduled_for_idx').on(table.status, table.scheduledFor),
  userIdIdx: index('user_id_idx').on(table.userId),
}));

export const postAnalytics = pgTable('post_analytics', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  postId: text('post_id').notNull().unique().references(() => posts.id, { onDelete: 'cascade' }),
  likes: integer('likes').default(0).notNull(),
  shares: integer('shares').default(0).notNull(),
  comments: integer('comments').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  impressions: integer('impressions').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  role: text('role').notNull(),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  teamUserIdx: uniqueIndex('team_user_idx').on(table.teamId, table.userId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  channels: many(socialChannels),
  posts: many(posts),
  teamMembers: many(teamMembers),
}));

export const platformsRelations = relations(platforms, ({ many }) => ({
  channels: many(socialChannels),
}));

export const socialChannelsRelations = relations(socialChannels, ({ one, many }) => ({
  user: one(users, {
    fields: [socialChannels.userId],
    references: [users.id],
  }),
  platform: one(platforms, {
    fields: [socialChannels.platformId],
    references: [platforms.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  channel: one(socialChannels, {
    fields: [posts.channelId],
    references: [socialChannels.id],
  }),
  analytics: one(postAnalytics, {
    fields: [posts.id],
    references: [postAnalytics.postId],
  }),
}));

export const postAnalyticsRelations = relations(postAnalytics, ({ one }) => ({
  post: one(posts, {
    fields: [postAnalytics.postId],
    references: [posts.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
})); 