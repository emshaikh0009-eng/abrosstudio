const fs = require('fs');
const readline = require('readline');

async function checkActions() {
  const fileStream = fs.createReadStream('C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\e8294e18-0680-4231-b356-8321569ee6bd\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    const parsed = JSON.parse(line);
    if (parsed.step_index >= 806 && parsed.type === 'PLANNER_RESPONSE' && parsed.tool_calls) {
      for (const tc of parsed.tool_calls) {
        const detail = tc.args?.TargetFile || tc.args?.AbsolutePath || tc.args?.CommandLine || JSON.stringify(tc.args).slice(0, 100);
        console.log(`Step ${parsed.step_index}: ${tc.name} -> ${detail}`);
      }
    }
  }
}
checkActions();
