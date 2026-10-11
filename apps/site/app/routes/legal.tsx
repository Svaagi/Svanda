import { LegalPage } from 'features/legal';
import { legalMeta } from 'features/seo';
import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = ({ location }) =>
  legalMeta(location.pathname);

export default function Legal() {
  return <LegalPage />;
}
