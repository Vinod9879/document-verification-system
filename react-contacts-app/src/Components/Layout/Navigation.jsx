import React from 'react';
import Button from '../Common/Button';

const Navigation = ({ 
  onEdit, 
  onView, 
  onDelete,
  onDocuments,
  showEdit = true, 
  showView = true, 
  showDelete = true,
  showDocuments = false,
  editLabel = 'Edit',
  viewLabel = 'View',
  deleteLabel = 'Delete',
  documentsLabel = 'Documents',
  size = 'sm'
}) => {
  return (
    <div className="admin-actions d-flex gap-2 justify-content-end">
      {showView && (
        <Button
          variant="info"
          size={size}
          onClick={onView}
          className="action-btn"
          style={{
            transition: 'all 0.3s ease',
            borderRadius: '20px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          📄 {viewLabel}
        </Button>
      )}
      {showEdit && (
        <Button
          variant="warning"
          size={size}
          onClick={onEdit}
          className="action-btn"
          style={{
            transition: 'all 0.3s ease',
            borderRadius: '20px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          ✏️ {editLabel}
        </Button>
      )}
      {showDocuments && (
        <Button
          variant="success"
          size={size}
          onClick={onDocuments}
          className="action-btn"
          style={{
            transition: 'all 0.3s ease',
            borderRadius: '20px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          📄 {documentsLabel}
        </Button>
      )}
      {showDelete && (
        <Button
          variant="danger"
          size={size}
          onClick={onDelete}
          className="action-btn"
          style={{
            transition: 'all 0.3s ease',
            borderRadius: '20px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          🗑️ {deleteLabel}
        </Button>
      )}
    </div>
  );
};

export default Navigation;
