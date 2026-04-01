export type ContactMode = 'karaoke' | 'jukebox' | 'both';
export type ContactVenueType = 'bar' | 'event';

export interface ContactFormData {
  venueName: string;
  contactName: string;
  email: string;
  phone: string;
  mode: ContactMode;
  venueType: ContactVenueType;
  message: string;
}
