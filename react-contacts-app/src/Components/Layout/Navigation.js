import React from 'react';
import Button from '../Common/Button';

const Navigation = ({ 
  onEdit, 
  onView, 
  onDelete, 
  showEdit = true, 
  showView = true, 
  showDelete = true,
  editLabel = 'Edit',
  viewLabel = 'View',
  deleteLabel = 'Delete',
  size = 'sm'
}) => {
  return (
    <div className="admin-actions">
      {showView && (
        <Button
          variant="info"
          size={size}
          onClick={onView}
          className="me-1"
        >
          {viewLabel}
        </Button>
      )}
      {showEdit && (
        <Button
          variant="warning"
          size={size}
          onClick={onEdit}
          className="me-1"
        >
          {editLabel}
        </Button>
      )}
      {showDelete && (
        <Button
          variant="danger"
          size={size}
          onClick={onDelete}
        >
          {deleteLabel}
        </Button>
      )}
    </div>
  );
};

export default Navigation;
