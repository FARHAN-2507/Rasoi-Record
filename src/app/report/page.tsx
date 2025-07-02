// app/report/page.js
import { Suspense } from 'react';
import ReportClient from '@/components/ReportClient';

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading Report...</div>}>
      <ReportClient />
    </Suspense>
  );
}
