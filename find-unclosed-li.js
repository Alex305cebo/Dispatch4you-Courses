const fs = require('fs');

const html = fs.readFileSync('pages/doc-module-9-complete.html', 'utf8');
const lines = html.split('\n');

let stack = [];
let unclosed = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Find all <li> opens
    const openMatches = line.matchAll(/<li[^>]*>/g);
    for (const match of openMatches) {
        stack.push({ line: lineNum, content: line.trim().substring(0, 100), index: match.index });
    }

    // Find all </li> closes
    const closeMatches = line.matchAll(/<\/li>/g);
    for (const match of closeMatches) {
        if (stack.length > 0) {
            stack.pop();
        }
    }
}

console.log(`Unclosed <li> tags: ${stack.length}`);
stack.forEach((item, index) => {
    console.log(`\n${index + 1}. Line ${item.line}:`);
    console.log(`   ${item.content}`);

    // Show next few lines for context
    if (item.line < lines.length) {
        console.log(`   Next line: ${lines[item.line].trim().substring(0, 100)}`);
    }
});
