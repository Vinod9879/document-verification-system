import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  headerActions,
  footer,
  ...props 
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle || headerActions) && (
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            {title && <h5 className="card-title mb-0">{title}</h5>}
            {subtitle && <h6 className="card-subtitle text-muted">{subtitle}</h6>}
          </div>
          {headerActions && (
            <div className="card-header-actions">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
