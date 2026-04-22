import { ChangeEvent, FormEvent, useState } from 'react';

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

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;

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

    if (!ACCESS_KEY) {
      setError('Contact form is not configured. Please email us directly.');
      setIsLoading(false);
      return;
    }

    const honeypot = (event.currentTarget.elements.namedItem('botcheck') as HTMLInputElement | null)?.value;
    if (honeypot) {
      setIsSubmitted(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          from_name: 'SVANDA Website',
          subject: `SVANDA Inquiry - ${MODE_LABELS[formData.mode]} - ${VENUE_LABELS[formData.venueType]}`,
          replyto: formData.email,
          name: formData.contactName,
          venue: formData.venueName,
          email: formData.email,
          phone: formData.phone || '-',
          interested_in: MODE_LABELS[formData.mode],
          venue_type: VENUE_LABELS[formData.venueType],
          message: formData.message || '-',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Submission failed');
      }
      setIsSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, isSubmitted, isLoading, error, handleChange, handleSelect, handleSubmit };
};
