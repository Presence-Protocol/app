'use client';

export default function HeroTwo() {
  return (
    <section className="relative flex items-center w-full">
      <div className="mx-auto  border-b-2 border-black 2xl:border-x-2">
        <div
          className="grid grid-cols-1 lg:grid-cols-2 divide-y-2 divide-black md:divide-y-0 md:divide-x-2">
          <div
            className="relative p-8 lg:px-20 bg-lila-300 items-center gap-12 h-full lg:inline-flex">
            <div className="max-w-xl lg:text-left text-center mx-auto">
              <div>
                <h2
                  className="text-3xl lg:text-5xl font-medium text-black text-balance">
                  Pioneering the future of decentralized finance and blockchain
                </h2>
                <div className="max-w-md mt-4">
                  <p className="xl:text-xl text-black tracking-wide text-pretty">
                    Join us on our journey to transform the financial landscape with
                    cutting-edge cryptocurrency solutions and groundbreaking
                    blockchain technologies.
                  </p>
                </div>
                <div className="flex-col flex gap-3 mt-10 sm:flex-row">
                  <a
                    className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white sm:w-auto py-3 rounded-lg h-16 focus:translate-y-1 w-full hover:text-lila-800 tracing-wide"
                    href="/"
                    title="link to your page"
                    aria-label="your label"
                    >Explore all pages
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="block w-full aspect-square lg:mt-0 bg-white h-full">
            <img
              className="object-cover"
              src="/images/thumbnail3.svg"
              alt="#"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
