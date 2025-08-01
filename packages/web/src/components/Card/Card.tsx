import './Card.css';
import React, { HTMLAttributes, useMemo } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the card
   */
  children: React.ReactNode;
}

/**
 * Card component for displaying content in a container
 */
export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  const cardClasses = useMemo(() => ['card', className].join(' '), [className]);

  return (
    <div className={cardClasses} data-testid="card" {...props}>
      {children}
    </div>
  );
};

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Card header component
 */
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', ...props }) => {
  const headerClasses = useMemo(() => ['card-header', className].join(' '), [className]);

  return (
    <div className={headerClasses} data-testid="card-header" {...props}>
      {children}
    </div>
  );
};

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Card body component
 */
export const CardBody: React.FC<CardBodyProps> = ({ children, className = '', ...props }) => {
  const bodyClasses = useMemo(() => ['card-body', className].join(' '), [className]);

  return (
    <div className={bodyClasses} data-testid="card-body" {...props}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Card footer component
 */
export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', ...props }) => {
  const footerClasses = useMemo(() => ['card-footer', className].join(' '), [className]);

  return (
    <div className={footerClasses} data-testid="card-footer" {...props}>
      {children}
    </div>
  );
};

export default Card;
