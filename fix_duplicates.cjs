const fs = require('fs');
const content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf-8');

let newContent = '';
let currentLang = null;
let seenKeys = new Set();
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect start of language block
  if (line.match(/^  (en|es|pt): \{/)) {
    currentLang = line.trim().split(':')[0];
    seenKeys = new Set();
    newContent += line + '\n';
    continue;
  }
  
  // Detect end of language block
  if (currentLang && line.match(/^  \},?/)) {
    currentLang = null;
    newContent += line + '\n';
    continue;
  }
  
  if (currentLang) {
    // Match a key-value line: "some.key": "value",
    const match = line.match(/^\s*"([^"]+)"\s*:/);
    if (match) {
      const key = match[1];
      if (seenKeys.has(key)) {
        // Skip duplicate
        console.log(`Removed duplicate key ${key} in ${currentLang} at line ${i+1}`);
        continue;
      } else {
        seenKeys.add(key);
      }
    }
  }
  
  newContent += line + '\n';
}

// Remove trailing newline if original didn't have it (split adds one if not careful, but join handles it)
newContent = newContent.slice(0, -1);
fs.writeFileSync('src/contexts/LanguageContext.tsx', newContent);
