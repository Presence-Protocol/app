const faqs = [
  {
    question: "How does end-to-end encryption work?",
    answer:
      "End-to-end encryption ensures that only the sender and recipient can access the content of a message. The information is encrypted on the sender's device and can only be decrypted by the intended recipient, preventing any intermediaries, including the platform provider, from accessing the data.",
  },
  {
    question: "Can I access my encrypted data if I forget my encryption key?",
    answer:
      "No, forgetting or losing your encryption key means that your encrypted data cannot be accessed. This is a crucial security measure to ensure that even if someone gains unauthorized access to your account, they won't be able to decrypt and view your messages or files.",
  },
  {
    question:
      "Are there any limitations to the self-destructing messages feature?",
    answer:
      "Self-destructing messages are designed to automatically delete themselves after a specific period or upon being read by the recipient. However, it's important to note that the feature only removes the message from the devices involved in the conversation. Recipients may take screenshots or use other means to capture the content, which is beyond the platform's control.",
  },
  {
    question:
      "What happens if I enable two-factor authentication and lose my device?",
    answer:
      "Losing your device doesn't automatically compromise your account's security. It's recommended to contact our support team as soon as possible to disable the two-factor authentication on your lost device and set up the authentication on your new device. This process will help protect your account from unauthorized access while ensuring you can regain access to it.",
  },
  {
    question: "Is my personal information shared or sold to third parties?",
    answer:
      "No, we strictly adhere to a privacy-centric approach. Your personal information is never shared, sold, or monetized. We prioritize your privacy and ensure that your data remains confidential and only accessible to you.",
  },
  {
    question: "Can I use this platform on multiple devices?",
    answer:
      "Yes, you can access our platform on multiple devices. Your encrypted data remains synced across all devices, allowing you to seamlessly communicate and access your files and messages from anywhere.",
  },
  {
    question: "Are there any storage limitations for files and documents?",
    answer:
      "Our platform provides ample storage space for your files and documents. However, there may be storage limitations based on the pricing plan you choose. We offer flexible plans to suit your needs and provide options to upgrade if you require additional storage capacity.",
  },
  {
    question: "Is it possible to export my data from the platform?",
    answer:
      "Yes, you can export your data from the platform. We offer export features that allow you to download your messages, files, and documents, ensuring you have a local copy for backup or migration purposes. It provides you with greater control and flexibility over your data.",
  },
];

const FaqOne = () => {
  return (
    <section className="relative flex items-center w-full bg-white">
      <div
        className="relative items-center w-full mx-auto  border-b-2 border-black 2xl:border-x-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:divide-x-2 divide-black">
          <div className="text-center lg:text-left p-8 lg:p-20 bg-lila-500">
            <p className="text-3xl lg:text-9xl tracking-tight font-medium text-black">
              FAQ
            </p>
            <p className="text-xl tracking-wide mt-4 text-black max-w-xs">
              Answers to commonly asked questions about our platform
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
