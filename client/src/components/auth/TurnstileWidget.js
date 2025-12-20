'use client';
import { Turnstile } from '@marsidev/react-turnstile';
import { useState } from 'react';

export default function TurnstileWidget({ onVerify, onError, onExpire }) {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (token) => {
    setIsVerified(true);
    if (onVerify) onVerify(token);
  };

  const handleError = () => {
    setIsVerified(false);
    if (onError) onError();
  };

  const handleExpire = () => {
    setIsVerified(false);
    if (onExpire) onExpire();
  };

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        onSuccess={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  );
}