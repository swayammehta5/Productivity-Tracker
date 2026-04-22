import React from 'react';
import AIAssistantPanel from './AIAssistantPanel';

const AITaskPrioritizer = () => {
  return (
    <div className="app-page pb-24">
      <AIAssistantPanel initialTab="task" embedded />
    </div>
  );
};

export default AITaskPrioritizer;
