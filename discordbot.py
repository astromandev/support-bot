import os
import re
from discord.ext import commands
from discord import Intents
from Levenshtein import distance as levenshtein_distance
from dotenv import load_dotenv
load_dotenv()

intents = Intents.default()
intents.guilds = True
intents.messages = True
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)



data_folder = 'data'
dataset = {}

for file in os.listdir(data_folder):
    with open(os.path.join(data_folder, file), 'r') as f:
        content = f.read()
        error_line, solution_line = content.split('\n\n', 1)
        error = error_line.replace('Error: ', '')
        solution = solution_line.replace('Solution: ', '')
        dataset[error] = solution

@bot.event
async def on_ready():
    print(f'We have logged in as {bot.user}')

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return

    if re.search(r'\berror\b', message.content, re.IGNORECASE):
        error_query = message.content.lower()
        closest_match = None
        smallest_distance = float('inf')
        max_distance_threshold = 10  # Adjust this value according to your needs

        for error, solution in dataset.items():
            distance = levenshtein_distance(error.lower(), error_query)
            if distance < smallest_distance:
                smallest_distance = distance
                closest_match = (error, solution)

        if closest_match and smallest_distance <= max_distance_threshold:
            error, solution = closest_match
            await message.channel.send(f"Closest match: {error}\n\n{solution}")
        else:
            await message.channel.send("No solution found for the given error.")

    await bot.process_commands(message)


TOKEN = os.environ['DISCORD_BOT_TOKEN']
bot.run(TOKEN)
