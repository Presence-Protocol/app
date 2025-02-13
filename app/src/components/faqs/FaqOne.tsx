const faqs = [
  {
    question: "What is Presence Protocol?",
    answer:
      "Presence Protocol is a blockchain-based system on Alephium that provides verifiable proof of event attendance through digital tokens called Presences.",
  },
  {
    question: "How does it work?",
    answer:
      "Organizers create events, and attendees claim Presences as proof of participation within a set timeframe. These are stored securely on the blockchain.",
  },
  {
    question: "Why use Presence instead of traditional check-ins?",
    answer:
      "It ensures tamper-proof, verifiable attendance, enables NFT rewards, and offers premium event access for better community engagement.",
  },
  {
    question: "What can I do with my Presence?",
    answer:
      "Your Presence can unlock exclusive content, prove event participation, and earn rewards from event organizers.",
  },
  {
    question: "What are Claim Windows?",
    answer:
      "Claim Windows are time-limited periods during which attendees must mint their Presence before the opportunity expires.",
  },
  {
    question: "Can one address claim multiple Presences for the same event?",
    answer:
      "Yes, event organizers can configure whether to allow multiple claims per address. By default, each address can only claim one Presence per event to ensure fair participation.",
  },
  {
    question: "What is Delegated Payment?",
    answer:
      "Organizers can cover the minting costs for attendees, making participation seamless and accessible.",
  },
  {
    question: "Is Presence an NFT?",
    answer:
      "Yes! Presence tokens are NFT-based digital proofs of attendance and can integrate with platforms like Deadrare and Alphaga.",
  },
];

const FaqOne = () => {
  return (
    <section className="relative flex items-center w-full bg-white">
      <div
        className="relative items-center w-full mx-auto  ">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:divide-x-2 divide-black">
          <div className="text-center lg:text-left p-8 lg:p-20 bg-lila-500">
            <p className="text-3xl lg:text-9xl tracking-tight font-medium text-black">
              FAQ
            </p>
            <p className="text-xl tracking-wide mt-4 text-black max-w-xs">
              Answers to commonly asked questions about the protocol
            </p>
          </div>
          <div
            className="relative w-full mx-auto lg:col-span-2 text-xl font-medium divide-y-2 divide-black">
            {
              faqs.map((faq, index) => (
                <details key={index} className="w-full p-8 text-left select-none">
                  <summary className="flex group items-center cursor-pointer justify-between w-full   text-left select-none text-black hover:text-lila-900 font-display hover:text-accent-500">
                    {faq.question}
                    <div className="size-8 border-2 border-black inline-flex duration-300 ease-out items-center justify-center rounded-full shadow-tiny shadow-black group-hover:bg-lila-500 group-hover:text-black group-open:-rotate-45">
                      <svg
                        className="size-5 text-accent-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v12m6-6H6"
                        />
                      </svg>
                    </div>
                  </summary>
                  <div className="py-8 text-slate-600 font-sans text-lg max-w-3xl font-normal">
                    {faq.answer}
                  </div>
                </details>
              ))
            }
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqOne;
