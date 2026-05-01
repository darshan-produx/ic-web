'use client';

import React from 'react';

// Static authentication provider — no API calls, always grants access.
// Credentials are validated in the login form (admin / @Admin001).
export function AuthenticationProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
