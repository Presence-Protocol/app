const brandLogos = [
  { src: "/brands/1.svg", alt: "Brand Logo 1" },
  { src: "/brands/2.svg", alt: "Brand Logo 2" },
  { src: "/brands/3.svg", alt: "Brand Logo 3" },
  { src: "/brands/4.svg", alt: "Brand Logo 4" },
  { src: "/brands/5.svg", alt: "Brand Logo 5" },
  { src: "/brands/6.svg", alt: "Brand Logo 6" },
  { src: "/brands/7.svg", alt: "Brand Logo 7" },
  { src: "/brands/8.svg", alt: "Brand Logo 8" },
  { src: "/brands/9.svg", alt: "Brand Logo 9" },
  { src: "/brands/10.svg", alt: "Brand Logo 10" },
  { src: "/brands/11.svg", alt: "Brand Logo 11" },
  { src: "/brands/12.svg", alt: "Brand Logo 12" },
];

export default function LogoCloudOne() {
  return (
    <section className="overflow-hidden">
      <div
        className="mx-auto px-8 lg:px-20 2xl:px-0 bg-black overflow-hidden 2xl:border-x-2 border-black">
        <div
          className="relative flex items-center gap-4 py-12 animate-marquee-left whitespace-nowrap">
          {brandLogos.map((logo, index) => (
            <img
              key={index}
              src={logo.src}
              alt={logo.alt}
              className="max-h-12 w-auto"
            />
          ))}
          {brandLogos.map((logo, index) => (
            <img
              key={`duplicate-${index}`}
              src={logo.src}
              alt={logo.alt}
              className="max-h-12 w-auto"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
