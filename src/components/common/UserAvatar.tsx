import React, { useState } from 'react';
import { getInitials } from '../../utils/formatters.ts';
import { cn } from '../../utils/cn.ts';

export interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  role?: 'admin' | 'farmer' | 'customer';
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  avatarUrl,
  size = 'md',
  className,
  role,
  showOnlineIndicator = false,
  isOnline,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-semibold',
  }[size];

  const roleBorder = {
    admin: 'border-[#064e3b]',
    farmer: 'border-[#10b981]',
    customer: 'border-[#e2e8e5]',
  }[role || 'customer'];

  const initials = getInitials(name);
  const online = isOnline !== undefined ? isOnline : showOnlineIndicator;

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)}>
      {avatarUrl && !imageFailed ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImageFailed(true)}
          className={cn(
            'rounded-xl object-cover border bg-[#ffffff] shadow-xs',
            sizeClasses,
            roleBorder
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-xl bg-[#064e3b] text-[#ffffff] flex items-center justify-center font-sans font-medium border shadow-xs',
            sizeClasses,
            roleBorder
          )}
          title={name}
        >
          {initials}
        </div>
      )}

      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#10b981] shadow-xs" />
      )}
    </div>
  );
};
