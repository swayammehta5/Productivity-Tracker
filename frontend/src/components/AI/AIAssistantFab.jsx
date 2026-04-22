import React, { useState } from 'react';
import AIAssistantPanel from './AIAssistantPanel';

const AIAssistantFab = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <AIAssistantPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[110] h-14 w-14 rounded-full btn-primary text-xl shadow-xl"
        aria-label="Open AI assistant"
        title="AI Assistant"
      >
        AI
      </button>
    </>
  );
};

export default AIAssistantFab;
