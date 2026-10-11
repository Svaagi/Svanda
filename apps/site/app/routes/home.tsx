import { HomePage } from 'features/home';
import { homeMeta } from 'features/seo';
import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = ({ location }) => homeMeta(location.pathname);

export default function Home() {
  return <HomePage />;
}
