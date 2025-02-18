import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import Image from 'next/image'

interface MintSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  nftImage: string | null
  nftTitle: string
  eventDate: string
  isMinting?: boolean
}

export default function MintSuccessModal({ isOpen, onClose, nftImage, nftTitle, eventDate, isMinting }: MintSuccessModalProps) {
  const quotes = [
    "We do not remember days, we remember moments. — Cesare Pavese",
    "A good friend knows all your best stories. A best friend has lived them with you. — Unknown",
    "There are short-cuts to happiness, and dancing is one of them. — Vicki Baum",
    "Wherever you go, go with all your heart. — Confucius",
    "Life is made of small moments like this. — Unknown",
    "Live for today, plan for tomorrow, party tonight. — Drake",
    "Time you enjoy wasting is not wasted time. — Marthe Troly-Curtin",
    "A little party never killed nobody. — Fergie",
    "Enjoy the little things in life, for one day you may look back and realize they were the big things. — Robert Brault",
    "The best nights are usually unplanned, random, and spontaneous. — Unknown",
    "Some people look for a beautiful place, others make a place beautiful. — Hazrat Inayat Khan",
    "Friendship isn't about whom you have known the longest... It's about who walked into your life and said, 'I'm here for you,' and proved it. — Unknown",
    "You gotta have life your way. If you ain't losing your mind, you ain't partying right. — Young Jeezy",
    "There's no time to be bored in a world as beautiful as this. — Unknown",
    "In the end, we only regret the chances we didn't take. — Lewis Carroll",
    "It's not what we have in life, but who we have in our life that matters. — Unknown"
  ];

  const [randomQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <Transition appear show={isOpen || isMinting} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={isMinting ? () => {} : onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-gray-900/50" />
          </div>
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {isMinting ? (
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all border-2 border-black">
                  <div className="flex flex-col items-center justify-center gap-6">
                    <div className="animate-spin">
                      <Image 
                        src="/images/blob5.svg"
                        alt="Minting..."
                        width={64}
                        height={64}
                        className="opacity-70"
                        priority
                      />
                    </div>
                    <h2 className="text-xl font-medium text-black text-center">
                      Minting your Presence...
                    </h2>
                    <p className="text-sm text-gray-600 text-center">
                      This will take a minute
                    </p>
                    <p className="text-sm text-gray-600 text-center italic max-w-sm">
                      "{randomQuote}"
                    </p>
                  </div>
                </Dialog.Panel>
              ) : (
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all border-2 border-black">
                  <h2 className="text-xl font-medium leading-6 text-black text-center mb-6">
                  You've Minted a New Presence! 🎉
                  </h2>

                  <div className="mt-4 flex flex-col items-center">
                    <div className="w-48 h-48 rounded-xl border-2 border-black shadow bg-white mb-4">
                      <img 
                        src={nftImage ?? undefined}
                        alt={nftTitle} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <h4 className="text-lg font-medium text-black mb-2">{nftTitle}</h4>

                    <p className="text-sm text-gray-600 mb-6">{eventDate}</p>

                    <div className="flex flex-row gap-4 mb-6">
                    <button
                      type="button"
                      className="text-black items-center text-xs shadow shadow-black font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-1.5 rounded-lg tracking-wide focus:translate-y-1 hover:text-lila-800"
                      onClick={onClose}
                    >
                      View onchain
                    </button>

                    <button
                      type="button"
                      className="text-black items-center text-xs shadow shadow-black font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-1.5 rounded-lg tracking-wide focus:translate-y-1 hover:text-lila-800"
                      onClick={onClose}
                    >
                      Share event
                    </button>

              

                    </div>
                    
                    <p className="text-sm text-gray-600 text-center mb-6">
                      You can find your new Presence in your connected wallet. View your collection anytime by visiting the "My Presence" section or visit it onchain by clicking the button below.
                    </p>

       

                    <button
                      type="button"
                      className="text-black items-center w-full shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-2 rounded-xl tracking-wide focus:translate-y-1 hover:text-lila-800"
                      onClick={onClose}
                    >
                      Close
                    </button>

                  
                  </div>
                </Dialog.Panel>
              )}
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
