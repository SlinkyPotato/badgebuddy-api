/**
 * Event type enum.
 * All event types excluding BY_ATTENDANCE are manual distribution methods.
 */
export enum EventType {
  // Event distribution by attendance
  BY_ATTENDANCE = 'BY_ATTENDANCE',

  // Event distribution to all members
  ALL_MEMBERS = 'ALL_MEMBERS',

  // Event distribution by assigned roles
  BY_ROLES = 'BY_ROLES',

  // Event distribution by specific user ID
  BY_USER_ID = 'BY_USER_ID',
}
