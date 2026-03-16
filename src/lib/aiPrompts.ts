export const FOLLOW_UP_GENERATION_PROMPT = `
You are an AI assistant that helps generate follow-up tasks based on a main task.

Task: {TASK_TITLE}
Description: {TASK_DESCRIPTION}

Generate 1-3 logical follow-up items that would need to happen.
Consider:
- If the task involves waiting for someone/something
- If there are dependencies
- If follow-up communication would be needed

Return a JSON array with:
[
  {
    "actionItem": "Clear description of follow-up action",
    "stakeholder": "Person/department involved",
    "type": "Call or Email or In-Person or WhatsApp",
    "daysUntilFollowUp": number of days after task creation (1-7),
    "rationale": "Brief explanation of why this follow-up is needed"
  }
]
`;

export const TASK_ANALYSIS_PROMPT = `
Analyze this task and determine if it requires follow-ups:
"{TASK_TEXT}"

Return JSON:
{
  "needsFollowUp": true/false,
  "reason": "Brief explanation",
  "suggestedStakeholders": ["name1", "name2"],
  "suggestedTypes": ["Call", "Email"],
  "complexity": "Low/Medium/High"
}
`;