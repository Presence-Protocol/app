import Link from 'next/link';
import { addressFromContractId } from '@alephium/web3';

interface EventMetadata {
  contractId: string;
  eventName: string;
  description?: string;
  image?: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  createdAt: string;
}

export default function EventSlider({ events }: { events: EventMetadata[] }) {
  console.log('events', events);
  return (
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
        {events.map((event, index) => (
          <div
            key={index}
            className="snap-start shrink-0 first:pl-4 last:pr-4"
          >
            <Link
              href={`/mint-presence/#id=${event.contractId.replace(/^wasm\./, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-[280px] border-2 border-black rounded-xl overflow-hidden bg-white shadow transition-transform hover:translate-y-[-2px]"
            >
              {event.image && (
                <div className="relative aspect-square overflow-hidden border-b-2 border-black">
                  <img
                    src={event.image}
                    alt={event.eventName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-base font-semibold text-black mb-1">
                  {event.eventName}
                </h3>
                {event.description && (
                  <p className="text-xs text-black mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}
                <div className="flex justify-between items-center pt-3 border-t-2 border-black">
                  <div className="text-black items-center shadow shadow-lila-600 text-[10px] font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                    Event
                  </div>
                  <div className="text-xs text-black font-medium">
                    {event.eventDateStart && event.eventDateEnd
                      ? `${event.eventDateStart} - ${event.eventDateEnd}`
                      : new Date(event.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 