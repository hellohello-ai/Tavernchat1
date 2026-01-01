import http from "http";
import { readFile } from "fs/promises";
import { createReadStream } from "fs";
import { extname, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, "public");

const themes = [
  {
    id: "candlelight",
    name: "Candlelight Ember",
    palette: {
      background: "#1a120b",
      surface: "#2c1d12",
      accent: "#f2b45b",
      text: "#f6e6c9",
      glow: "#ffcf7a"
    }
  },
  {
    id: "moonlit",
    name: "Moonlit Hearth",
    palette: {
      background: "#0f172a",
      surface: "#1f2937",
      accent: "#93c5fd",
      text: "#e0f2fe",
      glow: "#a5b4fc"
    }
  },
  {
    id: "festival",
    name: "Festival Lanterns",
    palette: {
      background: "#20130f",
      surface: "#3b1c16",
      accent: "#f87171",
      text: "#fff7ed",
      glow: "#facc15"
    }
  },
  {
    id: "mistwood",
    name: "Mistwood Calm",
    palette: {
      background: "#0f1f1b",
      surface: "#19332a",
      accent: "#5eead4",
      text: "#ecfeff",
      glow: "#2dd4bf"
    }
  }
];

const characterSeeds = {
  names: [
    "Alaric",
    "Brynna",
    "Cedric",
    "Darya",
    "Elowen",
    "Faelan",
    "Garrick",
    "Helena",
    "Isolde",
    "Joric",
    "Kael",
    "Liora",
    "Marek",
    "Nysa",
    "Orin",
    "Petra",
    "Quill",
    "Rowan",
    "Sable",
    "Thorne",
    "Ulric",
    "Vesper",
    "Wren",
    "Ysra",
    "Zorin"
  ],
  roles: [
    "Bard",
    "Tavern Keeper",
    "Ranger",
    "Mage",
    "Herbalist",
    "Blacksmith",
    "Cartographer",
    "Seer",
    "Scribe",
    "Knight",
    "Explorer",
    "Chef",
    "Inn Steward",
    "Alchemist",
    "Story Weaver"
  ],
  personalities: [
    "warm and curious",
    "mischievous and witty",
    "soft-spoken and thoughtful",
    "bold and adventurous",
    "gentle and poetic",
    "spirited and daring",
    "wise and patient",
    "playful and charming",
    "mysterious and calm",
    "earnest and loyal"
  ]
};

const loreSnippets = [
  "keeps a map of forgotten taverns",
  "collects songs about moonlit roads",
  "brews an herb tea that restores courage",
  "tracks legends about the Ember King",
  "offers blessings before dangerous journeys",
  "knows every secret passage in the city",
  "travels with a lantern that never cools",
  "writes letters to the stars",
  "keeps a charm for safe harbor",
  "can read fortunes in candle smoke"
];

const generateCharacters = () => {
  const characters = [];
  let id = 1;
  for (let i = 0; i < 120; i += 1) {
    const name = characterSeeds.names[i % characterSeeds.names.length];
    const role = characterSeeds.roles[i % characterSeeds.roles.length];
    const personality =
      characterSeeds.personalities[i % characterSeeds.personalities.length];
    const lore = loreSnippets[i % loreSnippets.length];
    characters.push({
      id: id.toString(),
      name: `${name} ${role.split(" ")[0]}son`,
      role,
      personality,
      lore,
      tagline: `${role} who is ${personality}.`,
      portrait: `/portraits/${(i % 12) + 1}.svg`,
      availability: i % 3 === 0 ? "At the hearth" : "By the window",
      vibe: i % 2 === 0 ? "Cozy" : "Adventurous",
      specialty: i % 2 === 0 ? "Comfort tales" : "Bold quests"
    });
    id += 1;
  }
  return characters;
};

const characters = generateCharacters();

const responsePhrases = [
  "The fire crackles as I answer.",
  "A soft lute melody drifts through the room.",
  "I lean closer, keeping my voice warm.",
  "The tavern hums while I gather my thoughts.",
  "Candlelight flickers over my words."
];

const roleReplies = {
  Bard: [
    "Would you like a tale of moonlit heroes?",
    "I can spin a song for any brave soul.",
    "The tavern holds more stories than ale."
  ],
  Mage: [
    "Mystic runes glow warmly tonight.",
    "A spell of comfort can be just as powerful.",
    "Shall we ponder the stars together?"
  ],
  "Tavern Keeper": [
    "Settle in, the hearth is yours.",
    "A fresh bowl of stew does wonders.",
    "We keep the night safe and steady here."
  ],
  Ranger: [
    "The woods whisper gentle secrets.",
    "I can guide you along the quieter paths.",
    "Even the wilds appreciate a warm hearth."
  ]
};

const quests = [
  {
    title: "Lanterns of the Old Road",
    detail: "Deliver three lanterns to the northern watchpost.",
    reward: "Warm cloak patch"
  },
  {
    title: "Song for the Hearth",
    detail: "Help the bard find a lost verse in the library.",
    reward: "Golden lute pin"
  },
  {
    title: "Herbalist's Favor",
    detail: "Gather moon mint for a calming tonic.",
    reward: "Elixir of calm"
  }
];

const ambienceTracks = [
  { id: "hearth", name: "Hearthfire Crackle", mood: "Cozy" },
  { id: "rain", name: "Rain on the Shingles", mood: "Dreamy" },
  { id: "lute", name: "Lute in the Corner", mood: "Festive" }
];

const storySparks = [
  "A traveler arrives with a snow-dusted map.",
  "The tavern lanterns flicker in unison.",
  "A bard hums a tune that feels familiar.",
  "Rain taps softly on the windowsill.",
  "Someone left a sealed letter at your table."
];

const contentTypeByExt = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg"
};

const sendJson = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });

const buildSystemPrompt = (character) =>
  `You are ${character.name}, a ${character.role} in a cozy medieval tavern. ` +
  `Your personality is ${character.personality}. ` +
  `Stay in character, be warm, immersive, and safe. ` +
  `Keep responses under 120 words and end with an inviting question.`;

const fetchAiReply = async ({ message, character, mood }) => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(character) },
        {
          role: "user",
          content: `Mood: ${mood}. Message: ${message}`
        }
      ],
      temperature: 0.8,
      max_tokens: 180
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
};

const handleChat = async (req, res) => {
  try {
    const { message, characterId, mood = "cozy" } = await parseBody(req);
    const character = characters.find((item) => item.id === characterId);
    if (!character) {
      sendJson(res, 404, { error: "Character not found." });
      return;
    }

    let reply = null;
    try {
      reply = await fetchAiReply({ message, character, mood });
    } catch (error) {
      reply = null;
    }

    if (!reply) {
      const roleOptions = roleReplies[character.role] || [
        "The hearth welcomes all travelers.",
        "Tell me more, and the night will listen.",
        "Every journey begins with a shared story."
      ];

      reply = `${responsePhrases[Math.floor(Math.random() * responsePhrases.length)]} ${
        roleOptions[Math.floor(Math.random() * roleOptions.length)]
      }`;
    }

    sendJson(res, 200, {
      reply,
      meta: {
        character: character.name,
        role: character.role,
        mood: character.vibe,
        echo: message?.slice(0, 120) || ""
      }
    });
  } catch (error) {
    sendJson(res, 400, { error: "Invalid request payload." });
  }
};

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (url === "/api/themes" && method === "GET") {
    sendJson(res, 200, themes);
    return;
  }

  if (url === "/api/characters" && method === "GET") {
    sendJson(res, 200, characters);
    return;
  }

  if (url === "/api/quests" && method === "GET") {
    sendJson(res, 200, quests);
    return;
  }

  if (url === "/api/ambience" && method === "GET") {
    sendJson(res, 200, { tracks: ambienceTracks });
    return;
  }

  if (url === "/api/story-sparks" && method === "GET") {
    sendJson(res, 200, storySparks);
    return;
  }

  if (url === "/api/chat" && method === "POST") {
    await handleChat(req, res);
    return;
  }

  const filePath = url === "/" ? "/index.html" : url;
  const resolvedPath = join(publicDir, filePath);
  const ext = extname(resolvedPath);

  try {
    await readFile(resolvedPath);
    res.writeHead(200, {
      "Content-Type": contentTypeByExt[ext] || "application/octet-stream"
    });
    createReadStream(resolvedPath).pipe(res);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Tavernchat listening on port ${port}`);
});
