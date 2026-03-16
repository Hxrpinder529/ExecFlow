import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy through your backend
});

export interface GeneratedFollowUp {
  taskId: string;
  followUpDate: string;
  type: "Call" | "Email" | "In-Person" | "WhatsApp";
  stakeholder: string;
  actionItem: string;
  outcome: string;
  nextFollowUpDate: string;
  status: "Pending" | "Resolved" | "Escalated";
}

export async function generateFollowUpsFromTask(
    taskTitle: string,
    taskDescription: string,
    taskId: string
  ): Promise<GeneratedFollowUp[]> {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured. Skipping follow-up generation.");
      return [];
    }
  
  try {
    const prompt = `
      You are an AI assistant that helps generate follow-up tasks based on a main task.
      
      Main Task: "${taskTitle}"
      Description: "${taskDescription || "No description provided"}"
      
      Based on this task, generate 1-3 logical follow-up items that would need to happen.
      For example, if the task is about getting files from someone, a follow-up would be to check if files were received.
      
      Return a JSON array with this structure:
      [
        {
          "actionItem": "Brief description of what needs to be done",
          "stakeholder": "Who is involved (extract from task or suggest)",
          "type": "Call" or "Email" or "In-Person" or "WhatsApp",
          "daysUntilFollowUp": 3 (number of days after task creation)
        }
      ]
      
      Only return the JSON array, no other text.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates follow-up tasks. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content || "[]";
    
    // Parse the JSON response
    let suggestions = JSON.parse(content);
    
    if (!Array.isArray(suggestions)) {
      suggestions = [];
    }

    // Convert to follow-up format
    const today = new Date();
    const followUps: GeneratedFollowUp[] = suggestions.map((s: any, index: number) => {
      const followUpDate = new Date(today);
      followUpDate.setDate(today.getDate() + (s.daysUntilFollowUp || 3));
      
      const nextFollowUpDate = new Date(followUpDate);
      nextFollowUpDate.setDate(followUpDate.getDate() + 3);
      
      return {
        taskId,
        followUpDate: followUpDate.toISOString().split('T')[0],
        type: s.type || "Email",
        stakeholder: s.stakeholder || "Stakeholder",
        actionItem: s.actionItem || `Follow up on ${taskTitle}`,
        outcome: "",
        nextFollowUpDate: nextFollowUpDate.toISOString().split('T')[0],
        status: "Pending"
      };
    });

    return followUps;
  } catch (error) {
    console.error("Error generating follow-ups:", error);
    return [];
  }
}

export async function analyzeTaskForFollowUps(taskText: string): Promise<{
  needsFollowUp: boolean;
  suggestedStakeholders: string[];
  suggestedTypes: string[];
}> {
  try {
    const prompt = `
      Analyze this task description and determine if it requires follow-ups:
      "${taskText}"
      
      Return a JSON object with:
      {
        "needsFollowUp": boolean (true if this task implies waiting for someone/something),
        "suggestedStakeholders": array of people/departments mentioned,
        "suggestedTypes": array of communication types ["Call", "Email", "In-Person", "WhatsApp"]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You analyze tasks and return JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing task:", error);
    return {
      needsFollowUp: false,
      suggestedStakeholders: [],
      suggestedTypes: []
    };
  }
}