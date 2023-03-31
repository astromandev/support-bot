// train.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const openaiUrl = `https://api.openai.com/v1/chat/completions`;

const dataFolder = 'data';
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

async function generateErrorSolution() {
  const prompt = 'Give me a new common Minecraft error and its step-by-step solution for a beginner that were not mentioned before:';
  const response = await sendPromptToGPT(prompt);
  return response;
}

async function sendPromptToGPT(prompt) {
  try {
    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'You are a helpful AI that provides step-by-step solutions for common Minecraft errors.' }, { role: 'user', content: prompt }],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error.message}`);
    }

    const result = await response.json();

    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
      return result.choices[0].message.content.trim();
    } else {
      console.error(`Error during GPT-3.5-turbo API call: ${result}`);
      return '';
    }

  } catch (error) {
    console.error(`Error during GPT-3.5-turbo API call: ${error}`);
    return '';
  }
}

function formatErrorMessage(errorMessage) {
  // Replace any underscores with spaces
  errorMessage = errorMessage.replace(/_/g, ' ');

  // Capitalize the first letter of each word
  errorMessage = errorMessage.replace(/\b\w/g, firstLetter => firstLetter.toUpperCase());

  // Replace any backslashes with forward slashes
  errorMessage = errorMessage.replace(/\\/g, '/');

  // Return the formatted error message
  return errorMessage;
}

async function storeErrorAndSolution() {
  const response = await generateErrorSolution();
  const errorAndSolution = response.split('Solution:');
  if (errorAndSolution.length === 2) {
    const errorText = formatErrorMessage(errorAndSolution[0].replace('Error: Sure! Here\'s a common error and its solution:', '').trim());
    const solutionText = errorAndSolution[1].trim();
    const fileName = `${errorText.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    fs.writeFileSync(path.join(dataFolder, fileName), `Error: ${errorText}\n\nSolution: ${solutionText}\n`);
    console.log(`Stored error and solution in file: ${fileName}`);
  }
}

(async () => {
  // Run the function once before starting the interval
  await storeErrorAndSolution();

  // Set an interval to generate errors and solutions continuously
  setInterval(async () => {
    await storeErrorAndSolution();
  }, 2000); // Adjust the time interval as needed (in milliseconds)
})();
