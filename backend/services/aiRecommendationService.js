const fetch = require('node-fetch');

const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';

const buildPrompt = ({ doctor, weekAvailability, patientPreferences, history, cancellationRate }) => `
You are an AI assistant helping schedule appointments in a healthcare app.

Doctor:
${JSON.stringify(doctor, null, 2)}

Upcoming weekly availability (ISO date + time slots):
${JSON.stringify(weekAvailability, null, 2)}

Patient preferences (requested time ranges, constraints):
${JSON.stringify(patientPreferences, null, 2)}

Past appointment history for this patient-doctor pair:
${JSON.stringify(history, null, 2)}

Doctor cancellation frequency (0-1 scale):
${cancellationRate}

Goal:
- Recommend the best appointment slots (ranked) that maximize alignment with patient preferences, minimize conflict with history, and avoid unreliable periods.
- Output JSON with array "recommendations", where each item has:
  {
    "slot": {
      "date": "YYYY-MM-DD",
      "startTime": "HH:mm",
      "endTime": "HH:mm"
    },
    "confidence": 0-1,
    "reasoning": "short text"
  }

If no suitable slots exist, return { "recommendations": [] }.
`;

const parseClaudeResponse = (content) => {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed.recommendations)) {
      return parsed.recommendations.map((item) => ({
        slot: item.slot,
        confidence: item.confidence,
        reasoning: item.reasoning,
      }));
    }
  } catch (error) {
    console.error('Failed to parse Claude response:', error.message);
  }
  return [];
};

const callClaude = async (prompt) => {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY not configured');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': process.env.CLAUDE_API_VERSION || '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 400,
      temperature: 0.2,
      system: 'You are an assistant that strictly returns JSON.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  const reply = data?.content?.[0]?.text || '';
  return parseClaudeResponse(reply);
};

const recommendAppointmentSlots = async (params) => {
  const prompt = buildPrompt(params);
  return callClaude(prompt);
};

module.exports = {
  buildPrompt,
  parseClaudeResponse,
  recommendAppointmentSlots,
};
