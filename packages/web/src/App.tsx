import './App.css';
import React, { useCallback, useState } from 'react';
import { Memo } from '@voice-memos/common';
import { MemoList, MemoView, MemoForm, Button } from '@/components';
import MemoProvider from '@/contexts/MemoProvider';

const buttonContainerStyle = {
  padding: '1rem',
  maxWidth: '800px',
  margin: '1rem auto',
  textAlign: 'right',
} as React.CSSProperties;

function App() {
  // State to track the currently selected memo and UI mode
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [mode, setMode] = useState<'list' | 'view' | 'create' | 'edit'>('list');

  const handleMemoSelect = useCallback((memo: Memo) => {
    setSelectedMemo(memo);
    setMode('view');
  }, []);

  const handleCreateClick = useCallback(() => {
    setSelectedMemo(null);
    setMode('create');
  }, []);

  const handleEditClick = useCallback((memo: Memo) => {
    setSelectedMemo(memo);
    setMode('edit');
  }, []);

  const handleDeleteComplete = useCallback(() => {
    setSelectedMemo(null);
    setMode('list');
  }, []);

  const handleFormSubmit = useCallback(() => setMode('list'), []);

  const handleFormCancel = useCallback(() => setMode('list'), []);

  const handleBackToList = useCallback(() => {
    setSelectedMemo(null);
    setMode('list');
  }, []);

  return (
    <div className="App">
      <MemoProvider>
        <header className="App-header">
          <h1>Voice Memos</h1>
        </header>

        <main className="App-main">
          {mode === 'list' && (
            <div className="list-container">
              <div style={buttonContainerStyle}>
                <Button onClick={handleCreateClick} variant="primary" size="medium">
                  Create New Memo
                </Button>
              </div>
              <MemoList onMemoSelect={handleMemoSelect} />
            </div>
          )}

          {mode === 'view' && selectedMemo && (
            <MemoView
              memoId={selectedMemo.id}
              onEdit={handleEditClick}
              onDelete={handleDeleteComplete}
              onBack={handleBackToList}
            />
          )}

          {mode === 'create' && (
            <MemoForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
          )}

          {mode === 'edit' && selectedMemo && (
            <MemoForm memo={selectedMemo} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
          )}
        </main>
      </MemoProvider>
    </div>
  );
}

export default App;
