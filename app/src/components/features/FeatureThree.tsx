'use client';

interface Section {
  title: string;
  description: string;
  imgSrc: string;
  imgAlt: string;
  bgColor: string;
}

const sections: Section[] = [
  {
    title: "Multi-currency support",
    description:
      "Access a diverse range of cryptocurrencies in one unified platform, enabling you to explore and manage various digital assets.",
    imgSrc: "/images/thumbnail6.svg",
    imgAlt: "Thumbnail for Multi-currency support",
    bgColor: "bg-green-400",
  },
  {
    title: "Decentralized exchanges",
    description:
      "Embrace peer-to-peer trading without intermediaries. Trade directly with other users on our platform and enjoying the benefits.",
    imgSrc: "/images/thumbnail5.svg",
    imgAlt: "Thumbnail for Decentralized exchanges",
    bgColor: "bg-lila-500",
  },
];

export default function FeatureThree() {
  return (
    <section className="relative flex items-center w-full">
      <div
        className="relative items-center w-full mx-auto  divide-y-2 border-b-2 divide-black 2xl:border-x-2 border-black">
        <div
          className="grid grid-cols-1 md:grid-cols-2 divide-y divide-black md:divide-y-0 md:divide-x-2">
          {sections.map((section, index) => (
            <div key={index} className="grid grid-cols-1 divide-y-2 divide-black">
              <div className="relative p-8 lg:px-20 py-12 items-center gap-12 h-full lg:inline-flex bg-white">
                <div className="max-w-xl text-center mx-auto">
                  <p className="text-3xl lg:text-5xl 2xl:text-4xl tracking-tight font-medium text-black">
                    {section.title}
                  </p>
                  <p className="mt-4 text-lg tracking-wide text-black font-normal mx-auto">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className={`w-full aspect-square h-full ${section.bgColor}`}>
                <img
                  className="border-b-0 object-cover"
                  src={section.imgSrc}
                  alt={section.imgAlt}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
