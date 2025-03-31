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
    'Create unique events where participants can mint verifiable proof of their attendance on Alephium.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'https://presenceprotocol.com'),
  twitter: {
    card: 'summary_large_image',
    title: 'Presence Protocol',
    description: 'Create unique events where participants can mint verifiable proof of their attendance on Alephium.',
    images: [{
      url: '/images/og-image.png',
      width: 1200,
      height: 530,
      alt: 'Presence Protocol - Proof You Were There.'
    }],
    creator: '@presenceproto',
  },
  openGraph: {
    title: 'Presence Protocol',
    description: 'Create unique events where participants can mint verifiable proof of their attendance on Alephium.',
    images: [{
      url: '/images/og-image.png',
      width: 1200,
      height: 530,
      alt: 'Presence Protocol - Proof You Were There.'
    }],
    type: 'website',
    siteName: 'Presence Protocol',
  },
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
        {/* <ThemeProvider attribute="class"> */}
          <WalletLoadingProvider>
            <AlephiumWalletProvider 
              theme="retro" 
              network={tokenFaucetConfig.network} 
              addressGroup={tokenFaucetConfig.groupIndex}
            >
              {children}
            </AlephiumWalletProvider>
          </WalletLoadingProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
