const express = require('express');
const router = express.Router();
const { analyzeIdea } = require('../services/aiService');

router.post('/', async (req, res) => {
    const { problem } = req.body;
    if (!problem || typeof problem !== 'string' || !problem.trim()) {
        return res.status(400).json({ error: 'Problem description is required' });
    }

    try {
        const analysis = await analyzeIdea(`Problem to solve: ${problem}`);
        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing problem:', error.message || error);
        const isRateLimit = error.code === 'RATE_LIMITED' || (error.message || '').includes('RATE_LIMITED');
        res.status(isRateLimit ? 429 : 500).json({
            error: isRateLimit ? 'AI service rate limited. Try again later.' : 'Failed to analyze problem.',
            rateLimited: isRateLimit,
        });
    }
});

module.exports = router;
