// app/components/ClientWrapper.js

'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';

export default function ClientWrapper({ children }) {
  return (
    <SessionProvider>
      <Navbar />
      <main>{children}</main>
    </SessionProvider>
  );
}
