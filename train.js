// main.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

import fs from 'fs';

async function main() {
  try {
    const data = 'Hello, world!';
    await fs.promises.appendFile('file.txt', data);
    console.log('Data written to file successfully');
  } catch (error) {
    console.error('Error writing data to file:', error);
  }
}

main();
const apiKey = process.env.OPENAI_API_KEY;
const modelName = 'text-davinci-002';
const openaiUrl = `https://api.openai.com/v1/completions`;

const previousPromptsFile = 'previous_prompts.txt';
let previousPrompts = new Set();
if (fs.existsSync(previousPromptsFile)) {
  previousPrompts = new Set(fs.readFileSync(previousPromptsFile, 'utf-8').split('\n'));
}

async function generatePrompts() {
  const prompt = 'Give me a list of 5 new common Minecraft errors and their step-by-step solutions for a beginner that were not mentioned before:';
  const response = await sendPromptToGPT(prompt);
  const questions = response
    .split('\n')
    .filter(q => q.trim() !== '' && !previousPrompts.has(q));

  fs.appendFileSync(previousPromptsFile, questions.join('\n') + '\n');
  return questions;
}

let totalPrompts = 0;
let totalTokens = 0;

async function sendPromptToGPT(prompt) {
  try {
    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        prompt: `${prompt}\n\nSolution:`,
        max_tokens: 1000,
        n: 1,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error.message}`);
    }

    const result = await response.json();

    if (result.choices && result.choices.length > 0 && result.choices[0].text) {
      const text = result.choices[0].text.trim();
      totalTokens += text.split(' ').length;
      totalPrompts += 1;
      return text;
    } else {
      console.error('Error during GPT-3.5-Turbo API call:', result);
      return '';
    }
    
  } catch (error) {
    console.error('Error during GPT-3.5-Turbo API call:', error);
    return '';
  }
}

fs.writeFileSync('dataset.csv', 'Error,Step-by-Step Solution\n');

const popularMods = [
  'How to install OptiFine for Minecraft?',
  'How to install Minecraft Forge?',
  'How to install Fabric Loader for Minecraft?',
  // Add more mod names here
];

async function storePromptsAndResponses() {
  const prompts = await generatePrompts();

  for (const prompt of prompts) {
    const response = await sendPromptToGPT(prompt);
    fs.appendFileSync('dataset.csv', `"${prompt}","${response}"\n`);
  }

  for (const mod of popularMods) {
    const response = await sendPromptToGPT(`${mod} Provide a step-by-step guide for a beginner.`);
    fs.appendFileSync('dataset.csv', `"${mod}","${response}"\n`);
  }

  console.log('Dataset has been created successfully.');
}

setInterval(async () => {
  const costPerToken = 0.002 / 1000;
  const amountSpent = totalTokens * costPerToken;
  console.log(
    `Total prompts: ${totalPrompts}\nTotal tokens: ${totalTokens}\nAmount spent: $${amountSpent.toFixed(2)}`
  );

  const prompts = await generatePrompts();
  for (const prompt of prompts) {
    const response = await sendPromptToGPT(prompt);
    fs.appendFileSync('dataset.csv', `"${prompt}","${response}"\n`);
  }

  for (const mod of popularMods) {
    const response = await sendPromptToGPT(`${mod} Provide a step-by-step guide for a beginner.`);
    fs.appendFileSync('dataset.csv', `"${mod}","${response}"\n`);
  }

  console.log('Dataset has been updated successfully.');
}, 30000);
