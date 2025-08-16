// ===== Storage keys =====
const LS_KEY_QUOTES = "dqg:quotes";
const LS_KEY_FILTER = "dqg:lastFilter";

// ===== State =====
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do one thing every day that scares you.", category: "Motivation" }
];

// ===== DOM =====
const quoteDisplay = document.getElementById("quoteDisplay");
const quoteMeta = document.getElementById("quoteMeta");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");

// ===== Storage =====
function saveQuotes() {
  localStorage.setItem(LS_KEY_QUOTES, JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem(LS_KEY_QUOTES);
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

function saveFilter(cat) {
  localStorage.setItem(LS_KEY_FILTER, cat);
}

function loadFilter() {
  return localStorage.getItem(LS_KEY_FILTER) || "all";
}

// ===== Populate Categories =====
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = loadFilter();
  if (categories.includes(savedFilter) || savedFilter === "all") {
    categoryFilter.value = savedFilter;
  } else {
    categoryFilter.value = "all";
  }
}

// ===== Show Random Quote =====
function showRandomQuote() {
  const selected = categoryFilter.value;
  let pool = quotes;

  if (selected !== "all") {
    pool = quotes.filter(q => q.category === selected);
  }

  if (pool.length > 0) {
    const q = pool[Math.floor(Math.random() * pool.length)];
    quoteDisplay.textContent = `“${q.text}”`;
    quoteMeta.textContent = `— ${q.category}`;
  } else {
    quoteDisplay.textContent = "No quotes available.";
    quoteMeta.textContent = "";
  }
}

// ===== Filter Quotes =====
function filterQuotes() {
  const selected = categoryFilter.value;
  saveFilter(selected);
  showRandomQuote();
}

// ===== Add Quote Form =====
function createAddQuoteForm() {
  const formSection = document.createElement("div");
  formSection.classList.add("form-section");

  const heading = document.createElement("h3");
  heading.textContent = "Add a New Quote";

  const inputText = document.createElement("input");
  inputText.placeholder = "Enter a new quote";

  const inputCat = document.createElement("input");
  inputCat.placeholder = "Enter quote category";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";

  btn.onclick = () => {
    if (inputText.value && inputCat.value) {
      quotes.push({ text: inputText.value, category: inputCat.value });
      saveQuotes();
      populateCategories();
      filterQuotes();
      inputText.value = "";
      inputCat.value = "";
      alert("Quote added!");
    }
  };

  formSection.appendChild(heading);
  formSection.appendChild(inputText);
  formSection.appendChild(inputCat);
  formSection.appendChild(btn);

  document.body.appendChild(formSection);
}

// ===== Import / Export =====
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    const imported = JSON.parse(e.target.result);
    if (Array.isArray(imported)) {
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported!");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ===== Init =====
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportQuotes);
importFileInput.addEventListener("change", importFromJsonFile);

loadQuotes();
populateCategories();
createAddQuoteForm();
filterQuotes();

// ====== Server Sync Simulation ======

// Fetch quotes from server (simulated with JSONPlaceholder or mock API)
async function fetchFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverQuotes = await res.json();

    // Convert server posts to quote objects
    const converted = serverQuotes.map(p => ({
      text: p.title,
      category: "Server"
    }));

    handleServerData(converted);
  } catch (err) {
    console.error("Failed to fetch from server:", err);
  }
}

// Push local quotes to server (simulation)
async function pushToServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quotes),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      console.log("Local quotes pushed to server.");
    }
  } catch (err) {
    console.error("Failed to push to server:", err);
  }
}

// Conflict resolution: server wins
function handleServerData(serverQuotes) {
  const serverTitles = serverQuotes.map(q => q.text);
  const localTitles = quotes.map(q => q.text);

  let updated = false;

  serverQuotes.forEach(sq => {
    if (!localTitles.includes(sq.text)) {
      quotes.push(sq);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes updated from server (server data took precedence).");
  }
}

// Start sync loop
function startSync() {
  fetchFromServer();
  setInterval(fetchFromServer, 15000); // every 15s
  setInterval(pushToServer, 30000);   // every 30s
}

startSync();




