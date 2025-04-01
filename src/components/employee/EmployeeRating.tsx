import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  onRatingChange?: (newRating: number) => void;
  className?: string;
  readOnly?: boolean;
}

export function EmployeeRating({
  rating,
  maxRating = 5,
  size = 'md',
  onRatingChange,
  className,
  readOnly = false,
}: EmployeeRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (selectedRating: number) => {
    if (readOnly) return;
    onRatingChange?.(selectedRating);
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const starRating = i + 1;
        const isFilled = starRating <= rating;
        return (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
              !readOnly && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onClick={() => handleClick(starRating)}
          />
        );
      })}
    </div>
  );
}
