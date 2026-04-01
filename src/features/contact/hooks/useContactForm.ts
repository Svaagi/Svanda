import { ChangeEvent, FormEvent, useState } from 'react';

import { CONTACT_EMAIL } from 'constants';
import { ContactFormData, ContactMode, ContactVenueType } from '../types';

const INITIAL_FORM_STATE: ContactFormData = {
  venueName: '',
  contactName: '',
  email: '',
  phone: '',
  mode: 'both',
  venueType: 'bar',
  message: '',
};

const MODE_LABELS: Record<ContactMode, string> = {
  karaoke: 'Karaoke Box',
  jukebox: 'Jukebox',
  both: 'Both',
};

const VENUE_LABELS: Record<ContactVenueType, string> = {
  bar: 'Bar / Club',
  event: 'Event',
};

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSelect = (field: 'mode' | 'venueType', value: ContactMode | ContactVenueType) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(
      `SVANDA Inquiry — ${MODE_LABELS[formData.mode]} — ${VENUE_LABELS[formData.venueType]}`,
    );

    const body = encodeURIComponent(
      [
        `Name: ${formData.contactName}`,
        `Venue: ${formData.venueName}`,
        `Email: ${formData.email}`,
        formData.phone ? `Phone: ${formData.phone}` : '',
        `Mode: ${MODE_LABELS[formData.mode]}`,
        `For: ${VENUE_LABELS[formData.venueType]}`,
        formData.message ? `\nMessage:\n${formData.message}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setIsSubmitted(true);
  };

  return { formData, isSubmitted, handleChange, handleSelect, handleSubmit };
};
