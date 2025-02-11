import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface MintSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  nftImage: string | null
  nftTitle: string
  eventDate: string
}

export default function MintSuccessModal({ isOpen, onClose, nftImage, nftTitle, eventDate }: MintSuccessModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all border-2 border-black">
                <h2 className="text-2xl font-medium leading-6 text-black text-center mb-8">
                You've Minted a New Presence!
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
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
