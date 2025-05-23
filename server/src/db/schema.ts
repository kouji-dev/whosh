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

export const socialAccounts = pgTable('social_accounts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  platform: text('platform').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpires: timestamp('token_expires'),
  platformUserId: text('platform_user_id').notNull(),
  username: text('username').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

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
  socialAccountId: text('social_account_id').notNull().references(() => socialAccounts.id, { onDelete: 'cascade' }),
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

export const platformConnections = pgTable('platform_connections', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platformId: text('platform_id').notNull().references(() => platforms.id, { onDelete: 'cascade' }),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  accountId: text('account_id').notNull(),
  accountName: text('account_name'),
  profileImage: text('profile_image'),
  lastSync: timestamp('last_sync'),
  isValid: boolean('is_valid').default(true).notNull(),
  scopes: json('scopes').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  parentConnectionId: text('parent_connection_id').references(() => platformConnections.id),
}, (table) => ({
  userPlatformAccountIdx: uniqueIndex('user_platform_account_idx').on(table.userId, table.platformId, table.accountId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  socialAccounts: many(socialAccounts),
  posts: many(posts),
  teamMembers: many(teamMembers),
  platformConnections: many(platformConnections),
}));

export const platformsRelations = relations(platforms, ({ many }) => ({
  connections: many(platformConnections),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [socialAccounts.userId],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  socialAccount: one(socialAccounts, {
    fields: [posts.socialAccountId],
    references: [socialAccounts.id],
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

export const platformConnectionsRelations = relations(platformConnections, ({ one, many }) => ({
  user: one(users, {
    fields: [platformConnections.userId],
    references: [users.id],
  }),
  platform: one(platforms, {
    fields: [platformConnections.platformId],
    references: [platforms.id],
  }),
  parentConnection: one(platformConnections, {
    fields: [platformConnections.parentConnectionId],
    references: [platformConnections.id],
  }),
  childConnections: many(platformConnections),
})); 