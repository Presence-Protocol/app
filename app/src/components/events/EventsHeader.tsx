'use client';

interface EventsHeaderProps {
  totalEvents: number;
  last24Hours: number;
}

export default function EventsHeader({ totalEvents, last24Hours }: EventsHeaderProps) {
  return (
    <section className="overflow-hidden relative">
      <div className="mx-auto bg-lila-300 relative overflow-hidden border-black border-b-2">
        <div className="items-center w-full grid mx-auto p-8 lg:p-12">
          <img
            className="absolute shadow-large rounded-full shadow-black w-32 h-32 md:w-48 md:h-48 -top-10 -right-6 md:-top-16 md:-right-10"
            src="/images/blob3.svg"
            alt="your alt-text"
          />

          <img
            className="absolute shadow-large rounded-full shadow-black w-32 h-32 md:w-48 md:h-48 -bottom-6 left-10 md:-bottom-14 md:left-16"
            src="/images/blob4.svg"
            alt="your alt-text"
          />
          <img
            className="absolute w-48 h-48 md:w-64 md:h-64 shadow-large rounded-full shadow-black -bottom-16 -right-10 md:-bottom-24 md:-right-16"
            src="/images/blob1.svg"
            alt="your alt-text"
          />
          <img
            className="absolute shadow-large rounded-full shadow-black w-32 h-32 md:w-48 md:h-48 bottom-10 -left-10 md:bottom-14 md:-left-16"
            src="/images/blob2.svg"
            alt="your alt-text"
          />
          <img
            className="absolute shadow-large rounded-full shadow-black w-32 h-32 md:w-48 md:h-48 -top-20 left-28 md:-top-28 md:left-40"
            src="/images/blob5.svg"
            alt="your alt-text"
          />
          <div className="max-w-3xl mx-auto text-center lg:py-12">
          <h2 className="text-2xl lg:text-3xl font-semibold text-black text-center">
              Explore Presence Events
            </h2>
            <p className="text-sm text-gray-500 mb-6">
            Discover and explore presence proofs on the blockchain
        </p>
           
            
            <div className="mt-8 flex justify-center gap-6">
              <button className="bg-white cursor-default border-2 border-black shadow shadow-black rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-black">{totalEvents}</div>
                <div className="text-sm text-gray-600 mt-1">Total Events</div>
              </button>
              
              <button className="bg-white cursor-default border-2 border-black shadow  shadow-black rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-black">{last24Hours}</div>
                <div className="text-sm text-gray-600 mt-1">Last 24h</div>
              </button>
              
              <button className="bg-white cursor-default border-2 border-black shadow shadow-black rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-black">
                  {((last24Hours / totalEvents) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">24h Growth</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}