let OpenAI;
let openai;

try {
  OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
  });
} catch (error) {
  console.log('OpenAI module not installed. Using rule-based suggestions only.');
  openai = null;
}

async function getHabitSuggestions(userHabits, userTasks) {
  if (!openai || !process.env.OPENAI_API_KEY) {
    // Fallback to rule-based suggestions if OpenAI is not available
    return getRuleBasedSuggestions(userHabits, userTasks);
  }

  try {
    const prompt = `Analyze the following user habits and tasks, and suggest 3-5 new healthy habits or improvements to existing ones.

Current Habits:
${userHabits.map(h => `- ${h.name} (Frequency: ${h.frequency}, Streak: ${h.currentStreak})`).join('\n')}

Current Tasks:
${userTasks.map(t => `- ${t.title} (Priority: ${t.priority}, Status: ${t.status})`).join('\n')}

Provide suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "new_habit" | "improvement",
      "title": "suggestion title",
      "description": "detailed description",
      "category": "Health" | "Fitness" | "Productivity" | "Mindfulness" | "Learning" | "Social" | "Finance",
      "reason": "why this suggestion"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a productivity and habit coaching assistant. Provide practical, actionable suggestions." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getRuleBasedSuggestions(userHabits, userTasks);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getRuleBasedSuggestions(userHabits, userTasks);
  }
}

function getRuleBasedSuggestions(userHabits, userTasks) {
  const suggestions = [];
  const habitNames = userHabits.map(h => h.name.toLowerCase());
  
  if (!habitNames.some(h => h.includes('water') || h.includes('drink'))) {
    suggestions.push({
      type: 'new_habit',
      title: 'Drink Water Regularly',
      description: 'Stay hydrated by drinking 8 glasses of water daily',
      category: 'Health',
      reason: 'Hydration is essential for overall health and productivity'
    });
  }
  
  if (!habitNames.some(h => h.includes('exercise') || h.includes('workout') || h.includes('walk'))) {
    suggestions.push({
      type: 'new_habit',
      title: 'Daily Exercise',
      description: 'Incorporate at least 30 minutes of physical activity',
      category: 'Fitness',
      reason: 'Regular exercise boosts energy and mental clarity'
    });
  }
  
  if (!habitNames.some(h => h.includes('meditate') || h.includes('mindfulness'))) {
    suggestions.push({
      type: 'new_habit',
      title: 'Mindfulness Practice',
      description: 'Practice 10 minutes of meditation or mindfulness daily',
      category: 'Mindfulness',
      reason: 'Mindfulness reduces stress and improves focus'
    });
  }
  
  if (userTasks.filter(t => t.status === 'Pending').length > 10) {
    suggestions.push({
      type: 'improvement',
      title: 'Prioritize Tasks',
      description: 'Break down large tasks into smaller, manageable pieces',
      category: 'Productivity',
      reason: 'You have many pending tasks. Prioritization will help you stay focused'
    });
  }
  
  return { suggestions: suggestions.slice(0, 5) };
}

async function getProductivityCoachResponse(userMessage, userProgress) {
  if (!openai || !process.env.OPENAI_API_KEY) {
    return {
      response: "I'm here to help you stay motivated! Keep up the great work on your habits and tasks. Remember: consistency is key to building lasting habits."
    };
  }

  try {
    const prompt = `You are a friendly productivity coach. The user has the following progress:
- Habits: ${userProgress.habitsCount || 0} total habits
- Tasks Completed: ${userProgress.tasksCompleted || 0}
- Current Streak: ${userProgress.currentStreak || 0} days

User message: ${userMessage}

Provide a motivational and helpful response (max 200 words).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a friendly, motivational productivity coach. Be encouraging and practical." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    return {
      response: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      response: "I'm here to help you stay motivated! Keep up the great work on your habits and tasks."
    };
  }
}

module.exports = {
  getHabitSuggestions,
  getProductivityCoachResponse
};

