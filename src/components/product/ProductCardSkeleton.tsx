import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <Skeleton className="mb-4" width="100%" height={200} rounded />
      <Skeleton className="mb-2" width="70%" height={24} rounded />
      <Skeleton className="mb-4" width="40%" height={20} rounded />
      <div className="space-y-2">
        <Skeleton width="100%" height={16} rounded />
        <Skeleton width="90%" height={16} rounded />
      </div>
      <div className="mt-4">
        <Skeleton width="30%" height={40} rounded />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
