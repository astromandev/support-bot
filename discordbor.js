import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Client, Intents } = await import('discord.js');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const client = new Client({
  intents: [Intents.FLAGS.Guilds, Intents.FLAGS.GuildMessages]
});

// Load the dataset
const dataFolder = 'data';
const dataset = new Map();

fs.readdirSync(dataFolder).forEach(file => {
  const filePath = path.join(dataFolder, file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const [errorLine, solutionLine] = fileContent.split('\n\n');
  const error = errorLine.replace(/^Error: /, '');
  const solution = solutionLine.replace(/^Solution: /, '');
  dataset.set(error, solution);
});

console.log('Dataset has been loaded successfully.');

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.toLowerCase().includes("error")) return;

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
