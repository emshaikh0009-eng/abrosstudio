const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\e8294e18-0680-4231-b356-8321569ee6bd\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('"step_index":806')) {
      const parsed = JSON.parse(line);
      fs.writeFileSync('C:\\Users\\ATG study abroad\\.gemini\\antigravity-ide\\brain\\ce7fe8c4-6e90-4756-8d21-4e2477600463\\master_prompt.txt', parsed.content, 'utf8');
      console.log('Saved master prompt, length:', parsed.content.length);
      break;
    }
  }
}
processLineByLine();
