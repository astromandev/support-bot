const { Client, Intents } = require('discord.js');
const fs = require('fs');
const csvParser = require('csv-parser');
require('dotenv').config();


// Load your Discord bot token from an environment variable or secret manager
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_CONTENT] });

// Load the dataset
const datasetFile = 'dataset.csv';
const dataset = new Map();

fs.createReadStream(datasetFile)
  .pipe(csvParser())
  .on('data', (row) => {
    dataset.set(row.Error, row['Step-by-Step Solution']);
  })
  .on('end', () => {
    console.log('Dataset has been loaded successfully.');
  });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const errorQuery = message.content.toLowerCase();
  let closestMatch = null;
  let smallestDistance = Infinity;

  for (const [error, solution] of dataset.entries()) {
    const errorLowerCase = error.toLowerCase();
    const distance = levenshteinDistance(errorLowerCase, errorQuery);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestMatch = { error, solution };
    }
  }

  if (closestMatch) {
    message.reply(`Closest match: ${closestMatch.error}\n\n${closestMatch.solution}`);
  } else {
    message.reply('No solution found for the given error.');
  }
});

// Levenshtein distance function
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

client.login(DISCORD_BOT_TOKEN);
