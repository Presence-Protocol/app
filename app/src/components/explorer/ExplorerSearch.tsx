'use client';

export default function ExplorerSearch() {
  return (
    <section className="overflow-hidden relative">
      <div className="mx-auto  bg-lila-300 relative overflow-hidden">
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
            <h2 className="text-3xl lg:text-5xl font-medium text-black max-w-4xl mx-auto">
              Explore NFT Moments
            </h2>
            <p className="max-w-lg mt-4 xl:text-xl tracking-wide text-black mx-auto">
              Discover and collect unique attendance proofs from memorable events
            </p>
            
            <form className="bg-white border-2 border-black shadow-black overflow-hidden shadow justify-between mt-8 rounded-xl sm:flex z-10 relative">
              <input
                type="search"
                placeholder="Search NFTs..."
                className="w-full px-5 text-center lg:text-left border-transparent focus:ring-black h-20 text-sm py-3 bg-transparent focus:border-black placeholder-black rounded-xl"
              />
              <button
                className="text-black flex items-center text-lg font-bold focus:outline-none justify-center text-center bg-lila-500 lg:border-l-2 border-black transform transition hover:shadow-none duration-200 hover:bg-lila-600 w-full h-20 sm:w-20 shrink-0"
                type="submit"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
          </div>

         
        </div>
      </div>
    </section>
  );
}