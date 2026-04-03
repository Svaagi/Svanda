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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSelect = (field: 'mode' | 'venueType', value: ContactMode | ContactVenueType) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `SVANDA Inquiry — ${MODE_LABELS[formData.mode]} — ${VENUE_LABELS[formData.venueType]}`,
          name: formData.contactName,
          venue: formData.venueName,
          email: formData.email,
          phone: formData.phone || '—',
          mode: MODE_LABELS[formData.mode],
          for: VENUE_LABELS[formData.venueType],
          message: formData.message || '—',
        }),
      });

      if (!response.ok) throw new Error('Submission failed');
      setIsSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, isSubmitted, isLoading, error, handleChange, handleSelect, handleSubmit };
};
