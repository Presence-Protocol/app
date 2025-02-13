import { type Metadata } from 'next'
import clsx from 'clsx'
import { Bricolage_Grotesque } from 'next/font/google'
import '@/styles/globals.css'
import { AlephiumWalletProvider } from '@alephium/web3-react'
import { tokenFaucetConfig } from '@/services/utils'
import { WalletLoadingProvider } from '@/context/WalletLoadingContext'
import { ThemeProvider } from 'next-themes'

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s - Presence Protocol',
    default: 'Presence Protocol',
  },
  description:
    'Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you do not get audited.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx(
        'h-full scroll-smooth bg-background text-foreground antialiased',
        bricolageGrotesque.className
      )}
      suppressHydrationWarning
    >
      <body className="flex h-full flex-col bg-background transition-colors duration-200">
        <ThemeProvider attribute="class">
          <WalletLoadingProvider>
            <AlephiumWalletProvider 
              theme="retro" 
              network={tokenFaucetConfig.network} 
              addressGroup={tokenFaucetConfig.groupIndex}
            >
              {children}
            </AlephiumWalletProvider>
          </WalletLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
