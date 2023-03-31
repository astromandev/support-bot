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

async function generateErrorSolution() {
  const prompt = 'Give me a new common Minecraft error and its step-by-step solution for a beginner that were not mentioned before:';
  const response = await sendPromptToGPT(prompt);
  return response;
}

async function storeErrorAndSolution(errorText, solutionText) {
  const fileName = `${Date.now()}.txt`;
  fs.writeFileSync(path.join(dataFolder, fileName), `Error: ${errorText}\n\nSolution: ${solutionText}\n`);
  console.log(`Stored error and solution in file: ${fileName}`);

  // Get OpenAI API usage statistics
  const usageResponse = await fetch('https://api.openai.com/v1/usage/daily', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!usageResponse.ok) {
    const error = await usageResponse.json();
    console.error(`OpenAI API error: ${error.error.message}`);
  } else {
    const usageData = await usageResponse.json();
    console.log(`Tokens used today: ${usageData.data[0].tokens_used}`);
  }
}

const popularMods = ['OptiFine', 'Forge', 'Fabric', 'Pixelmon', 'LabyMod', 'Liteloader', 'Replay Mod', 'WorldEdit', 'WorldGuard', 'VoxelMap'];
function formatErrorMessage(errorMessage) {
    // Remove the error number if it exists
    const errorNumberRegex = /^[0-9]+\s+-\s+/;
    const formattedErrorMessage = errorMessage.replace(errorNumberRegex, '');
  
    // Replace all instances of '-' with ' '
    const replacedDashes = formattedErrorMessage.replace(/-/g, ' ');
  
    // Capitalize the first letter of each word
    const words = replacedDashes.split(' ');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  
    // Join the words back together with spaces and return
    const formattedError = capitalizedWords.join(' ');
    return formattedError;
  }
  
async function storePromptsAndResponses() {
    const prompts = [
      'How do I fix the "Failed to Login: Invalid Session (Try restarting your game)" error?',
      'How do I fix the "Internal Exception: io.netty.handler.codec.DecoderException: java.lang.IndexOutOfBoundsException" error?',
      'How do I fix the "java.lang.NullPointerException" error?',
      'How do I fix the "Connection Timed Out" error?',
      'How do I fix the "Unable to Connect to World" error?',
    ];
  
    for (const prompt of prompts) {
      const response = await sendPromptToGPT(prompt);
      const errorAndSolution = response.split('Solution:');
      if (errorAndSolution.length === 2) {
        const errorText = errorAndSolution[0].trim();
        const solutionText = errorAndSolution[1].trim();
        const fileName = `${Date.now()}.txt`;
        fs.writeFileSync(path.join(dataFolder, fileName), `Error: ${errorText}\n\nSolution: ${solutionText}\n`);
        console.log(`Stored error and solution in file: ${fileName}`);
      }
    }
  
    for (const mod of popularMods) {
      const response = await sendPromptToGPT(`${mod} Provide a step-by-step guide for a beginner.`);
      const errorText = formatErrorMessage(mod);
      const solutionText = formatSolutionMessage(response);
      const fileName = `${Date.now()}.txt`;
      fs.writeFileSync(path.join(dataFolder, fileName), `Error: ${errorText}\n\nSolution: ${solutionText}\n`);
      console.log(`Stored error and solution in file: ${fileName}`);
    }
  }
  
  (async () => {
    await storePromptsAndResponses();
  })();
  