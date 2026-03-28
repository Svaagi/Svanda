import { ChangeEvent, FormEvent, useState } from 'react';

import { ContactFormData } from '../types';

const INITIAL_FORM_STATE: ContactFormData = {
  venueName: '',
  contactName: '',
  email: '',
  phone: '',
  message: '',
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  return { formData, isSubmitted, handleChange, handleSubmit };
};
