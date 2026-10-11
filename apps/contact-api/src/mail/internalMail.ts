import type { ContactRequest } from '@svanda/shared';
import type { SendMailOptions } from 'nodemailer';

import { escapeHtml, escapeHtmlLines } from './escapeHtml.js';
import type { MailAddresses } from './mailTypes.js';

const JSON_INDENT = 2;

const CONFIG_ATTACHMENT_NAME = 'config.json';

// The team reads these in Czech, whatever language the visitor used.
const LABELS = {
  subject: 'Poptávka z webu',
  name: 'Jméno',
  venue: 'Podnik a město',
  email: 'E-mail',
  locale: 'Jazyk',
  message: 'Zpráva',
  config: 'Konfigurace jukeboxu',
  configAttached: `v příloze ${CONFIG_ATTACHMENT_NAME}`,
  configMissing: 'nepřiložena',
  noMessage: '(bez zprávy)',
} as const;

function summaryRows(request: ContactRequest): [string, string][] {
  return [
    [LABELS.name, request.name],
    [LABELS.venue, request.venue],
    [LABELS.email, request.email],
    [LABELS.locale, request.locale],
    [
      LABELS.config,
      request.config ? LABELS.configAttached : LABELS.configMissing,
    ],
  ];
}

function renderText(request: ContactRequest): string {
  const rows = summaryRows(request).map(
    ([label, value]) => `${label}: ${value}`,
  );

  return [
    ...rows,
    '',
    `${LABELS.message}:`,
    request.message || LABELS.noMessage,
  ].join('\n');
}

function renderHtml(request: ContactRequest): string {
  const rows = summaryRows(request).map(
    ([label, value]) =>
      `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
  );

  return [
    `<table>${rows.join('')}</table>`,
    `<h3>${escapeHtml(LABELS.message)}</h3>`,
    `<p>${escapeHtmlLines(request.message || LABELS.noMessage)}</p>`,
  ].join('\n');
}

export function buildInternalMail(
  request: ContactRequest,
  addresses: MailAddresses,
): SendMailOptions {
  return {
    from: addresses.from,
    to: addresses.to,
    replyTo: { name: request.name, address: request.email },
    subject: `${LABELS.subject}: ${request.venue}`,
    text: renderText(request),
    html: renderHtml(request),
    attachments: request.config
      ? [
          {
            filename: CONFIG_ATTACHMENT_NAME,
            contentType: 'application/json',
            content: JSON.stringify(request.config, null, JSON_INDENT),
          },
        ]
      : [],
  };
}
