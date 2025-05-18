import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div 
      className={[
        'bg-white dark:bg-dark-card shadow-lg rounded-lg overflow-hidden',
        className
      ].join(' ').trim()}
    >
      {title && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text">
            {title}
          </h3>
        </div>
      )}
      <div className={`px-4 py-5 sm:p-6`}>
        {children}
      </div>
    </div>
  );
};

export default Card;