import React from 'react';
import { KinCompanion } from '../KinCompanion';

interface KinbodyCompanionProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  message?: string | React.ReactNode;
  submessage?: string;
  showBubble?: boolean;
  className?: string;
  animateBlink?: boolean;
  align?: 'center' | 'bottom-right';
  alignBubble?: 'center' | 'left' | 'right';
  enableMotionBlur?: boolean;
}

export const KinbodyCompanion: React.FC<KinbodyCompanionProps> = (props) => {
  return <KinCompanion {...props} />;
};

