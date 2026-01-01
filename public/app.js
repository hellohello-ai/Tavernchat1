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

let allCharacters = [];
let activeCharacter = null;
let ambienceOn = false;
let favoriteIds = new Set();

const quickPromptOptions = [
  "Tell me a cozy tavern secret.",
  "What adventure brought you here?",
  "Share a calming recipe.",
  "Sing a short tavern verse.",
  "Who should I meet next?"
];

const setTheme = (palette) => {
  const root = document.documentElement;
  root.style.setProperty("--background", palette.background);
  root.style.setProperty("--surface", palette.surface);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--text", palette.text);
  root.style.setProperty("--glow", palette.glow);
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
    const card = document.createElement("button");
    card.className = "character-card";
    card.type = "button";
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

    card.addEventListener("click", (event) => {
      if (event.target.classList.contains("favorite-toggle")) {
        event.stopPropagation();
        toggleFavorite(character);
        renderCharacters(characters);
        return;
      }
      selectCharacter(character);
    });
    characterGrid.appendChild(card);
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
  addMessage(`You sit beside ${character.name}.`, "system");
};

const addMessage = (text, type = "character") => {
  const message = document.createElement("div");
  message.className = `message ${type === "user" ? "message--user" : ""}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const handleSearch = (value) => {
  const query = value.toLowerCase();
  const filtered = allCharacters.filter((character) => {
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
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      characterId: activeCharacter.id,
      mood: moodSelect.value
    })
  });
  const data = await response.json();
  addMessage(`${activeCharacter.name}: ${data.reply}`);
};

const toggleAmbienceMode = () => {
  ambienceOn = !ambienceOn;
  document.body.classList.toggle("ambience--on", ambienceOn);
  toggleAmbience.textContent = ambienceOn ? "Ambience On" : "Toggle Ambience";
};

const toggleFavorite = (character) => {
  if (favoriteIds.has(character.id)) {
    favoriteIds.delete(character.id);
  } else {
    favoriteIds.add(character.id);
  }
  localStorage.setItem("tavern-favorites", JSON.stringify([...favoriteIds]));
  renderFavorites();
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

openAiGuide.addEventListener("click", () => aiGuide.showModal());
closeAiGuide.addEventListener("click", () => aiGuide.close());

const init = async () => {
  const [
    themesResponse,
    charactersResponse,
    questsResponse,
    ambienceResponse,
    sparksResponse
  ] = await Promise.all([
    fetch("/api/themes"),
    fetch("/api/characters"),
    fetch("/api/quests"),
    fetch("/api/ambience"),
    fetch("/api/story-sparks")
  ]);

  const themes = await themesResponse.json();
  allCharacters = await charactersResponse.json();
  const questItems = await questsResponse.json();
  const ambienceItems = await ambienceResponse.json();
  const sparkItems = await sparksResponse.json();

  renderThemes(themes);
  renderCharacters(allCharacters);
  renderQuests(questItems);
  renderAmbience(ambienceItems.tracks);
  renderSparks(sparkItems);
  renderQuickPrompts();

  loadTheme(themes);
  loadFavorites();
  renderFavorites();
  renderSpotlight();

  addMessage("The tavern welcomes you. Choose a companion to begin.");
  restoreChatLog();
};

init();
