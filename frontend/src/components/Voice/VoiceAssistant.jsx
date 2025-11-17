import React, { useState, useEffect } from 'react';

const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        setTranscript(command);
        handleVoiceCommand(command);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Parse commands
    if (lowerCommand.includes('add habit')) {
      const habitName = command.replace(/add habit/i, '').trim();
      if (habitName) {
        alert(`Would add habit: ${habitName}`);
        // In a real implementation, you would call the API here
      }
    } else if (lowerCommand.includes('add task')) {
      const taskName = command.replace(/add task/i, '').trim();
      if (taskName) {
        alert(`Would add task: ${taskName}`);
        // In a real implementation, you would call the API here
      }
    } else if (lowerCommand.includes('complete habit')) {
      const habitName = command.replace(/complete habit/i, '').trim();
      if (habitName) {
        alert(`Would complete habit: ${habitName}`);
      }
    } else if (lowerCommand.includes('complete task')) {
      const taskName = command.replace(/complete task/i, '').trim();
      if (taskName) {
        alert(`Would complete task: ${taskName}`);
      }
    } else {
      alert(`Command recognized: ${command}. This feature is in development.`);
    }
  };

  const startListening = () => {
    if (recognition) {
      setListening(true);
      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setListening(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        🎤 AI Voice Assistant
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
            listening 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-blue-500'
          }`}>
            <span className="text-6xl">🎤</span>
          </div>
        </div>

        <div className="mb-6">
          {listening ? (
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Listening... Speak your command
            </p>
          ) : (
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Click the button to start voice commands
            </p>
          )}
        </div>

        {transcript && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">You said:</p>
            <p className="text-gray-900 dark:text-white">{transcript}</p>
          </div>
        )}

        <div className="space-y-4">
          {!listening ? (
            <button
              onClick={startListening}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition"
            >
              Start Listening
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-lg transition"
            >
              Stop Listening
            </button>
          )}
        </div>

        <div className="mt-8 text-left">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Example commands:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li>"Add habit Drink Water"</li>
            <li>"Add task Finish project"</li>
            <li>"Complete habit Exercise"</li>
            <li>"Complete task Review code"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;

