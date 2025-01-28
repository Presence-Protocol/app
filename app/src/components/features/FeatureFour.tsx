'use client';

interface Feature {
  imgSrc: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    imgSrc: "/images/blob1.svg",
    title: "Secure Wallets",
    description:
      "Rest easy knowing your crypto assets are protected by state-of-the-art security measures and encryption.",
  },
  {
    imgSrc: "/images/blob2.svg", 
    title: "Instant Transactions",
    description:
      "Experience the convenience of near-instantaneous cryptocurrency transfers, allowing you to send.",
  },
  {
    imgSrc: "/images/blob3.svg",
    title: "Multi-Currency Support", 
    description:
      "Access a diverse range of cryptocurrencies in one unified platform, enabling you to explore.",
  },
];

export default function FeatureFour() {
  return (
    <section className="relative flex items-center w-full">
      <div className="relative items-center w-full mx-auto 2xl:border-x-2 border-b-2 border-black">
        <div className="relative p-8 lg:p-20 items-center gap-12 h-full bg-yellow-500">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-3xl lg:text-5xl font-medium text-black">
              Navigating the <span className="md:block">digital financial frontier</span>
            </p>
            <p className="xl:text-xl text-black tracking-wide max-w-xl mx-auto mt-4">
              Join us on our journey to transform the financial landscape with
              cutting-edge cryptocurrency solutions and groundbreaking blockchain
              technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:text-center lg:grid-cols-3 gap-6 lg:gap-12 mt-12">
            {features.map((feature, index) => (
              <div key={index}>
                <img
                  className="size-20 mx-auto"
                  src={feature.imgSrc}
                  alt={feature.title}
                />
                <h2 className="text-3xl text-black font-medium mt-8">
                  {feature.title}
                </h2>
                <p className="text-lg tracking-wide text-black mt-4">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
