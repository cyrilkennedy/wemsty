// src/app/create/page.jsx   ← this must be a Server Component
import { Suspense } from 'react';
import CreatePageClient from './CreatePageClient';

export default function CreatePage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading create page…</div>}>
      <CreatePageClient />
    </Suspense>
  );
}