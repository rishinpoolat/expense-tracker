import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const GOOGLE_CLIENT_ID = '15641208698-68k4oii86if3ssqkkigp5bv9rrtdaakp.apps.googleusercontent.com';

interface Props {
  onError: (message: string) => void;
}

const GoogleSignInButton: React.FC<Props> = ({ onError }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as Record<string, any>)['google'];
    if (!google || !buttonRef.current) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        try {
          await authService.googleLogin(response.credential);
          navigate('/dashboard');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
          onError(message);
        }
      },
    });

    google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: buttonRef.current.offsetWidth || 340,
      text: 'signin_with',
    });
  }, [navigate, onError]);

  return <div ref={buttonRef} className="google-button-container" />;
};

export default GoogleSignInButton;
