import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  circle = false,
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height || '1rem',
  };

  return (
    <div
      style={style}
      className={`
        animate-pulse bg-gray-200 dark:bg-gray-700
        ${rounded ? 'rounded-md' : ''}
        ${circle ? 'rounded-full' : ''}
        ${className}
      `}
    />
  );
};
