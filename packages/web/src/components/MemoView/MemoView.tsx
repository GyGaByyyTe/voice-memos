import './MemoView.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Memo, formatDate } from '@voice-memos/common';
import { Button, IconButton } from '@/components';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { useMemoContext } from '@/contexts/MemoContext';

export interface MemoViewProps {
  /**
   * The ID of the memo to display
   */
  memoId: string;
  /**
   * Callback function called when the edit button is clicked
   */
  onEdit?: (memo: Memo) => void;
  /**
   * Callback function called after the memo is deleted
   */
  onDelete?: () => void;
  /**
   * Callback function called when the back button is clicked
   */
  onBack?: () => void;
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * MemoView component displays a detailed view of a memo
 */
export const MemoView: React.FC<MemoViewProps> = ({
  memoId,
  onEdit,
  onDelete,
  onBack,
  className = '',
}) => {
  const [memo, setMemo] = useState<Memo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { getMemoById, deleteMemo } = useMemoContext();

  const formattedCreatedAt = useMemo(
    () => (memo?.createdAt ? formatDate(memo.createdAt) : ''),
    [memo?.createdAt]
  );

  const formattedUpdatedAt = useMemo(
    () => (memo?.updatedAt ? formatDate(memo.updatedAt) : ''),
    [memo?.updatedAt]
  );

  const showUpdatedAt = useMemo(
    () => memo && memo.createdAt.getTime() !== memo.updatedAt.getTime(),
    [memo]
  );

  // Fetch memo on the component mount or when memoId changes
  useEffect(() => {
    const fetchMemo = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedMemo = await getMemoById(memoId);

        if (fetchedMemo) {
          setMemo(fetchedMemo);
        } else {
          setError('Memo not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch memo');
      } finally {
        setLoading(false);
      }
    };

    fetchMemo();
  }, [memoId, getMemoById]);

  const handleDelete = useCallback(async () => {
    if (!memo) return;

    try {
      setIsDeleting(true);
      const success = await deleteMemo(memo.id);

      if (success) {
        if (onDelete) {
          onDelete();
        }
      } else {
        setError('Failed to delete memo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete memo');
    } finally {
      setIsDeleting(false);
    }
  }, [memo, deleteMemo, onDelete]);

  const handleEdit = useCallback(() => {
    if (memo && onEdit) {
      onEdit(memo);
    }
  }, [memo, onEdit]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  if (loading) {
    return <div className="memo-view-loading">Loading memo...</div>;
  }

  if (error) {
    return <div className="memo-view-error">Error: {error}</div>;
  }

  if (!memo) {
    return <div className="memo-view-not-found">Memo not found</div>;
  }

  return (
    <div className={`memo-view ${className}`} data-testid="memo-view">
      <Card className="memo-view-card">
        <CardHeader className="memo-view-header">
          <div className="memo-view-header-left">
            {onBack && (
              <IconButton
                onClick={handleBack}
                className="memo-view-back-button"
                aria-label="Back"
                data-testid="back-button"
              >
                ←
              </IconButton>
            )}
            <span className="memo-view-id">ID: {memo.id}</span>
          </div>
          <div className="memo-view-header-right">
            {onEdit && (
              <IconButton
                onClick={handleEdit}
                variant="primary"
                className="memo-view-edit-button"
                aria-label="Edit memo"
                data-testid="edit-button"
              >
                ✎
              </IconButton>
            )}
          </div>
        </CardHeader>

        <CardBody className="memo-view-body">
          <div className="memo-view-text">{memo.text}</div>
        </CardBody>

        <CardFooter className="memo-view-footer">
          <div className="memo-view-dates">
            <span className="memo-view-created-at">Created: {formattedCreatedAt}</span>
            {showUpdatedAt && (
              <span className="memo-view-updated-at">Updated: {formattedUpdatedAt}</span>
            )}
          </div>

          <Button
            onClick={handleDelete}
            variant="secondary"
            disabled={isDeleting}
            className="memo-view-delete-button"
            data-testid="delete-button"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default React.memo(MemoView);
