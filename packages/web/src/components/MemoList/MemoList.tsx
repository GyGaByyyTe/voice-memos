import './MemoList.css';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Memo } from '@voice-memos/common';
import { formatDate, truncateText } from '@voice-memos/common';
import { Button, Input, Select } from '@/components';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { useMemoContext } from '@/contexts/MemoContext';

type SortOption = 'createdAt' | 'updatedAt' | 'text';
type SortDirection = 'asc' | 'desc';

export interface MemoListProps {
  onMemoSelect?: (memo: Memo) => void;
  className?: string;
}

const sortOptions = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'text', label: 'Text' },
];

/**
 * Component displays a list of all memos
 */
export const MemoList: React.FC<MemoListProps> = ({ onMemoSelect, className = '' }) => {
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchText, setSearchText] = useState<string>('');

  const {
    state: { memos, loading, error },
    getAllMemos,
  } = useMemoContext();

  useEffect(() => {
    getAllMemos();
  }, [getAllMemos]);

  // Filter and sort memos based on search text and sort options
  const filteredAndSortedMemos = useMemo(() => {
    if (!memos.length) return [];

    // First filter by search text
    const filtered =
      searchText.trim() === ''
        ? memos
        : memos.filter((memo) => memo.text.toLowerCase().includes(searchText.toLowerCase()));

    // Then sort the filtered results
    return filtered.toSorted((a, b) => {
      let comparison = 0;

      if (sortOption === 'text') {
        comparison = a.text.localeCompare(b.text);
      } else if (sortOption === 'createdAt') {
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
      } else if (sortOption === 'updatedAt') {
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [memos, searchText, sortOption, sortDirection]);

  const toggleSortDirection = useCallback(
    () => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc')),
    []
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setSortOption(e.target.value as SortOption),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value),
    []
  );

  const handleSearchClear = useCallback(() => setSearchText(''), []);

  if (loading) {
    return <div className="memo-list-container memo-list-loading">Loading memos...</div>;
  }

  if (error) {
    return <div className="memo-list-container memo-list-error">Error: {error}</div>;
  }

  if (memos.length === 0) {
    return (
      <div className="memo-list-container memo-list-empty">
        No memos found. Create your first memo!
      </div>
    );
  }

  return (
    <div className={`memo-list-container ${className}`}>
      <div className="memo-list-controls">
        <div className="memo-list-filter">
          <Input
            placeholder="Search memos..."
            value={searchText}
            onChange={handleSearchChange}
            size="small"
            className="memo-list-search"
          />
          {searchText && (
            <Button
              onClick={handleSearchClear}
              variant="text"
              size="small"
              className="memo-list-clear-search"
            >
              Clear
            </Button>
          )}
        </div>
        <div className="memo-list-sort">
          <Select
            options={sortOptions}
            value={sortOption}
            onChange={handleSortChange}
            label="Sort by"
            size="small"
          />
          <Button onClick={toggleSortDirection} variant="secondary">
            {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </Button>
        </div>
      </div>

      <div className="memo-list-results">
        {filteredAndSortedMemos.length === 0 && searchText ? (
          <div className="memo-list-no-results">No memos match your search criteria.</div>
        ) : (
          <div className="memo-list">
            {filteredAndSortedMemos.map((memo) => (
              <MemoCard key={memo.id} memo={memo} onSelect={onMemoSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface MemoCardProps {
  memo: Memo;
  onSelect?: (memo: Memo) => void;
}
/**
 * MemoCard component displays a single memo in a card
 */
const MemoCard: React.FC<MemoCardProps> = ({ memo, onSelect }) => {
  const cardStyle = useMemo(() => ({ cursor: onSelect ? 'pointer' : 'default' }), [onSelect]);

  const cardText = useMemo(() => truncateText(memo.text, 150), [memo.text]);

  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(memo);
    }
  }, [onSelect, memo]);

  return (
    <Card className="memo-card" data-testid="memo-card" onClick={handleClick} style={cardStyle}>
      <CardHeader className="memo-card-header">
        <span className="memo-card-id">ID: {memo.id}</span>
      </CardHeader>
      <CardBody className="memo-card-body">
        <p className="memo-card-text">{cardText}</p>
      </CardBody>
      <CardFooter className="memo-card-footer">
        <div className="memo-card-dates">
          <span className="memo-card-created">Created: {formatDate(memo.createdAt)}</span>
          {memo.createdAt.getTime() !== memo.updatedAt.getTime() && (
            <span className="memo-card-updated">Updated: {formatDate(memo.updatedAt)}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MemoList;
