import React from 'react';
import { Ake3DCompanion } from '../Ake3DCompanion';

interface KinbodyCompanionProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string | React.ReactNode;
  showBubble?: boolean;
  className?: string;
  animateBlink?: boolean;
  align?: 'center' | 'bottom-right';
}

export const KinbodyCompanion: React.FC<KinbodyCompanionProps> = ({
  size = 'lg',
  message,
  showBubble = true,
  className = '',
  align = 'bottom-right',
}) => {
  return (
    <Ake3DCompanion
      size={size}
      message={message}
      showBubble={showBubble}
      className={`${align === 'bottom-right' ? 'items-end' : 'items-center'} ${className}`}
      interactive={true}
      autoWave={true}
    />
  );
};
