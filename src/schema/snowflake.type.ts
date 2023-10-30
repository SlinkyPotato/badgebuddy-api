import { customType } from 'drizzle-orm/mysql-core';

export const snowflake = customType<{
  data: bigint;
  notNull: false;
  default: false;
}>({
  dataType() {
    return 'bigint unsigned';
  },
});
