'use client';

import Image from 'next/image';
import Link from 'next/link';

const CtaOne = () => {
  return (
    <section>
      <div
        className="items-center w-full mx-auto bg-black p-8 lg:p-20 2xl:px-0 2xl:border-x-2 border-black">
        <div className="items-center gap-12 h-full">
          <div className="text-center max-w-3xl mx-auto">
            <Image
              className="mx-auto justify-center shadow shadow-white rounded-full"
              src="/images/blob5.svg"
              alt="Decorative blob"
              width={128}
              height={128}
            />

            <p
              className="text-3xl lg:text-5xl mt-8 tracking-tight font-medium text-white">
              Ready to dive in? Get started with <span className="md:block lg:text-lila-600"
                >Presence Protocol</span>
            </p>
            <p className="max-w-lg mx-auto mt-4 lg:text-xl tracking-wide text-white">
              Explore the limitless possibilities of digital finance and embark on a
              journey towards financial empowerment
            </p>
            <div className="mt-12">
              <Link
                className="text-black items-center shadow shadow-lila-600 text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-300 focus:bg-lila-600 border-lila-600 duration-300 outline-none focus:shadow-none border-2 sm:w-auto py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:bg-lila-500"
                href="/new-event"
                aria-label="Explore all pages"
              >
                Get started <span className="ml-3">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaOne;
