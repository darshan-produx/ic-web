'use client';
import { ExtAuthenticationProvider } from '../../common/ext-authentication-provider';
import Header from '../navBar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ExtAuthenticationProvider>{children}</ExtAuthenticationProvider>;
}
