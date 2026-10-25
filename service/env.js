'use strict';

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

function parse(content) {
  const result = {};

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) {
      return;
    }

    let value = match[2].trim();
    const quoted = (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));

    if (quoted) {
      value = value.slice(1, -1);
    } else {
      const commentIndex = value.indexOf(' #');
      if (commentIndex !== -1) {
        value = value.slice(0, commentIndex).trim();
      }
    }

    result[match[1]] = value;
  });

  return result;
}

if (fs.existsSync(envPath)) {
  const parsed = parse(fs.readFileSync(envPath, 'utf8'));

  Object.keys(parsed).forEach((key) => {
    // Variables already set in the shell win over the .env file.
    if (process.env[key] === undefined) {
      process.env[key] = parsed[key];
    }
  });
}

module.exports = {
  path: envPath,
  parse: parse
};
