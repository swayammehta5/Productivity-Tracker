const express = require('express');
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const Task = require('../models/Task');

const router = express.Router();

const OPENAI_TIMEOUT_MS = 12000;
const MAX_OPENAI_RESPONSE_TOKENS = 180;
const MAX_ASSISTANT_QUESTION_LENGTH = 280;
const HABIT_QUERY_FIELDS = '_id name frequency goal currentStreak longestStreak completions';
const TASK_QUERY_FIELDS = '_id title dueDate priority status category createdAt';

router.use(auth);

const buildDateKey = (value) => {
  const date = new Date(value);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const normalizeId = (value) => String(value);

const sanitizeText = (value, maxLength = 160) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const sanitizeMultilineText = (value, maxLength = 900) =>
  String(value || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim()
    .slice(0, maxLength);

const analyzeHabitData = (habits) => {
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return habits.map((habit) => {
    const completionMap = new Map();
    (habit.completions || []).forEach((completion) => {
      if (completion.completed) {
        completionMap.set(buildDateKey(completion.date), true);
      }
    });

    const windowDays = 28;
    const dayStats = dayNames.reduce((acc, day) => ({ ...acc, [day]: { hit: 0, miss: 0 } }), {});
    let completedCount = 0;
    const missedKeys = [];

    for (let i = 0; i < windowDays; i += 1) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - i);
      const key = buildDateKey(date);
      const dayName = dayNames[date.getUTCDay()];
      const done = completionMap.has(key);

      if (done) {
        completedCount += 1;
        dayStats[dayName].hit += 1;
      } else {
        missedKeys.push(key);
        dayStats[dayName].miss += 1;
      }
    }

    const completionRate = windowDays > 0 ? (completedCount / windowDays) * 100 : 0;
    const weakestDay = Object.entries(dayStats).sort((a, b) => b[1].miss - a[1].miss)[0]?.[0] || null;
    const strongestDay = Object.entries(dayStats).sort((a, b) => b[1].hit - a[1].hit)[0]?.[0] || null;

    return {
      id: normalizeId(habit._id),
      name: sanitizeText(habit.name, 60),
      frequency: habit.frequency,
      goal: habit.goal,
      currentStreak: habit.currentStreak || 0,
      longestStreak: habit.longestStreak || 0,
      completionRate: Number(completionRate.toFixed(1)),
      missedDays: missedKeys.length,
      strongestDay,
      weakestDay
    };
  });
};

const buildHabitRecommendations = (analyzedHabits) => {
  if (!analyzedHabits.length) {
    return ['Add a habit to unlock personalized coaching suggestions.'];
  }

  return analyzedHabits.map((habit) => {
    const weakestDay = habit.weakestDay || 'your toughest day';
    const strongestDay = habit.strongestDay || 'your best rhythm';

    if (habit.completionRate < 50) {
      return `You miss "${habit.name}" often, especially on ${weakestDay}. Try attaching it to an existing routine.`;
    }

    if (habit.completionRate >= 85) {
      return `"${habit.name}" is highly consistent (${habit.completionRate}%). Consider increasing your target slightly.`;
    }

    return `"${habit.name}" is steady. Protect your ${strongestDay} momentum and plan for ${weakestDay}.`;
  });
};

const rankTasks = (tasks) => {
  const now = Date.now();

  return tasks
    .filter((task) => task.status !== 'Completed')
    .map((task) => {
      const dueTs = task.dueDate ? new Date(task.dueDate).getTime() : null;
      const daysLeft = dueTs ? Math.ceil((dueTs - now) / (1000 * 60 * 60 * 24)) : null;
      const priorityWeight = task.priority === 'High' ? 35 : task.priority === 'Medium' ? 20 : 10;
      const urgencyWeight =
        daysLeft === null ? 8 :
        daysLeft < 0 ? 45 :
        daysLeft === 0 ? 40 :
        daysLeft === 1 ? 32 :
        daysLeft <= 3 ? 22 : 10;
      const score = priorityWeight + urgencyWeight;

      let reasoning = `Priority ${task.priority}`;
      if (daysLeft !== null) {
        if (daysLeft < 0) {
          reasoning += ', overdue';
        } else if (daysLeft === 0) {
          reasoning += ', due today';
        } else if (daysLeft === 1) {
          reasoning += ', deadline is tomorrow';
        } else {
          reasoning += `, due in ${daysLeft} days`;
        }
      } else {
        reasoning += ', no due date set';
      }

      return {
        id: normalizeId(task._id),
        title: sanitizeText(task.title, 90),
        category: sanitizeText(task.category || 'General', 40),
        priority: task.priority,
        dueDate: task.dueDate,
        score,
        reasoning
      };
    })
    .sort((a, b) => b.score - a.score);
};

const buildTaskExplanation = (rankedTasks) => {
  if (!rankedTasks.length) {
    return 'You have no pending tasks to prioritize right now.';
  }

  const topTasks = rankedTasks
    .slice(0, 3)
    .map((task, index) => `${index + 1}. "${task.title}" because it is ${task.reasoning.toLowerCase()}.`)
    .join(' ');

  return `Tasks were ranked by urgency, due date proximity, and priority level. ${topTasks}`;
};

const getWeeklySummary = (habits, tasks) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);

  const toKey = (date) => buildDateKey(date);
  const dateRangeKeys = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(sevenDaysAgo);
    date.setUTCDate(sevenDaysAgo.getUTCDate() + i);
    dateRangeKeys.push(toKey(date));
  }

  const habitStats = habits.map((habit) => {
    const completedInWeek = (habit.completions || []).filter((completion) => {
      if (!completion.completed) {
        return false;
      }

      const key = toKey(completion.date);
      return dateRangeKeys.includes(key);
    }).length;

    return {
      name: sanitizeText(habit.name, 60),
      completedInWeek,
      completionRate: (completedInWeek / 7) * 100
    };
  });

  const mostConsistentHabit = habitStats.slice().sort((a, b) => b.completedInWeek - a.completedInWeek)[0] || null;
  const mostMissedHabit = habitStats.slice().sort((a, b) => a.completedInWeek - b.completedInWeek)[0] || null;

  const tasksInWeek = tasks.filter((task) => new Date(task.createdAt) >= sevenDaysAgo);
  const completedTasks = tasksInWeek.filter((task) => task.status === 'Completed').length;
  const taskCompletionRate = tasksInWeek.length ? (completedTasks / tasksInWeek.length) * 100 : 0;

  const overallHabitRate = habitStats.length
    ? habitStats.reduce((sum, habit) => sum + habit.completionRate, 0) / habitStats.length
    : 0;
  const productivityScore = Math.round((overallHabitRate * 0.6) + (taskCompletionRate * 0.4));

  const suggestions = [];
  if (mostMissedHabit && mostMissedHabit.completedInWeek <= 2) {
    suggestions.push(`Focus on "${mostMissedHabit.name}" with a smaller target this week.`);
  }
  if (taskCompletionRate < 60) {
    suggestions.push('Break large tasks into smaller subtasks and prioritize by due date.');
  }
  if (overallHabitRate >= 80) {
    suggestions.push('Great consistency! Consider slightly increasing one habit goal.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Maintain your current rhythm and review progress mid-week.');
  }

  return {
    productivityScore,
    mostConsistentHabit,
    mostMissedHabit,
    taskSummary: {
      total: tasksInWeek.length,
      completed: completedTasks,
      completionRate: Number(taskCompletionRate.toFixed(1))
    },
    suggestions
  };
};

const buildWeeklyInsightText = (summary) => {
  if (!summary.mostConsistentHabit && !summary.mostMissedHabit && summary.taskSummary.total === 0) {
    return 'No weekly activity yet. Add a habit or task to unlock richer weekly insights.';
  }

  const lines = [`Your productivity score this week is ${summary.productivityScore}%.`];

  if (summary.mostConsistentHabit) {
    lines.push(`Your steadiest habit was "${summary.mostConsistentHabit.name}".`);
  }

  if (summary.mostMissedHabit) {
    lines.push(`The habit that needs the most support is "${summary.mostMissedHabit.name}".`);
  }

  lines.push(summary.suggestions[0]);

  return lines.join(' ');
};

const buildAssistantFallback = (question, analyzedHabits, rankedTasks, weeklySummary) => {
  const normalizedQuestion = sanitizeText(question, MAX_ASSISTANT_QUESTION_LENGTH).toLowerCase();
  const weakestHabit = analyzedHabits
    .slice()
    .sort((a, b) => a.completionRate - b.completionRate || b.missedDays - a.missedDays)[0] || null;
  const strongestHabit = analyzedHabits
    .slice()
    .sort((a, b) => b.completionRate - a.completionRate || b.currentStreak - a.currentStreak)[0] || null;
  const topTask = rankedTasks[0] || null;
  const nextTask = rankedTasks[1] || null;

  if (!analyzedHabits.length && !rankedTasks.length) {
    return 'I do not have enough habit or task data yet. Add a few habits or tasks and I can give a more specific recommendation.';
  }

  if (/(task|priority|priorit|first|urgent|deadline|due)/i.test(normalizedQuestion)) {
    if (!topTask) {
      return 'You have no pending tasks right now, so there is nothing urgent to prioritize.';
    }

    let answer = `Start with "${topTask.title}" because it is ${topTask.reasoning.toLowerCase()}.`;
    if (nextTask) {
      answer += ` After that, move to "${nextTask.title}".`;
    }
    return answer;
  }

  if (/(habit|streak|routine|miss|consisten)/i.test(normalizedQuestion)) {
    if (!weakestHabit && !strongestHabit) {
      return 'I do not have enough habit history yet to coach you on consistency.';
    }

    const supportLine = weakestHabit
      ? `Give extra support to "${weakestHabit.name}" because it is only at ${weakestHabit.completionRate}% completion.`
      : '';
    const momentumLine = strongestHabit
      ? ` Keep leaning on "${strongestHabit.name}" because it is your most consistent habit so far.`
      : '';
    return `${supportLine}${momentumLine}`.trim();
  }

  if (/(week|score|insight|progress|summary)/i.test(normalizedQuestion)) {
    return buildWeeklyInsightText(weeklySummary);
  }

  const fragments = [];
  if (topTask) {
    fragments.push(`Your best next task is "${topTask.title}" because it is ${topTask.reasoning.toLowerCase()}.`);
  }
  if (weakestHabit) {
    fragments.push(`The habit needing the most help is "${weakestHabit.name}" at ${weakestHabit.completionRate}% completion.`);
  }
  if (weeklySummary.productivityScore || weeklySummary.taskSummary.total) {
    fragments.push(`Your current weekly productivity score is ${weeklySummary.productivityScore}%.`);
  }

  return fragments.join(' ');
};

const tryOpenAI = async ({ systemPrompt, userPrompt, maxTokens = MAX_OPENAI_RESPONSE_TOKENS }) => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
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
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return sanitizeMultilineText(data?.choices?.[0]?.message?.content);
  } catch (error) {
    if (error.name === 'AbortError') {
      return null;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const buildHabitCoachResponse = async (habits) => {
  const analyzed = analyzeHabitData(habits);
  const recommendations = buildHabitRecommendations(analyzed);
  const fallbackAdvice = recommendations.slice(0, 3).map((tip) => `- ${tip}`).join('\n');

  let advice = null;
  try {
    advice = await tryOpenAI({
      systemPrompt: 'You rewrite verified habit coaching bullets. Preserve the same habits, days, and percentages exactly. Do not add new habits, metrics, or claims. Return up to 3 bullet points.',
      userPrompt: `Verified coaching points:\n${fallbackAdvice}`,
      maxTokens: 140
    });
  } catch (error) {
    console.error('OpenAI habit-coach fallback triggered:', error.message);
  }

  return {
    source: advice ? 'openai' : 'rule-based',
    habits: analyzed,
    recommendations,
    advice: advice || fallbackAdvice
  };
};

const buildTaskPrioritizeResponse = async (tasks) => {
  const ranked = rankTasks(tasks);
  const fallbackExplanation = buildTaskExplanation(ranked);
  const topTaskLines = ranked
    .slice(0, 3)
    .map((task, index) => `${index + 1}. ${task.title} | ${task.reasoning} | score ${task.score}`)
    .join('\n');

  let explanation = null;
  try {
    explanation = await tryOpenAI({
      systemPrompt: 'You rewrite a verified task-priority explanation. Preserve task titles, ordering, scores, and reasons exactly. Do not mention tasks that are not listed. Keep it concise.',
      userPrompt: `Verified ranked tasks:\n${topTaskLines}\n\nVerified explanation:\n${fallbackExplanation}`,
      maxTokens: 140
    });
  } catch (error) {
    console.error('OpenAI task-prioritize fallback triggered:', error.message);
  }

  return {
    source: explanation ? 'openai' : 'rule-based',
    rankedTasks: ranked,
    explanation: explanation || fallbackExplanation
  };
};

const buildWeeklyInsightsResponse = async (habits, tasks) => {
  const summary = getWeeklySummary(habits, tasks);
  const fallbackInsight = buildWeeklyInsightText(summary);

  let insightText = null;
  try {
    insightText = await tryOpenAI({
      systemPrompt: 'You rewrite a verified weekly review. Preserve all numbers, habit names, and actions exactly. Do not add new metrics, habits, or dates. Keep it concise.',
      userPrompt: `Verified weekly review:\n${fallbackInsight}\n\nVerified suggestions:\n- ${summary.suggestions.join('\n- ')}`,
      maxTokens: 150
    });
  } catch (error) {
    console.error('OpenAI weekly-insights fallback triggered:', error.message);
  }

  return {
    source: insightText ? 'openai' : 'rule-based',
    ...summary,
    insightText: insightText || fallbackInsight
  };
};

const buildAssistantResponse = async (question, habits, tasks) => {
  const cleanQuestion = sanitizeText(question, MAX_ASSISTANT_QUESTION_LENGTH);
  const analyzedHabits = analyzeHabitData(habits);
  const rankedTasks = rankTasks(tasks).slice(0, 5);
  const weeklySummary = getWeeklySummary(habits, tasks);
  const fallbackAnswer = buildAssistantFallback(cleanQuestion, analyzedHabits, rankedTasks, weeklySummary);

  let answer = null;
  try {
    answer = await tryOpenAI({
      systemPrompt: 'You rewrite a verified productivity answer. Use only the facts already present in the verified answer. Do not add tasks, habits, scores, dates, or recommendations that are not already stated. If the answer says information is missing, preserve that limitation.',
      userPrompt: `User question: ${cleanQuestion}\nVerified answer: ${fallbackAnswer}`,
      maxTokens: 180
    });
  } catch (error) {
    console.error('OpenAI assistant fallback triggered:', error.message);
  }

  return {
    source: answer ? 'openai' : 'rule-based',
    answer: answer || fallbackAnswer
  };
};

router.get('/habit-coach', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).select(HABIT_QUERY_FIELDS).lean();
    const response = await buildHabitCoachResponse(habits);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/task-prioritize', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).select(TASK_QUERY_FIELDS).lean();
    const response = await buildTaskPrioritizeResponse(tasks);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/weekly-insights', async (req, res) => {
  try {
    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id }).select(HABIT_QUERY_FIELDS).lean(),
      Task.find({ userId: req.user._id }).select(TASK_QUERY_FIELDS).lean()
    ]);
    const response = await buildWeeklyInsightsResponse(habits, tasks);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/assistant', async (req, res) => {
  try {
    const question = sanitizeText(req.body?.question, MAX_ASSISTANT_QUESTION_LENGTH);
    if (!question) {
      return res.status(400).json({ message: 'Please enter a question for the assistant.' });
    }

    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id }).select(HABIT_QUERY_FIELDS).lean(),
      Task.find({ userId: req.user._id }).select(TASK_QUERY_FIELDS).lean()
    ]);
    const response = await buildAssistantResponse(question, habits, tasks);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.__internals = {
  analyzeHabitData,
  buildAssistantFallback,
  buildAssistantResponse,
  buildHabitCoachResponse,
  buildTaskPrioritizeResponse,
  buildWeeklyInsightText,
  buildWeeklyInsightsResponse,
  getWeeklySummary,
  rankTasks
};

module.exports = router;
