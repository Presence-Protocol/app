import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Events | Explorer',
  description: 'Browse all live events on Presence Protocol',
};

export default function LiveEventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Live Events</h1>
      {/* We'll add the event listing component here later */}
    </div>
  );
} 