export interface ContactFormData {
  venueName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
}

export interface FormFieldConfig {
  name: keyof ContactFormData;
  label: string;
  type: string;
  placeholder: string;
  isTextArea?: boolean;
}
