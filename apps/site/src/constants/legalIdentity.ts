// The one source of the operator's identity: the legal pages fill their `{{token}}`
// placeholders from it. Details the operator has not supplied yet hold a to-do placeholder;
// the build warns while any remain (scripts/checkLegalTodos.mjs) and they block launch.
export const LEGAL_IDENTITY = {
  tradeName: 'SVANDA',
  operatorName: 'TODO: operator legal name',
  ico: '24020923',
  dic: 'TODO: DIČ, or "not a VAT payer"',
  seat: 'Nové sady 988/2, 602 00 Brno - Staré Brno',
  email: 'business@svanda.fun',
  privacyEmail: 'business@svanda.fun',
} as const;

export const LEGAL_EFFECTIVE_DATE = '2026-10-09';
