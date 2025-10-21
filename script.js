// ===== DOM ELEMENTS =====
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const amountInput = document.getElementById("amount");
const result = document.getElementById("result");
const updateTime = document.getElementById("updateTime");
const themeToggle = document.getElementById("themeToggle");

// ===== CREATE CONVERT BUTTON DYNAMICALLY =====
const convertBtn = document.createElement("button");
convertBtn.textContent = "Convert 💱";
convertBtn.id = "convertBtn";
convertBtn.style.cssText = `
  width: 100%;
  margin-top: 20px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s ease;
`;
document.querySelector(".converter").appendChild(convertBtn);

convertBtn.addEventListener("mouseover", () => {
  convertBtn.style.backgroundColor = "#0056b3";
});
convertBtn.addEventListener("mouseout", () => {
  convertBtn.style.backgroundColor = "#007bff";
});

// ===== POPULATE DROPDOWNS =====
function populateDropdowns() {
  const codes = Object.keys(countryList).sort();
  codes.forEach(code => {
    const opt1 = document.createElement("option");
    opt1.value = code;
    opt1.textContent = code;

    const opt2 = opt1.cloneNode(true);

    fromCurrency.appendChild(opt1);
    toCurrency.appendChild(opt2);
  });
  fromCurrency.value = "USD";
  toCurrency.value = "INR";
}

// ===== UPDATE FLAG IMAGE =====
function updateFlag(selectEl, flagEl) {
  const code = countryList[selectEl.value];
  if (code) {
    flagEl.src = `https://flagsapi.com/${code}/flat/64.png`;
  } else {
    flagEl.src = "";
  }
}

// ===== FETCH AND CONVERT =====
async function convertCurrency() {
  const amt = parseFloat(amountInput.value);
  if (isNaN(amt) || amt <= 0) {
    result.textContent = "Enter a valid amount.";
    updateTime.textContent = "";
    return;
  }

  const from = fromCurrency.value;
  const to = toCurrency.value;
  result.textContent = "Fetching rates...";

  // 1️⃣ Primary API
  const primaryAPI = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amt}`;
  // 2️⃣ Backup API
  const fallbackAPI = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;

  try {
    let converted, dateText;

    // Try primary API first
    let res = await fetch(primaryAPI);
    if (!res.ok) throw new Error("Primary API unavailable");

    let data = await res.json();
    if (data && data.result) {
      converted = data.result.toFixed(2);
      dateText = data.date || new Date().toLocaleString();
    } else {
      throw new Error("Primary API invalid data");
    }

    result.textContent = `${amt} ${from} = ${converted} ${to}`;
    updateTime.textContent = `Last updated: ${dateText}`;
  } catch (err) {
    console.warn("Primary API failed, trying fallback...", err);

    try {
      const res2 = await fetch(fallbackAPI);
      if (!res2.ok) throw new Error("Fallback API also unavailable");

      const data2 = await res2.json();
      if (data2 && data2.rates && data2.rates[to]) {
        const converted = (amt * data2.rates[to]).toFixed(2);
        result.textContent = `${amt} ${from} = ${converted} ${to}`;
        updateTime.textContent = `Backup rate date: ${data2.date}`;
      } else {
        throw new Error("Fallback API invalid data");
      }
    } catch (fallbackErr) {
      console.error("Fallback API failed:", fallbackErr);
      result.textContent = "Error fetching rates. Please try again later.";
      updateTime.textContent = "";
    }
  }
}

// ===== INITIALIZE APP =====
function init() {
  populateDropdowns();
  updateFlag(fromCurrency, fromFlag);
  updateFlag(toCurrency, toFlag);

  fromCurrency.addEventListener("change", () => updateFlag(fromCurrency, fromFlag));
  toCurrency.addEventListener("change", () => updateFlag(toCurrency, toFlag));
  convertBtn.addEventListener("click", convertCurrency);

  // 🌙 Theme Toggle
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  });
}

init();
