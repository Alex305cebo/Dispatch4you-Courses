const fs = require('fs');

const html = fs.readFileSync('pages/doc-module-9-complete.html', 'utf8');

// Find all <li> tags
const liOpenRegex = /<li[^>]*>/g;
const liCloseRegex = /<\/li>/g;

const openMatches = html.match(liOpenRegex) || [];
const closeMatches = html.match(liCloseRegex) || [];

console.log(`Open <li> tags: ${openMatches.length}`);
console.log(`Close </li> tags: ${closeMatches.length}`);
console.log(`Difference: ${openMatches.length - closeMatches.length}`);

// Find unclosed <li> with nested <ul>
const lines = html.split('\n');
let openLi = 0;
let unclosedLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openCount = (line.match(/<li[^>]*>/g) || []).length;
    const closeCount = (line.match(/<\/li>/g) || []).length;

    openLi += openCount - closeCount;

    if (openLi < 0) {
        console.log(`Line ${i + 1}: Extra </li> - ${line.trim().substring(0, 80)}`);
        openLi = 0;
    }

    // Check for <li> with nested <ul> but no closing </li>
    if (line.includes('<li>') && line.includes('<ul>') && !line.includes('</li>')) {
        unclosedLines.push({ line: i + 1, content: line.trim().substring(0, 100) });
    }
}

console.log(`\nUnclosed <li> with nested <ul>:`);
unclosedLines.forEach(item => {
    console.log(`Line ${item.line}: ${item.content}`);
});

console.log(`\nFinal open <li> count: ${openLi}`);
