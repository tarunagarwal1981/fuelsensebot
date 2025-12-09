'use client';

export default function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>
  );
}

