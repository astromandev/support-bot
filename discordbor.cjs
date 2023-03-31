
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { Client, Intents } = require('discord.js');

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
  console.log(`Hi there! I'm here to help you with any Java errors you're experiencing. Just let me know what's going on, and I'll do my best to provide a solution for you.`);
});

client.on('messageCreate', async (message) => {
  try {
    if (!message.guild) return; // Only reply to messages sent in a guild channel

    if (message.author.bot) return;

    const errorQuery = message.content.toLowerCase();

    // Check if the message contains the word "error"
    if (!errorQuery.includes('error')) {
      return;
    }

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
      message.channel.send(`Based on the error message you provided, it seems like you're experiencing a problem with "${closestMatch.error}". Here's what I suggest you try:\n\n${closestMatch.solution}`);
    } else {
      message.channel.send("I'm sorry, but I couldn't understand the error message you sent me. It's possible that this error is not in my dataset, or that I didn't understand your message correctly. Could you please try rephrasing your question, or provide more information about the error you're facing?");
    }
  } catch (error) {
    console.error('An error occurred while processing a message:', error);
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
// Catch errors that occur in the bot itself
client.on('error', (error) => {
  console.error('The bot encountered an error:', error);
  });
  
  // Catch SIGINT event
  process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await client.destroy();
  process.exit();
  });
  
  client.login(DISCORD_BOT_TOKEN);