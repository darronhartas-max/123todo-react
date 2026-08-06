/**
 * Utility functions for Voice Task Input (Web Speech API) & Natural Language Voice Parsing
 */

/**
 * Checks if the browser supports Speech Recognition
 */
export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

/**
 * Parses natural spoken voice transcript into task text, priority level, and project ID.
 * Defaults to Priority 1 (Must Do / High Priority) and default project if not explicitly mentioned.
 *
 * Examples:
 * - "Buy milk priority 1 project Shopping" -> text: "Buy milk", priority: 1, project: "Shopping"
 * - "Finish quarterly report in Work"      -> text: "Finish quarterly report", priority: 1, project: "Work"
 * - "Call mom"                              -> text: "Call mom", priority: 1, project: default
 */
export const parseVoiceTask = (transcript, projects = [], currentProjectId = 'general') => {
  if (!transcript || typeof transcript !== 'string') {
    return { taskText: '', priority: 1, projectId: currentProjectId };
  }

  let text = transcript.trim();
  let detectedPriority = 1; // Default to Priority 1 (Must Do / High Priority)
  let detectedProjectId = currentProjectId && currentProjectId !== 'all' ? currentProjectId : (projects[0]?.id || 'general');

  // 1. Priority Detection Patterns
  const priorityPatterns = [
    { priority: 1, regex: /\b(priority\s*1|p1|must\s*do|high\s*priority|urgent|highest\s*priority)\b/i },
    { priority: 2, regex: /\b(priority\s*2|p2|should\s*do|medium\s*priority)\b/i },
    { priority: 3, regex: /\b(priority\s*3|p3|could\s*do|low\s*priority)\b/i },
    { priority: 4, regex: /\b(priority\s*4|p4|on\s*hold|holding)\b/i }
  ];

  for (const item of priorityPatterns) {
    if (item.regex.test(text)) {
      detectedPriority = item.priority;
      text = text.replace(item.regex, '').trim();
      break;
    }
  }

  // 2. Project Detection Patterns
  const activeProjects = (projects || []).filter(p => p.id !== 'all');
  for (const p of activeProjects) {
    if (!p.name) continue;
    const pNameEscaped = p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match "project <Project Name>", "in <Project Name>", "for <Project Name>"
    const prefixRegex = new RegExp(`\\b(project|in|for)\\s+${pNameEscaped}\\b`, 'i');
    if (prefixRegex.test(text)) {
      detectedProjectId = p.id;
      text = text.replace(prefixRegex, '').trim();
      break;
    } else {
      // Match project name at end of sentence
      const endRegex = new RegExp(`\\b${pNameEscaped}$`, 'i');
      if (endRegex.test(text)) {
        detectedProjectId = p.id;
        text = text.replace(endRegex, '').trim();
        break;
      }
    }
  }

  // 3. Clean up dangling prepositions or formatting artifacts
  text = text
    .replace(/\b(project|priority|in|for)\s*$/i, '')
    .replace(/^[\s,.-]+|[\s,.-]+$/g, '')
    .trim();

  // Capitalize first letter of task text
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return {
    taskText: text || transcript,
    priority: detectedPriority,
    projectId: detectedProjectId
  };
};
