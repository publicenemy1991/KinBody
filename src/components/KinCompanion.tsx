import React from 'react';
import { Ake3DCompanion } from './Ake3DCompanion';

interface KinCompanionProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string | React.ReactNode;
  submessage?: string;
  className?: string;
  showBubble?: boolean;
}

export const KinCompanion: React.FC<KinCompanionProps> = ({
  size = 'md',
  message,
  submessage,
  className = '',
  showBubble = true,
}) => {
  return (
    <Ake3DCompanion
      size={size}
      message={message}
      submessage={submessage}
      showBubble={showBubble}
      className={className}
      interactive={true}
    />
  );
};
