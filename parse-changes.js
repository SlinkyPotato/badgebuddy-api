const { readFileSync } = require('fs');
const text = readFileSync('./changes.md', 'UTF-8');
const lines = text.split('\n');

let numOfBlocks = 0;
let changes = [];
for (let line of lines) {
  if (line === '---') {
    numOfBlocks++;
    continue;
  }
  if (numOfBlocks === 1) {
    changes.push(line);
  }
  if (numOfBlocks >= 2) {
    break;
  }
}

// write changes to file
const { writeFileSync } = require('fs');
writeFileSync('./parsed.md', changes.join('\n'));
