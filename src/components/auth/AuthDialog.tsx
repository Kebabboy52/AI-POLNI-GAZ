import React, { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

enum AuthDialogMode {
  LOGIN = 'login',
  REGISTER = 'register',
}

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthDialogMode>(AuthDialogMode.LOGIN);

  const handleSwitchToRegister = () => {
    setMode(AuthDialogMode.REGISTER);
  };

  const handleSwitchToLogin = () => {
    setMode(AuthDialogMode.LOGIN);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[500px] p-0"
        hideCloseButton
      >
        {mode === AuthDialogMode.LOGIN ? (
          <LoginForm onRegisterClick={handleSwitchToRegister} />
        ) : (
          <RegisterForm onLoginClick={handleSwitchToLogin} />
        )}
      </DialogContent>
    </Dialog>
  );
}
