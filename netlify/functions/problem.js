const { analyzeIdea } = require('../../services/aiService');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    let parsed;
    try {
        parsed = JSON.parse(event.body || '{}');
    } catch (_) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid JSON body' }),
        };
    }

    const { problem } = parsed;
    if (!problem || typeof problem !== 'string' || !problem.trim()) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Problem description is required' }),
        };
    }

    try {
        const analysis = await analyzeIdea(`Problem to solve: ${problem}`);
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(analysis),
        };
    } catch (error) {
        console.error('Error analyzing problem:', error.message || error);
        const isRateLimit = error.code === 'RATE_LIMITED' || (error.message || '').includes('RATE_LIMITED');
        return {
            statusCode: isRateLimit ? 429 : 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: isRateLimit ? 'AI service rate limited. Try again later.' : 'Failed to analyze problem.',
                rateLimited: isRateLimit,
            }),
        };
    }
};
