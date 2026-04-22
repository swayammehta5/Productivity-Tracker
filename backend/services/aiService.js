const OPENAI_TIMEOUT_MS = 12000;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const sanitizeText = (value, maxLength = 200) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const buildDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const completionRate = (completed, total) => (total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0);

const tryOpenAIJson = async (prompt, fallbackPayload) => {
  if (!process.env.OPENAI_API_KEY) {
    return { source: 'rule-based', payload: fallbackPayload };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Return valid JSON only. Do not include markdown fences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      return { source: 'rule-based', payload: fallbackPayload };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return { source: 'rule-based', payload: fallbackPayload };
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      return { source: 'rule-based', payload: fallbackPayload };
    }

    return { source: 'openai', payload: parsed };
  } catch (error) {
    return { source: 'rule-based', payload: fallbackPayload };
  } finally {
    clearTimeout(timeout);
  }
};

const analyzeHabit = (habit) => {
  const today = new Date();
  const last28 = [];
  for (let i = 0; i < 28; i += 1) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = buildDateKey(d);
    if (key) {
      last28.push(key);
    }
  }

  const completedSet = new Set(
    (habit.completions || [])
      .filter((c) => c.completed)
      .map((c) => buildDateKey(c.date))
      .filter(Boolean)
  );

  const completed = last28.filter((key) => completedSet.has(key)).length;
  const missedDays = last28.length - completed;

  return {
    id: String(habit._id),
    name: sanitizeText(habit.name, 60),
    completionRate: completionRate(completed, last28.length),
    currentStreak: habit.currentStreak || 0,
    missedDays
  };
};

const getHabitAdvice = async (userData) => {
  const habits = (userData?.habits || []).map(analyzeHabit);

  if (!habits.length) {
    return {
      source: 'rule-based',
      insight: 'No habits found yet.',
      suggestions: ['Add at least one daily habit so the assistant can generate meaningful advice.'],
      stats: { habits: [] }
    };
  }

  const weakest = habits.slice().sort((a, b) => a.completionRate - b.completionRate)[0];
  const fallback = {
    insight: `${weakest.name} is the biggest blocker with ${weakest.completionRate}% completion and ${weakest.missedDays} missed days in the last 28 days.`,
    suggestions: [
      weakest.completionRate < 50
        ? `Reduce ${weakest.name} to a smaller daily target for 7 days.`
        : `Keep ${weakest.name} at the same level and anchor it to a fixed time.`,
      `Set a reminder right before your most common miss window for ${weakest.name}.`,
      `Protect your streak by doing a minimum version when time is limited.`
    ],
    stats: { habits }
  };

  const prompt = `Analyze the user's habit data and return JSON with keys: insight (string), suggestions (array of 3 strings), stats (object containing "habits" array).
Each habit item has: Habit, Completion Rate, Current Streak, Missed Days.
Data:
${JSON.stringify(habits, null, 2)}

Constraints:
- Use only provided data.
- Give specific reason for failure for weakest habit.
- Give actionable suggestions.
- Include a short motivational line inside one suggestion.
- DO NOT give generic advice.`;

  const aiResult = await tryOpenAIJson(prompt, fallback);
  return { source: aiResult.source, ...fallback, ...aiResult.payload };
};

const taskScore = (task) => {
  if (task.status === 'Completed') {
    return -1;
  }

  const now = Date.now();
  const dueTs = task.dueDate ? new Date(task.dueDate).getTime() : null;
  const daysLeft = dueTs ? Math.ceil((dueTs - now) / (1000 * 60 * 60 * 24)) : null;

  const priorityWeight = task.priority === 'High' ? 35 : task.priority === 'Medium' ? 20 : 10;
  const deadlineWeight =
    daysLeft === null ? 8 :
    daysLeft < 0 ? 45 :
    daysLeft === 0 ? 40 :
    daysLeft === 1 ? 32 :
    daysLeft <= 3 ? 24 : 10;

  return priorityWeight + deadlineWeight;
};

const getTaskPrioritization = async (tasks) => {
  const pending = (tasks || []).filter((task) => task.status !== 'Completed');
  const priorityOrder = pending
    .map((task) => ({
      id: String(task._id),
      title: sanitizeText(task.title, 90),
      status: task.status,
      priority: task.priority,
      deadline: task.dueDate,
      score: taskScore(task)
    }))
    .sort((a, b) => b.score - a.score);

  const fallback = {
    insight: priorityOrder.length
      ? `Top priority is "${priorityOrder[0].title}" based on deadline pressure and priority level.`
      : 'No pending tasks found.',
    suggestions: priorityOrder.length
      ? [
          'Start with the first two tasks in the ordered list.',
          'Batch low-priority tasks after urgent deadlines.',
          'Recheck due dates daily to prevent overdue spillover.'
        ]
      : ['Create at least one pending task with a due date to get prioritized guidance.'],
    priorityOrder,
    stats: {
      totalTasks: tasks?.length || 0,
      pendingTasks: pending.length
    }
  };

  const prompt = `Sort tasks based on Deadline, Priority, Completion status.
Return JSON with keys: insight (string), suggestions (array up to 3 strings), priorityOrder (array), stats (object).
Data:
${JSON.stringify(priorityOrder, null, 2)}

Constraints:
- Keep the same ordering intent.
- Explain reason for ordering using due date and priority.
- Do not invent tasks.`;

  const aiResult = await tryOpenAIJson(prompt, fallback);
  return { source: aiResult.source, ...fallback, ...aiResult.payload };
};

const getWeeklyInsights = async (stats) => {
  const safeStats = {
    totalTasksCompleted: stats?.totalTasksCompleted || 0,
    missedHabits: stats?.missedHabits || 0,
    bestDay: stats?.bestDay || 'N/A',
    worstDay: stats?.worstDay || 'N/A',
    completionRate: stats?.completionRate || 0
  };

  const fallback = {
    insight: `You completed ${safeStats.totalTasksCompleted} tasks this week with ${safeStats.completionRate}% task completion.`,
    suggestions: [
      safeStats.missedHabits > 4
        ? 'Missed habits are high; shrink daily goals temporarily.'
        : 'Habit misses are manageable; keep your current routine.',
      `Best day: ${safeStats.bestDay}. Replicate that schedule on your weakest day.`,
      'Plan tomorrow tonight with top 3 tasks to reduce context switching.'
    ],
    stats: safeStats
  };

  const prompt = `Analyze weekly stats:
- Total tasks completed
- Missed habits
- Best day
- Worst day

Return JSON with keys:
insight (string), suggestions (array with exactly 3 insights + 1 improvement suggestion combined in concise bullets), stats (object).

Data:
${JSON.stringify(safeStats, null, 2)}

Constraints:
- Must be data-driven.
- Must mention best and worst day.
- Must include one clear improvement action.
- No generic advice.`;

  const aiResult = await tryOpenAIJson(prompt, fallback);
  return { source: aiResult.source, ...fallback, ...aiResult.payload };
};

module.exports = {
  getHabitAdvice,
  getTaskPrioritization,
  getWeeklyInsights
};
