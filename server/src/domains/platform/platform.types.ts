import { platforms } from '../../db/schema';

export type Platform = typeof platforms.$inferSelect;