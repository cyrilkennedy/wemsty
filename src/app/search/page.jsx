// src/app/search/page.jsx
import { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading search...</div>}>
      <SearchPageClient />
    </Suspense>
  );
}