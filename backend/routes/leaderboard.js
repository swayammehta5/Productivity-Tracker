const express = require('express');
const auth = require('../middleware/auth');
const UserScore = require('../models/UserScore');
const User = require('../models/User');

const router = express.Router();

// Get leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const { sortBy = 'totalXP', limit = 10 } = req.query;

    let sortOption = {};
    if (sortBy === 'totalXP') {
      sortOption = { totalXP: -1 };
    } else if (sortBy === 'longestStreak') {
      sortOption = { longestStreak: -1 };
    } else if (sortBy === 'level') {
      sortOption = { currentLevel: -1, totalXP: -1 };
    }

    const scores = await UserScore.find()
      .populate('user', 'name email profilePicture')
      .sort(sortOption)
      .limit(parseInt(limit));

    // Handle empty data
    if (!scores || scores.length === 0) {
      return res.json({
        leaderboard: [],
        userRank: 0,
        userScore: null
      });
    }

    // Get user's rank
    const userScore = await UserScore.findOne({ user: req.user._id });
    let userRank = 0;
    if (userScore) {
      const scoresAbove = await UserScore.countDocuments({
        [sortBy === 'totalXP' ? 'totalXP' : sortBy === 'longestStreak' ? 'longestStreak' : 'currentLevel']: 
        { $gt: userScore[sortBy === 'totalXP' ? 'totalXP' : sortBy === 'longestStreak' ? 'longestStreak' : 'currentLevel'] }
      });
      userRank = scoresAbove + 1;
    }

    res.json({
      leaderboard: scores.map((score, index) => ({
        rank: index + 1,
        user: {
          id: score.user?._id || 'unknown',
          name: score.user?.name || "Unknown",
          email: score.user?.email || '',
          profilePicture: score.user?.profilePicture || null
        },
        totalXP: score.totalXP || 0,
        currentLevel: score.currentLevel || 1,
        longestStreak: score.longestStreak || 0,
        badges: score.badges || []
      })),
      userRank,
      userScore: userScore ? {
        totalXP: userScore.totalXP || 0,
        currentLevel: userScore.currentLevel || 1,
        longestStreak: userScore.longestStreak || 0,
        badges: userScore.badges || []
      } : null
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user score (called when completing habits/tasks)
router.post('/update', auth, async (req, res) => {
  try {
    const { xp, badge, streak } = req.body;

    let userScore = await UserScore.findOne({ user: req.user._id });
    if (!userScore) {
      userScore = new UserScore({ user: req.user._id });
    }

    if (xp) {
      await userScore.addXP(xp);
    }

    if (badge) {
      await userScore.addBadge(badge);
    }

    if (streak && streak > userScore.longestStreak) {
      userScore.longestStreak = streak;
      await userScore.save();
    }

    res.json(userScore);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

