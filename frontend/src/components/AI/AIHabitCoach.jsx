import React from 'react';
import AIAssistantPanel from './AIAssistantPanel';

const AIHabitCoach = () => {
  return (
    <div className="app-page pb-24">
      <AIAssistantPanel initialTab="habit" embedded />
    </div>
  );
};

export default AIHabitCoach;
