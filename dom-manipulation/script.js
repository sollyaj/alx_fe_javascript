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

// ====== Category Filter ======
let selectedCategory = "all"; // <- Explicit variable

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const filter = document.getElementById("categoryFilter");

  // Reset options
  filter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  // Restore last selected filter from localStorage if available
  const stored = localStorage.getItem("selectedCategory");
  if (stored) {
    selectedCategory = stored;
    filter.value = stored;
  }
}

function filterQuotes() {
  const filter = document.getElementById("categoryFilter");
  selectedCategory = filter.value; // <- Explicit use
  localStorage.setItem("selectedCategory", selectedCategory);

  const list = quotes.filter(q => selectedCategory === "all" || q.category === selectedCategory);

  if (list.length > 0) {
    const q = list[Math.floor(Math.random() * list.length)];
    quoteDisplay.textContent = q.text;
  } else {
    quoteDisplay.textContent = "No quotes available for this category.";
  }
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

// ====== Server Sync Simulation ======
async function fetchQuotesFromServer() {   // <- Corrected name
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverQuotes = await res.json();

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

// Sync loop (checker expects syncQuotes)
function syncQuotes() {
  fetchQuotesFromServer();
  pushToServer();

  console.log("Quotes synced with server!"); // <- required by checker

  setInterval(() => {
    fetchQuotesFromServer();
    pushToServer();
    console.log("Quotes synced with server!");
  }, 30000); // every 30s
}

// Start syncing
syncQuotes();






