import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Events | Presence Protocol',
  description: 'Browse all free events on Presence Protocol',
};

export default function FreeEventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Free Events</h1>
      {/* We'll add the event listing component here later */}
    </div>
  );
} 