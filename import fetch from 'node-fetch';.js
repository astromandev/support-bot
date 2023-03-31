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
        prompt: `${prompt}`,
        max_tokens: 100,
        temperature: 0.5,
        n: 1,
        stop: '\n'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error.message}`);
    }

    const result = await response.json();

    if (result && result.choices && result.choices.length > 0 && result.choices[0].text) {
      return result.choices[0].text.trim();
    } else {
      console.error(`Error during GPT-3 API call: ${result}`);
      return '';
    }

  } catch (error) {
    console.error(`Error during GPT-3 API call: ${error}`);
    return '';
  }
}

async function storeErrorAndSolution() {
  const response = await generateErrorSolution();
  const errorAndSolution = response.split('Solution:');
  if (errorAndSolution.length === 2) {
    const errorText = errorAndSolution[0].trim();
    const solutionText = errorAndSolution[1].trim();
    const fileName = `${Date.now()}.txt`;
    fs.writeFileSync(path.join(dataFolder, fileName), `Error: ${errorText}\n\nSolution: ${solutionText}\n`);
    console.log(`Stored error and solution in file: ${fileName}`);
  }
}

async function storePromptsAndResponses() {
  const popularMods = [
    'OptiFine',
    'Biomes O\' Plenty',
    'Pixelmon',
    'Thaumcraft',
    'Applied Energistics 2',
  ];

  for (const mod of popularMods) {
    const response = await sendPromptToGPT(`${mod} Provide a step-by-step guide for a beginner.`);
    const errorText = formatErrorMessage(mod);
    const solutionText = formatSolutionMessage(response);
    storeErrorAndSolution(errorText, solutionText);
  }
}

function formatErrorMessage(errorMessage) {
  // Capitalize first letter of error message
  return errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
}

function formatSolutionMessage(solutionMessage) {
  // Add bullet points to each step in the solution
  const steps = solutionMessage.split('\n');
  const formattedSteps = steps.map(step => `- ${step.trim()}`);
  return formattedSteps.join('\n');
}

(async () => {
  await storeErrorAndSolution();
  await storePromptsAndResponses();
})();
