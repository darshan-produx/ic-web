export const dynamic = 'force-dynamic';

import { ToastContainer } from 'react-toastify';
import { AuthenticationProvider } from '../common/authentication-provider';
import { ReactQueryProvider } from '../common/react-query-provider';
import './global.css';
import 'react-toastify/dist/ReactToastify.css';
// import { matomoScript } from '../matomo/matomoScript';
import LogoutListener from '../common/components/LogoutListener';
import { Agentation } from 'agentation';
// import Script from 'next/script';

export const metadata = {
  title: 'ImpactCraft',
  description: 'ImpactCraft Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/x-icon"
          href="/favicon.png"
          sizes="42X42"
        />
        {/* <Script id="matomo-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: matomoScript }} /> */}
      </head>
      <body className='h-[calc(100vh-64px)] overflow-y-auto scroll bg-white' suppressHydrationWarning>
        <ReactQueryProvider>
          <AuthenticationProvider>
            {children}
            <ToastContainer />
            <LogoutListener />
            {process.env.NODE_ENV === 'development' && <Agentation />}
          </AuthenticationProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
