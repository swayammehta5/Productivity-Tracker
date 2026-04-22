import React from 'react';
import AIAssistantPanel from './AIAssistantPanel';

const AIWeeklyInsights = () => {
  return (
    <div className="app-page pb-24">
      <AIAssistantPanel initialTab="weekly" embedded />
    </div>
  );
};

export default AIWeeklyInsights;
