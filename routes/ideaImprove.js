const express = require('express');
const router = express.Router();
const { improveIdea } = require('../services/aiService');

router.post('/', async (req, res) => {
    const { idea } = req.body;
    if (!idea || typeof idea !== 'string' || !idea.trim()) {
        return res.status(400).json({ error: 'Idea is required' });
    }

    try {
        const result = await improveIdea(idea);
        res.json(result);
    } catch (error) {
        console.error('Error improving idea:', error.message || error);
        const isRateLimit = error.code === 'RATE_LIMITED' || (error.message || '').includes('RATE_LIMITED');
        res.status(isRateLimit ? 429 : 500).json({
            error: isRateLimit ? 'AI service rate limited. Try again later.' : 'Failed to improve idea.',
            rateLimited: isRateLimit,
        });
    }
});

module.exports = router;
