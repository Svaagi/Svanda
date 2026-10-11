import { NotFoundPage } from 'features/notFound';
import { notFoundMeta } from 'features/seo';
import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = ({ location }) =>
  notFoundMeta(location.pathname);

export default function NotFound() {
  return <NotFoundPage />;
}
