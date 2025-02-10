import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Events | Presence Protocol',
  description: 'Browse all premium events on Presence Protocol',
};

export default function PremiumEventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Premium Events</h1>
      {/* We'll add the event listing component here later */}
    </div>
  );
} 