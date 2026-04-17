import React, { useState } from 'react';
import { aiAPI } from '../../services/api';

const AIAssistantFab = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askAssistant = async () => {
    if (!question.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await aiAPI.askAssistant(question.trim());
      setAnswer(response.data.answer);
    } catch (error) {
      setAnswer(error.response?.data?.message || 'Could not fetch AI response right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-x-4 bottom-24 z-50 max-h-[70vh] overflow-y-auto app-card p-4 shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[360px]">
          <h3 className="text-lg theme-heading">AI Assistant</h3>
          <p className="mb-3 mt-2 text-sm theme-text-secondary">
            Ask things like: &quot;What task should I do first?&quot;
          </p>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="app-input min-h-[104px] resize-y"
            placeholder="Why am I missing habits?"
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button className="btn-primary px-4 py-2 text-sm" onClick={askAssistant} disabled={loading}>
              {loading ? 'Asking...' : 'Ask AI'}
            </button>
            <button className="btn-outline px-3 py-2 text-sm" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          {answer && (
            <div className="app-surface mt-3 p-3">
              <p className="text-sm whitespace-pre-wrap theme-text-secondary">{answer}</p>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full btn-primary text-xl shadow-xl"
        aria-label="Open AI assistant"
        title="AI Assistant"
      >
        AI
      </button>
    </>
  );
};

export default AIAssistantFab;
