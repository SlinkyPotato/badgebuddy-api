import { bbSchema } from './bb.schema';

export const CommunityEvent = bbSchema.table('community_events', {
  id: 'uuid',
  name: 'string',
  description: 'string',
  location: 'string',
  start_date: 'date',
  end_date: 'date',
  created_at: 'date',
  updated_at: 'date',
  deleted_at: 'date',
});
