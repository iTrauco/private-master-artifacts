// wrapRecursive.js

const fs = require('fs');

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('❌ Please provide a Markdown file as input');
  process.exit(1);
}

const outputFile = inputFile.replace(/\.md$/, '_recursive_collapsed.md');
const lines = fs.readFileSync(inputFile, 'utf8').split(/\r?\n/);

function isHeading(line) {
  const match = /^(#{2,6})\s+(.*)/.exec(line);
  return match ? { level: match[1].length, text: match[2] } : null;
}

function wrapSections(lines, level = 2) {
  let output = [];
  let i = 0;

  while (i < lines.length) {
    const heading = isHeading(lines[i]);

    if (heading && heading.level === level) {
      const summary = heading.text.trim();
      const headingLine = lines[i];
      i++;

      let section = [];
      while (i < lines.length) {
        const nextHeading = isHeading(lines[i]);
        if (nextHeading && nextHeading.level <= level) break;
        section.push(lines[i]);
        i++;
      }

      const nested = wrapSections(section, level + 1);

      output.push(`<details>`);
      output.push(`<summary>${summary}</summary>\n`);
      output.push(headingLine);
      output.push(...nested);
      output.push(`</details>\n`);
    } else {
      output.push(lines[i]);
      i++;
    }
  }

  return output;
}

const result = wrapSections(lines);
fs.writeFileSync(outputFile, result.join('\n'), 'utf8');
console.log(`✅ Recursive collapsible Markdown written to: ${outputFile}`);
