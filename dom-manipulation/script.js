// ===== State =====
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do one thing every day that scares you.", category: "Motivation" }
];

// ===== DOM elements =====
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");

// ===== Local Storage =====
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes)); // explicit
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes"); // explicit
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// ===== Session Storage =====
function saveLastQuote(quote) {
  sessionStorage.setItem("lastQuote", JSON.stringify(quote)); // explicit
}

function loadLastQuote() {
  const stored = sessionStorage.getItem("lastQuote"); // explicit
  return stored ? JSON.parse(stored) : null;
}

// ===== Category handling =====
function updateCategorySelect() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

// ===== Show random quote =====
function showRandomQuote() {
  const selected = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selected);
  if (filtered.length > 0) {
    const q = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.textContent = q.text;
    saveLastQuote(q);
  } else {
    quoteDisplay.textContent = "No quotes available.";
  }
}

// ===== Add quote form =====
function createAddQuoteForm() {
  const div = document.createElement("div");
  div.classList.add("form-section");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCat = document.createElement("input");
  inputCat.id = "newQuoteCategory";
  inputCat.placeholder = "Enter quote category";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.onclick = () => {
    if (inputText.value && inputCat.value) {
      quotes.push({ text: inputText.value, category: inputCat.value });
      saveQuotes();
      updateCategorySelect();
      alert("Quote added!");
      inputText.value = "";
      inputCat.value = "";
    }
  };

  div.appendChild(inputText);
  div.appendChild(inputCat);
  div.appendChild(btn);
  document.body.appendChild(div);
}

// ===== Export / Import =====
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
      updateCategorySelect();
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
updateCategorySelect();
createAddQuoteForm();

const last = loadLastQuote();
if (last) {
  quoteDisplay.textContent = last.text;
} else {
  showRandomQuote();
}



