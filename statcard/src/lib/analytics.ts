import { track } from '@vercel/analytics';

// Keep event names stable and properties aggregate/non-identifying. Never send
// names, emails, message text, profile handles, or database IDs to analytics.
export type AnalyticsEvent =
  | 'auth_completed'
  | 'profile_saved'
  | 'profile_photo_saved'
  | 'profile_share_action'
  | 'profile_contact_action'
  | 'connection_action'
  | 'message_sent'
  | 'recruiting_list_action'
  | 'directory_filter_used';

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) {
  void track(event, properties);
}
