// const brandLogos = [
//   { src: "/brands/1.svg", alt: "Brand Logo 1" },
//   { src: "/brands/2.svg", alt: "Brand Logo 2" },
//   { src: "/brands/3.svg", alt: "Brand Logo 3" },
//   { src: "/brands/4.svg", alt: "Brand Logo 4" },
//   { src: "/brands/5.svg", alt: "Brand Logo 5" },
//   { src: "/brands/6.svg", alt: "Brand Logo 6" },
//   { src: "/brands/7.svg", alt: "Brand Logo 7" },
//   { src: "/brands/8.svg", alt: "Brand Logo 8" },
//   { src: "/brands/9.svg", alt: "Brand Logo 9" },
//   { src: "/brands/10.svg", alt: "Brand Logo 10" },
//   { src: "/brands/11.svg", alt: "Brand Logo 11" },
//   { src: "/brands/12.svg", alt: "Brand Logo 12" },
// ];

import Image from 'next/image';
import AlphLogo from "@/images/partner-logos/ALPH.svg"
import NTV from "@/images/partner-logos/NTV_Logo_Logo_NTV_White.svg"
import PushValueLogo from "@/images/partner-logos/PV.png"
// import NTV from "@/images/partner-logos/NTV.png"
import PineappleDAO from "@/images/partner-logos/pineapple-dao.png"

const partnerLogos = [
  { src: AlphLogo, alt: "Alephium Logo" },
  { src: PushValueLogo, alt: "Push Value Logo" },
  { src: NTV, alt: "NTV Logo" },
  { src: PineappleDAO, alt: "Pineapple DAO Logo" }
];

export default function LogoCloudOne() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto bg-black overflow-hidden 2xl:border-x-2 border-black">
        <div className="relative flex py-12">
          {/* First scroll container */}
          <div className="flex animate-marquee-left whitespace-nowrap">
            {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, index) => (
              <Image
                key={index}
                src={logo.src}
                alt={logo.alt}
                className={`w-auto object-contain mx-10 ${logo.src === NTV ? 'max-h-4 mt-2.5' : 'max-h-10'}`} 
                width={logo.src === NTV ? 24 : 48}
                height={logo.src === NTV ? 12 : 24}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
