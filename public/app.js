const themeGrid = document.getElementById("theme-grid");
const characterGrid = document.getElementById("character-grid");
const searchInput = document.getElementById("character-search");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const selectedCharacter = document.getElementById("selected-character");
const chatSubtitle = document.getElementById("chat-subtitle");
const quests = document.getElementById("quests");
const ambience = document.getElementById("ambience");
const startJourney = document.getElementById("start-journey");
const toggleAmbience = document.getElementById("toggle-ambience");
const quickPrompts = document.getElementById("quick-prompts");
const moodSelect = document.getElementById("mood-select");
const sparks = document.getElementById("sparks");
const favorites = document.getElementById("favorites");
const spotlight = document.getElementById("spotlight");
const saveChat = document.getElementById("save-chat");
const aiGuide = document.getElementById("ai-guide");
const openAiGuide = document.getElementById("open-ai-guide");
const closeAiGuide = document.getElementById("close-ai-guide");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileSave = document.getElementById("profile-save");
const profileCard = document.getElementById("profile-card");
const historyList = document.getElementById("history-list");
const roleFilters = document.getElementById("role-filters");
const toast = document.getElementById("toast");
const statCharacters = document.getElementById("stat-characters");
const statFavorites = document.getElementById("stat-favorites");
const statConversations = document.getElementById("stat-conversations");
const statMood = document.getElementById("stat-mood");

let allCharacters = [];
let activeCharacter = null;
let ambienceOn = false;
let favoriteIds = new Set();
let currentProfile = null;
let activeRoleFilter = "All";

const quickPromptOptions = [
  "Tell me a cozy tavern secret.",
  "What adventure brought you here?",
  "Share a calming recipe.",
  "Sing a short tavern verse.",
  "Who should I meet next?"
];

const themeFallbacks = [
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
  }
];

const questFallbacks = [
  {
    title: "Lanterns of the Old Road",
    detail: "Deliver three lanterns to the northern watchpost.",
    reward: "Warm cloak patch"
  },
  {
    title: "Song for the Hearth",
    detail: "Help the bard find a lost verse in the library.",
    reward: "Golden lute pin"
  }
];

const ambienceFallbacks = [
  { id: "hearth", name: "Hearthfire Crackle", mood: "Cozy" },
  { id: "rain", name: "Rain on the Shingles", mood: "Dreamy" },
  { id: "lute", name: "Lute in the Corner", mood: "Festive" }
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

const fallbackReply = (character) => {
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
  const roleOptions = roleReplies[character.role] || [
    "The hearth welcomes all travelers.",
    "Tell me more, and the night will listen.",
    "Every journey begins with a shared story."
  ];
  return `${responsePhrases[Math.floor(Math.random() * responsePhrases.length)]} ${
    roleOptions[Math.floor(Math.random() * roleOptions.length)]
  }`;
};

const setTheme = (palette) => {
  const root = document.documentElement;
  root.style.setProperty("--background", palette.background);
  root.style.setProperty("--surface", palette.surface);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--text", palette.text);
  root.style.setProperty("--glow", palette.glow);
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2400);
};

const persistTheme = (themeId) => {
  localStorage.setItem("tavern-theme", themeId);
};

const loadTheme = (themes) => {
  const savedId = localStorage.getItem("tavern-theme");
  const savedTheme = themes.find((theme) => theme.id === savedId);
  const fallback = themes[0];
  const chosen = savedTheme || fallback;
  setTheme(chosen.palette);
};

const renderThemes = (themes) => {
  themeGrid.innerHTML = "";
  themes.forEach((theme) => {
    const card = document.createElement("button");
    card.className = "theme-card";
    card.type = "button";
    card.innerHTML = `
      <div class="theme-card__swatch" style="background: linear-gradient(135deg, ${theme.palette.accent}, ${theme.palette.background});"></div>
      <div class="character-card__title">${theme.name}</div>
      <p>${theme.id}</p>
    `;
    card.addEventListener("click", () => {
      setTheme(theme.palette);
      persistTheme(theme.id);
    });
    themeGrid.appendChild(card);
  });
};

const renderCharacters = (characters) => {
  characterGrid.innerHTML = "";
  characters.forEach((character) => {
    const card = document.createElement("div");
    card.className = "character-card";
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.innerHTML = `
      <button class="favorite-toggle" aria-label="Toggle favorite">${
        favoriteIds.has(character.id) ? "★" : "☆"
      }</button>
      <img src="${character.portrait}" alt="Portrait of ${character.name}" />
      <div class="character-card__title">${character.name}</div>
      <div class="tag">${character.role}</div>
      <p>${character.tagline}</p>
      <div class="tag">${character.availability}</div>
    `;

    const handleSelect = () => selectCharacter(character);

    card.addEventListener("click", (event) => {
      if (event.target.classList.contains("favorite-toggle")) {
        event.stopPropagation();
        toggleFavorite(character);
        renderCharacters(characters);
        return;
      }
      handleSelect();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelect();
      }
    });
    characterGrid.appendChild(card);
  });
};

const renderRoleFilters = () => {
  const roles = Array.from(new Set(allCharacters.map((item) => item.role)));
  roleFilters.innerHTML = "";
  ["All", ...roles].forEach((role) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = role;
    if (role === activeRoleFilter) {
      button.classList.add("is-active");
    }
    button.addEventListener("click", () => {
      activeRoleFilter = role;
      handleSearch(searchInput.value);
      renderRoleFilters();
    });
    roleFilters.appendChild(button);
  });
};

const renderQuests = (items) => {
  quests.innerHTML = "";
  items.forEach((quest) => {
    const card = document.createElement("div");
    card.className = "quest";
    card.innerHTML = `
      <strong>${quest.title}</strong>
      <p>${quest.detail}</p>
      <p><em>Reward: ${quest.reward}</em></p>
    `;
    quests.appendChild(card);
  });
};

const renderAmbience = (tracks) => {
  ambience.innerHTML = "";
  tracks.forEach((track) => {
    const card = document.createElement("div");
    card.className = "ambience__item";
    card.innerHTML = `
      <div>
        <strong>${track.name}</strong>
        <p>${track.mood}</p>
      </div>
      <span class="tag">${track.id}</span>
    `;
    ambience.appendChild(card);
  });
};

const renderSparks = (items) => {
  sparks.innerHTML = "";
  items.forEach((spark) => {
    const card = document.createElement("div");
    card.className = "spark";
    card.innerHTML = `
      <span>${spark}</span>
      <button class="ghost" type="button">Use</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      chatInput.value = spark;
      chatInput.focus();
    });
    sparks.appendChild(card);
  });
};

const renderFavorites = () => {
  favorites.innerHTML = "";
  const favoriteCharacters = allCharacters.filter((character) =>
    favoriteIds.has(character.id)
  );

  if (favoriteCharacters.length === 0) {
    favorites.innerHTML =
      "<p class='muted'>No favorites yet. Tap a star to save a companion.</p>";
    return;
  }

  favoriteCharacters.forEach((character) => {
    const card = document.createElement("div");
    card.className = "favorite";
    card.innerHTML = `
      <span>${character.name} · ${character.role}</span>
      <button class="ghost" type="button">Chat</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      selectCharacter(character);
      document.getElementById("chat-title").scrollIntoView({
        behavior: "smooth"
      });
    });
    favorites.appendChild(card);
  });
};

const renderHistory = () => {
  historyList.innerHTML = "";
  if (!currentProfile) {
    historyList.innerHTML =
      "<p class='muted'>Save a profile to unlock multi-session chat history.</p>";
    return;
  }

  const historyKey = `tavern-history-${currentProfile.id}`;
  const stored = JSON.parse(localStorage.getItem(historyKey) || "{}");
  const entries = Object.entries(stored);

  if (entries.length === 0) {
    historyList.innerHTML =
      "<p class='muted'>No conversations yet. Start chatting to build history.</p>";
    return;
  }

  entries.forEach(([characterId, messages]) => {
    const character = allCharacters.find((item) => item.id === characterId);
    if (!character) return;
    const lastMessage = messages[messages.length - 1];
    const card = document.createElement("div");
    card.className = "history__item";
    card.innerHTML = `
      <div>
        <strong>${character.name}</strong>
        <p>${lastMessage?.text || "Conversation saved."}</p>
      </div>
      <button class="ghost" type="button">Continue</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      selectCharacter(character);
      loadConversation(character.id);
    });
    historyList.appendChild(card);
  });
};

const updateStats = () => {
  statCharacters.textContent = allCharacters.length.toString();
  statFavorites.textContent = favoriteIds.size.toString();
  if (!currentProfile) {
    statConversations.textContent = "0";
    return;
  }
  const historyKey = `tavern-history-${currentProfile.id}`;
  const stored = JSON.parse(localStorage.getItem(historyKey) || "{}");
  statConversations.textContent = Object.keys(stored).length.toString();
};

const renderSpotlight = () => {
  const character = allCharacters[Math.floor(Math.random() * allCharacters.length)];
  if (!character) return;
  spotlight.innerHTML = `
    <img src="${character.portrait}" alt="Portrait of ${character.name}" />
    <div>
      <h3>${character.name}</h3>
      <p>${character.tagline}</p>
      <p><strong>Specialty:</strong> ${character.specialty}</p>
      <button class="primary" id="spotlight-chat">Chat now</button>
    </div>
  `;
  document
    .getElementById("spotlight-chat")
    .addEventListener("click", () => selectCharacter(character));
};

const selectCharacter = (character) => {
  activeCharacter = character;
  selectedCharacter.textContent = `${character.name} • ${character.role}`;
  chatSubtitle.textContent = character.lore;
  const hasHistory = loadConversation(character.id);
  if (!hasHistory) {
    addMessage(`You sit beside ${character.name}.`, "system");
  }
};

const addMessage = (text, type = "character") => {
  const message = document.createElement("div");
  message.className = `message ${type === "user" ? "message--user" : ""}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const persistMessage = (message, author) => {
  if (!currentProfile || !activeCharacter) return;
  const historyKey = `tavern-history-${currentProfile.id}`;
  const stored = JSON.parse(localStorage.getItem(historyKey) || "{}");
  const conversation = stored[activeCharacter.id] || [];
  conversation.push({ text: message, author, timestamp: Date.now() });
  stored[activeCharacter.id] = conversation.slice(-50);
  localStorage.setItem(historyKey, JSON.stringify(stored));
  renderHistory();
  updateStats();
};

const loadConversation = (characterId) => {
  chatMessages.innerHTML = "";
  if (!currentProfile) return false;
  const historyKey = `tavern-history-${currentProfile.id}`;
  const stored = JSON.parse(localStorage.getItem(historyKey) || "{}");
  const conversation = stored[characterId] || [];
  conversation.forEach((entry) => {
    addMessage(entry.text, entry.author === "user" ? "user" : "character");
  });
  return conversation.length > 0;
};

const handleSearch = (value) => {
  const query = value.toLowerCase();
  const filtered = allCharacters.filter((character) => {
    if (activeRoleFilter !== "All" && character.role !== activeRoleFilter) {
      return false;
    }
    return (
      character.name.toLowerCase().includes(query) ||
      character.role.toLowerCase().includes(query) ||
      character.vibe.toLowerCase().includes(query)
    );
  });
  renderCharacters(filtered);
};

const sendMessage = async (message) => {
  if (!activeCharacter) {
    addMessage("Choose a character before sending a message.", "system");
    return;
  }

  addMessage(message, "user");
  persistMessage(message, "user");
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      characterId: activeCharacter.id,
      mood: moodSelect.value
    })
  });
  if (!response.ok) {
    const fallback = fallbackReply(activeCharacter);
    addMessage(`${activeCharacter.name}: ${fallback}`);
    persistMessage(`${activeCharacter.name}: ${fallback}`, "character");
    return;
  }
  const data = await response.json();
  addMessage(`${activeCharacter.name}: ${data.reply}`);
  persistMessage(`${activeCharacter.name}: ${data.reply}`, "character");
};

const toggleAmbienceMode = () => {
  ambienceOn = !ambienceOn;
  document.body.classList.toggle("ambience--on", ambienceOn);
  toggleAmbience.textContent = ambienceOn ? "Ambience On" : "Toggle Ambience";
  showToast(ambienceOn ? "Ambience engaged ✨" : "Ambience paused");
};

const toggleFavorite = (character) => {
  if (favoriteIds.has(character.id)) {
    favoriteIds.delete(character.id);
  } else {
    favoriteIds.add(character.id);
  }
  localStorage.setItem("tavern-favorites", JSON.stringify([...favoriteIds]));
  renderFavorites();
  updateStats();
};

const loadFavorites = () => {
  const stored = localStorage.getItem("tavern-favorites");
  if (stored) {
    favoriteIds = new Set(JSON.parse(stored));
  }
};

const renderQuickPrompts = () => {
  quickPrompts.innerHTML = "";
  quickPromptOptions.forEach((prompt) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = prompt;
    button.addEventListener("click", () => {
      chatInput.value = prompt;
      chatInput.focus();
    });
    quickPrompts.appendChild(button);
  });
};

const saveChatLog = () => {
  const messages = Array.from(chatMessages.querySelectorAll(".message")).map(
    (item) => item.textContent
  );
  localStorage.setItem("tavern-chat", JSON.stringify(messages));
  addMessage("Chat saved to your local journal.", "system");
};

const restoreChatLog = () => {
  const stored = localStorage.getItem("tavern-chat");
  if (!stored) return;
  JSON.parse(stored).forEach((message) => addMessage(message, "system"));
};

const saveProfile = () => {
  const name = profileName.value.trim();
  const email = profileEmail.value.trim();
  if (!name || !email) {
    addMessage("Add a name and email to save your profile.", "system");
    return;
  }
  currentProfile = { id: email.toLowerCase(), name, email };
  localStorage.setItem("tavern-profile", JSON.stringify(currentProfile));
  profileCard.innerHTML = `
    <h3>${name}</h3>
    <p>${email}</p>
    <p class="muted">Profile active. Your chats will be saved.</p>
  `;
  showToast("Profile saved. Welcome back!");
  renderHistory();
  updateStats();
};

const loadProfile = () => {
  const stored = localStorage.getItem("tavern-profile");
  if (!stored) return;
  currentProfile = JSON.parse(stored);
  profileName.value = currentProfile.name;
  profileEmail.value = currentProfile.email;
  profileCard.innerHTML = `
    <h3>${currentProfile.name}</h3>
    <p>${currentProfile.email}</p>
    <p class="muted">Profile active. Your chats will be saved.</p>
  `;
};

startJourney.addEventListener("click", () => {
  document.getElementById("characters-title").scrollIntoView({
    behavior: "smooth"
  });
});

toggleAmbience.addEventListener("click", toggleAmbienceMode);

searchInput.addEventListener("input", (event) => {
  handleSearch(event.target.value);
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.value = "";
  sendMessage(message);
});

saveChat.addEventListener("click", saveChatLog);
profileSave.addEventListener("click", saveProfile);
moodSelect.addEventListener("change", () => {
  statMood.textContent = moodSelect.value;
});

openAiGuide.addEventListener("click", () => aiGuide.showModal());
closeAiGuide.addEventListener("click", () => aiGuide.close());

const init = async () => {
  const responses = await Promise.allSettled([
    fetch("/api/themes"),
    fetch("/api/characters"),
    fetch("/api/quests"),
    fetch("/api/ambience"),
    fetch("/api/story-sparks")
  ]);

  const [themesResponse, charactersResponse, questsResponse, ambienceResponse, sparksResponse] =
    responses.map((result) => (result.status === "fulfilled" ? result.value : null));

  const themes = themesResponse?.ok
    ? await themesResponse.json()
    : themeFallbacks;
  allCharacters = charactersResponse?.ok
    ? await charactersResponse.json()
    : generateCharacters();
  const questItems = questsResponse?.ok
    ? await questsResponse.json()
    : questFallbacks;
  const ambienceItems = ambienceResponse?.ok
    ? await ambienceResponse.json()
    : { tracks: ambienceFallbacks };
  const sparkItems = sparksResponse?.ok
    ? await sparksResponse.json()
    : quickPromptOptions;

  if (themes.length) {
    renderThemes(themes);
    loadTheme(themes);
  }
  renderCharacters(allCharacters);
  renderRoleFilters();
  renderQuests(questItems);
  renderAmbience(ambienceItems.tracks);
  renderSparks(sparkItems);
  renderQuickPrompts();
  loadFavorites();
  renderFavorites();
  renderSpotlight();
  loadProfile();
  renderHistory();
  updateStats();
  statMood.textContent = moodSelect.value;

  addMessage("The tavern welcomes you. Choose a companion to begin.");
  restoreChatLog();
};

init();
