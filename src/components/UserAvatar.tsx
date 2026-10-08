import React, { useState } from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'Student',
  avatarUrl,
  size = 'md',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const initial = (name || 'S').charAt(0).toUpperCase();

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs font-bold',
    md: 'w-9 h-9 text-sm font-black',
    lg: 'w-14 h-14 text-xl font-extrabold',
    xl: 'w-20 h-20 text-3xl font-black'
  };

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-rose-900/20 shadow-xs shrink-0 ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[#8a2410] text-[#ffc20e] flex items-center justify-center border-2 border-[#ffc20e]/40 shadow-xs shrink-0 select-none ${className}`}
    >
      {initial}
    </div>
  );
};
