// src/app/create/page.jsx
import { Suspense } from 'react';
import CreatePageClient from './CreatePageClient';

export const dynamic = 'force-dynamic'; 
export default function CreatePage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading create page…</div>}>
      <CreatePageClient />
    </Suspense>
  );
}