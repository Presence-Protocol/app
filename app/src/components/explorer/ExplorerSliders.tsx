'use client';

export default function ExplorerSliders() {
  return (
    <div className="mt-12 relative">
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          <div className="text-black items-center mb-4 shadow shadow-black text-xs font-semibold inline-flex px-4 bg-lila-300 border-black border-2 py-2 rounded-lg tracking-wide">
            <span>Latest Events</span>
          </div>
        </div>
        
        <div className="flex overflow-hidden pb-12">
          <div className="flex animate-scroll gap-6">
            {[...Array(9)].map((_, index) => (
              <div 
                key={index}
                className="flex-none w-64 bg-white p-4 rounded-xl border-2 border-black shadow-large"
              >
                <div className="aspect-square rounded-lg bg-lila-300 mb-4"></div>
                <h3 className="font-medium text-lg">NFT #{index + 1}</h3>
                <p className="text-sm text-gray-600">Event Attendance Proof</p>
              </div>
            ))}
            {/* Duplicate items for seamless scrolling */}
            {[...Array(9)].map((_, index) => (
              <div 
                key={`duplicate-${index}`}
                className="flex-none w-64 bg-white p-4 rounded-xl border-2 border-black shadow-large"
              >
                <div className="aspect-square rounded-lg bg-lila-300 mb-4"></div>
                <h3 className="font-medium text-lg">NFT #{index + 1}</h3>
                <p className="text-sm text-gray-600">Event Attendance Proof</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}