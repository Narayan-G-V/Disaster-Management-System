/***********************
 GLOBAL STATE
************************/
// Safe localStorage helpers with validation
function safeGetItem(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e);
    return false;
  }
}

// Check login status
if (localStorage.getItem("sc_loggedIn") !== "true") {
  localStorage.setItem("sc_loggedIn", "true"); // Auto-login for demo
}

let learnedDisasters = safeGetItem("learned", []);
let kitItems = safeGetItem("kit", []);
let quizzesCompleted = parseInt(localStorage.getItem("quizzesDone")) || 0;
let quizHistory = safeGetItem("quizHistory", []);

// Validate data structures
if (!Array.isArray(learnedDisasters)) learnedDisasters = [];
if (!Array.isArray(kitItems)) kitItems = [];
if (!Array.isArray(quizHistory)) quizHistory = [];

/***********************
 DATA: DISASTERS
************************/
// Icon mapping for disasters
const disasterIcons = {
  "Earthquake": "fa-house-crack",
  "Flood": "fa-water",
  "Cyclone": "fa-hurricane",
  "Tsunami": "fa-house-tsunami",
  "Landslide": "fa-hill-rockslide",
  "Heatwave": "fa-temperature-arrow-up",
  "Drought": "fa-sun-plant-wilt",
  "Volcanic Eruption": "fa-volcano",
  "Lightning": "fa-bolt-lightning",
  "Forest Fire": "fa-fire-tree",
  "Urban Fire": "fa-building-fire",
  "Chemical Spill": "fa-flask-vial",
  "Industrial Accident": "fa-industry",
  "Nuclear Accident": "fa-radiation",
  "Gas Leak": "fa-bottle-droplet",
  "Cyber Attack": "fa-laptop-code",
  "Pandemic": "fa-virus",
  "Stampede": "fa-people-group",
  "Terror Attack": "fa-person-rifle",
  "Power Grid Failure": "fa-plug-circle-xmark"
};

const hazards = {
  "Earthquake": `<h2>🌍 Earthquake</h2><p>An earthquake is the sudden shaking of the ground caused by the passage of seismic waves through Earth's rocks.</p><h3>Causes</h3><p>Tectonic plate movements along fault lines.<br>Volcanic eruptions releasing energy.<br>Human activities like mining or reservoir induced seismicity.</p><h3>Impacts</h3><p>Collapse of buildings and infrastructure.<br>Landslides, tsunamis, and soil liquefaction.<br>Loss of life and economic disruption.</p><h3>Safety Measures</h3><p><strong>Drop, Cover, and Hold On</strong> during shaking.<br>Stay away from windows and heavy furniture.<br>If outdoors, move to an open area away from buildings.<br>Prepare an emergency kit with supplies for 3 days.</p>`,
  "Flood": `<h2>🌊 Flood</h2><p>A flood is an overflow of water that submerges land that is usually dry.</p><h3>Causes</h3><p>Heavy rainfall exceeding drainage capacity.<br>Overflowing rivers or broken dams.<br>Storm surges and tsunamis in coastal areas.</p><h3>Impacts</h3><p>Destruction of homes and property.<br>Spread of waterborne diseases.<br>Disruption of transport and power supply.</p><h3>Safety Measures</h3><p>Move to higher ground immediately.<br>Do not walk or drive through floodwaters.<br>Disconnect electrical appliances if safe to do so.<br>Listen to emergency broadcasts for updates.</p>`,
  "Cyclone": `<h2>🌪 Cyclone</h2><p>A cyclone is a large-scale air mass that rotates around a strong center of low atmospheric pressure.</p><h3>Causes</h3><p>Warm ocean temperatures (above 26.5°C).<br>Atmospheric instability and high humidity.<br>Low vertical wind shear.</p><h3>Impacts</h3><p>Strong destructive winds and heavy rainfall.<br>Storm surges causing coastal flooding.<br>Uprooting of trees and power lines.</p><h3>Safety Measures</h3><p>Secure loose items around your home.<br>Board up windows or use storm shutters.<br>Evacuate immediately if advised by authorities.<br>Stay indoors during the eye of the storm.</p>`,
  "Tsunami": `<h2>🌊 Tsunami</h2><p>A tsunami is a series of waves in a water body caused by the displacement of a large volume of water.</p><h3>Causes</h3><p>Undersea earthquakes or volcanic eruptions.<br>Landslides or meteorite impacts.<br>Calving of glaciers.</p><h3>Impacts</h3><p>Massive coastal inundation and destruction.<br>Salinization of soil and water sources.<br>High casualty rates due to rapid onset.</p><h3>Safety Measures</h3><p>Move to high ground immediately if you feel shaking.<br>Do not wait for an official warning if you see the sea recede.<br>Stay away from the beach until authorities declare it safe.<br>Follow evacuation routes marked by signage.</p>`,
  "Landslide": `<h2>⛰ Landslide</h2><p>A landslide is the movement of a mass of rock, debris, or earth down a slope.</p><h3>Causes</h3><p>Heavy rainfall saturating the soil.<br>Earthquakes shaking loose material.<br>Deforestation and construction destabilizing slopes.</p><h3>Impacts</h3><p>Burial of villages and roads.<br>Damming of rivers leading to flash floods.<br>Destruction of agricultural land.</p><h3>Safety Measures</h3><p>Stay alert during heavy rain if you live near slopes.<br>Listen for unusual sounds like trees cracking.<br>Move away from the path of a landslide immediately.<br>Curl into a tight ball and protect your head if trapped.</p>`,
  "Heatwave": `<h2>🌡 Heatwave</h2><p>A heatwave is a period of excessively hot weather, which may be accompanied by high humidity.</p><h3>Causes</h3><p>High-pressure systems trapping hot air.<br>Climate change increasing global temperatures.<br>Urban heat island effect.</p><h3>Impacts</h3><p>Heat exhaustion, heatstroke, and dehydration.<br>Power outages due to high demand.<br>Crop failure and wildfires.</p><h3>Safety Measures</h3><p>Stay hydrated by drinking plenty of water.<br>Avoid strenuous activity during the hottest part of the day.<br>Stay indoors in air-conditioned or cool places.<br>Check on elderly neighbors and vulnerable people.</p>`,
  "Drought": `<h2>☀ Drought</h2><p>A drought is a prolonged period of abnormally low rainfall, leading to a shortage of water.</p><h3>Causes</h3><p>Lack of precipitation over an extended period.<br>Climate variability (e.g., El Niño).<br>Over-extraction of groundwater.</p><h3>Impacts</h3><p>Crop failure and food shortages.<br>Water scarcity for drinking and sanitation.<br>Economic loss in agriculture.</p><h3>Safety Measures</h3><p>Conserve water by fixing leaks and using it wisely.<br>Harvest rainwater where possible.<br>Plant drought-resistant crops and gardens.<br>Follow local water restriction guidelines.</p>`,
  "Volcanic Eruption": `<h2>🌋 Volcanic Eruption</h2><p>A volcanic eruption occurs when lava and gas are discharged from the volcanic vent.</p><h3>Causes</h3><p>Build-up of pressure from magma below the surface.<br>Tectonic plate movement allowing magma to rise.</p><h3>Impacts</h3><p>Lava flows destroying everything in their path.<br>Ash clouds causing respiratory problems and flight disruption.<br>Pyroclastic flows which are fast and deadly.</p><h3>Safety Measures</h3><p>Evacuate immediately if ordered by authorities.<br>Wear a mask to protect against volcanic ash.<br>Avoid low-lying areas where lava and gas can collect.<br>Close windows and doors to keep out ash.</p>`,
  "Lightning": `<h2>⚡ Lightning</h2><p>Lightning is a sudden electrostatic discharge that occurs during a thunderstorm.</p><h3>Causes</h3><p>Imbalance of electrical charge within clouds.<br>Friction between ice particles in the atmosphere.</p><h3>Impacts</h3><p>Electrocution and severe burns.<br>Forest fires and house fires.<br>Damage to electronic equipment.</p><h3>Safety Measures</h3><p>Go indoors immediately when you hear thunder.<br>Avoid open fields, tall trees, and water bodies.<br>Stay away from windows and corded electronics.<br>Wait 30 minutes after the last thunder before going out.</p>`,
  "Forest Fire": `<h2>🔥 Forest Fire</h2><p>A wildfire is an uncontrolled fire causing combustion of vegetation in rural or urban areas.</p><h3>Causes</h3><p>Lightning strikes during dry conditions.<br>Human negligence (campfires, cigarettes).<br>Arson or electrical sparks.</p><h3>Impacts</h3><p>Destruction of forests and wildlife habitats.<br>Air pollution from smoke.<br>Threat to human life and property.</p><h3>Safety Measures</h3><p>Create a defensible space around your home.<br>Have an evacuation plan ready.<br>Report smoke or fire immediately.<br>Do not light fires in dry, windy conditions.</p>`,
  "Urban Fire": `<h2>🏢 Urban Fire</h2><p>Urban fire implies fire in cities or towns with potential for rapid spread.</p><h3>Causes</h3><p>Electrical short circuits.<br>Gas leaks or cooking accidents.<br>Poor building safety standards.</p><h3>Impacts</h3><p>Loss of life and severe injuries.<br>Destruction of buildings and property.<br>Disruption of local economy.</p><h3>Safety Measures</h3><p>Install smoke alarms and test them regularly.<br>Have a fire extinguisher and know how to use it.<br>Crawl low under smoke to escape.<br>Do not use elevators during a fire.</p>`,
  "Chemical Spill": `<h2>🧪 Chemical Spill</h2><p>A chemical spill is the uncontrolled release of a hazardous chemical into the environment.</p><h3>Causes</h3><p>Industrial accidents or equipment failure.<br>Transportation accidents (trains, trucks).<br>Improper storage or handling.</p><h3>Impacts</h3><p>Contamination of air, water, and soil.<br>Acute health effects (burns, poisoning).<br>Long-term environmental damage.</p><h3>Safety Measures</h3><p>Evacuate the area immediately, moving upwind.<br>Do not touch or walk through spilled chemicals.<br>Seal windows and doors if sheltering in place.<br>Decontaminate immediately if exposed.</p>`,
  "Industrial Accident": `<h2>🏭 Industrial Accident</h2><p>An industrial accident is a disaster that occurs within an industrial setting.</p><h3>Causes</h3><p>Equipment failure or malfunction.<br>Human error or lack of training.<br>Failure to follow safety protocols.</p><h3>Impacts</h3><p>Explosions, fires, or toxic releases.<br>Pollution of the surrounding environment.<br>Worker injuries and fatalities.</p><h3>Safety Measures</h3><p>Follow all workplace safety regulations.<br>Participate in regular safety drills.<br>Report hazards to management immediately.<br>Know the location of emergency exits and equipment.</p>`,
  "Nuclear Accident": `<h2>☢ Nuclear Accident</h2><p>A nuclear accident involves significant release of radioactivity with potential for harm.</p><h3>Causes</h3><p>Reactor core meltdown.<br>Failure of cooling systems.<br>Natural disasters affecting power plants.</p><h3>Impacts</h3><p>Radiation sickness and increased cancer risk.<br>Long-term contamination of land.<br>Displacement of populations.</p><h3>Safety Measures</h3><p>Get inside, stay inside, and stay tuned.<br>Take potassium iodide pills if distributed.<br>Close all ventilation systems.<br>Remove contaminated clothing and shower.</p>`,
  "Gas Leak": `<h2>🛢 Gas Leak</h2><p>A gas leak is a leak of natural gas or other gaseous product from a pipeline or containment.</p><h3>Causes</h3><p>Corrosion or damage to pipelines.<br>Faulty appliances or connections.<br>Excavation accidents.</p><h3>Impacts</h3><p>Explosions and fires.<br>Asphyxiation or poisoning.<br>Displacement of residents.</p><h3>Safety Measures</h3><p>Evacuate the building immediately.<br>Do not turn lights on or off (sparks).<br>Shut off the main gas valve if safe.<br>Call emergency services from a safe distance.</p>`,
  "Cyber Attack": `<h2>💻 Cyber Attack</h2><p>A cyber attack is an offensive maneuver to target computer information systems.</p><h3>Causes</h3><p>Malicious hackers or state actors.<br>Software vulnerabilities.<br>Phishing and social engineering.</p><h3>Impacts</h3><p>Theft of sensitive data and identity.<br>Disruption of critical infrastructure.<br>Financial loss.</p><h3>Safety Measures</h3><p>Use strong, unique passwords and 2FA.<br>Keep software and antivirus updated.<br>Do not click on suspicious links.<br>Back up important data regularly.</p>`,
  "Pandemic": `<h2>🦠 Pandemic</h2><p>A pandemic is an epidemic of an infectious disease that has spread across a large region.</p><h3>Causes</h3><p>Novel viruses jumping from animals to humans.<br>Global travel facilitating rapid spread.<br>Lack of immunity in the population.</p><h3>Impacts</h3><p>High morbidity and mortality rates.<br>Overwhelming of healthcare systems.<br>Economic recession and social disruption.</p><h3>Safety Measures</h3><p>Wash hands frequently with soap and water.<br>Wear a mask in crowded indoor spaces.<br>Main social distancing guidelines.<br>Get vaccinated when available.</p>`,
  "Stampede": `<h2>👥 Stampede</h2><p>A stampede is an uncontrolled human stampede or crush.</p><h3>Causes</h3><p>Panic triggered by a perceived threat.<br>Overcrowding in confined spaces.<br>Poor crowd management.</p><h3>Impacts</h3><p>Crush injuries and asphyxiation.<br>Fatalities due to trampling.<br>Psychological trauma.</p><h3>Safety Measures</h3><p>Identify exits immediately upon entering a venue.<br>Stay on your feet and move with the flow.<br>Create space around your chest with your arms.<br>If you fall, curl into a ball to protect vital organs.</p>`,
  "Terror Attack": `<h2>🚨 Terror Attack</h2><p>A terror attack is a violent act intended to create fear for political or ideological goals.</p><h3>Causes</h3><p>Political, religious, or ideological extremism.<br>Social and economic grievances.</p><h3>Impacts</h3><p>Loss of innocent lives.<br>Destruction of property and infrastructure.<br>Psychological fear and instability.</p><h3>Safety Measures</h3><p><strong>Run, Hide, Fight</strong> protocol.<br>Stay alert and report suspicious activity.<br>Leave the area immediately if safe.<br>Follow instructions from law enforcement.</p>`,
  "Power Grid Failure": `<h2>⚡ Power Grid Failure</h2><p>A power grid failure is a widespread loss of electrical power supply.</p><h3>Causes</h3><p>Severe weather damaging lines.<br>Equipment failure or overload.<br>Cyber attacks on grid infrastructure.</p><h3>Impacts</h3><p>Loss of lighting, heating and cooling.<br>Disruption of communication and transport.<br>Failure of medical equipment.</p><h3>Safety Measures</h3><p>Have backup flashlights and batteries.<br>Keep a supply of non-perishable food.<br>Do not run generators indoors.<br>Unplug sensitive electronics to prevent surge damage.</p>`
};

const disasterSummaries = {
  "Earthquake": "Sudden ground shaking caused by tectonic movements.",
  "Flood": "Overflow of water onto normally dry land.",
  "Cyclone": "Powerful rotating storm with strong winds and rain.",
  "Tsunami": "Large ocean waves caused by underwater disturbances.",
  "Landslide": "Movement of rock, earth, or debris down a slope.",
  "Heatwave": "Prolonged period of excessively hot weather.",
  "Drought": "Extended period of water supply shortage.",
  "Volcanic Eruption": "Release of magma, ash, and gases from a volcano.",
  "Lightning": "High-voltage electrostatic discharge during storms.",
  "Forest Fire": "Uncontrolled fire in a wooded or grassy area.",
  "Urban Fire": "Uncontrolled fire in city buildings or structures.",
  "Chemical Spill": "Accidental release of hazardous chemical substances.",
  "Industrial Accident": "Disaster occurring within an industrial setting.",
  "Nuclear Accident": "Event involving significant release of radioactivity.",
  "Gas Leak": "Unintended leak of natural gas or other gaseous products.",
  "Cyber Attack": "Malicious attempt to damage or disrupt computer systems.",
  "Pandemic": "Global outbreak of an infectious disease.",
  "Stampede": "Uncontrolled rushing of a crowd causing injuries.",
  "Terror Attack": "Violent act intended to create fear and harm.",
  "Power Grid Failure": "Widespread loss of electrical power supply."
};

// Disaster Categories
const disasterCategories = {
  natural: ["Earthquake", "Flood", "Cyclone", "Tsunami", "Landslide", "Heatwave", "Drought", "Volcanic Eruption", "Lightning"],
  manmade: ["Forest Fire", "Urban Fire", "Chemical Spill", "Industrial Accident", "Nuclear Accident", "Gas Leak", "Cyber Attack", "Pandemic", "Stampede", "Terror Attack", "Power Grid Failure"]
};

let currentFilter = 'all'; // Track current filter: 'all', 'natural', or 'manmade'

/***********************
 NAVIGATION & UI
************************/
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
    sec.style.display = "none"; // Ensure complete hide
  });

  const activeSec = document.getElementById(id);
  activeSec.style.display = "block";
  // Small delay to allow display:block to apply before adding class for opacity transition
  setTimeout(() => activeSec.classList.add("active"), 10);

  // Update Navbar
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  // Find link that calls this section
  const navLink = document.querySelector(`.nav-link[onclick="showSection('${id}')"]`);
  if (navLink) navLink.classList.add("active");

  // Specific Logic
  if (id === "library") renderLibrary();
  if (id === "kit") loadKitCategory('water', document.querySelector('.category-btn')); // Load default

  updateProgress();

  // Close mobile menu if open
  document.querySelector(".navbar nav").classList.remove("show");
}

function toggleMobileMenu() {
  document.querySelector(".navbar nav").classList.toggle("show");
}

function logout() {
  localStorage.removeItem("sc_loggedIn");
  location.reload();
}

/***********************
 LIBRARY LOGIC
************************/
function renderLibrary() {
  const grid = document.getElementById("disasterGrid");
  if (!grid) return;
  grid.innerHTML = "";

  // Determine which disasters to show based on current filter
  let disastersToShow = Object.keys(hazards);
  if (currentFilter === 'natural') {
    disastersToShow = disasterCategories.natural;
  } else if (currentFilter === 'manmade') {
    disastersToShow = disasterCategories.manmade;
  }

  disastersToShow.forEach(name => {
    const isLearned = learnedDisasters.includes(name);
    const iconClass = disasterIcons[name] || "fa-triangle-exclamation";
    const summary = disasterSummaries[name] || "Click to learn more.";

    const card = document.createElement("div");
    card.className = "card disaster-card";
    if (isLearned) card.classList.add("learned"); // Add styling for learned later if needed

    card.innerHTML = `
      <div class="icon"><i class="fa-solid ${iconClass}"></i></div>
      <h3>${name}</h3>
      <p class="summary">${summary}</p>
      <div class="status">${isLearned ? '<span style="color:var(--secondary)"><i class="fa-solid fa-check"></i> Learned</span>' : '<span style="opacity:0.7">Click to Learn</span>'}</div>
    `;
    card.onclick = () => openDisaster(name);
    grid.appendChild(card);
  });
}

function showLibraryByCategory(category) {
  currentFilter = category;
  showSection('library');
  updateFilterButtons();
}

function filterByCategory(category) {
  currentFilter = category;
  renderLibrary();
  updateFilterButtons();
}

function updateFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });

  // Find and activate the correct button
  if (currentFilter === 'all') {
    buttons[0]?.classList.add('active');
    buttons[0]?.setAttribute('aria-pressed', 'true');
  } else if (currentFilter === 'natural') {
    buttons[1]?.classList.add('active');
    buttons[1]?.setAttribute('aria-pressed', 'true');
  } else if (currentFilter === 'manmade') {
    buttons[2]?.classList.add('active');
    buttons[2]?.setAttribute('aria-pressed', 'true');
  }
}

// Debounce helper
let searchTimeout;
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function filterDisasters() {
  const query = document.getElementById("disasterSearch").value.toLowerCase();
  const cards = document.querySelectorAll(".disaster-card");
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(query) ? "flex" : "none";
  });
}

// Debounced version for input event
const debouncedFilter = debounce(filterDisasters, 300);

function openDisaster(name) {
  showSection("hazardPage");
  const details = document.getElementById("hazardDetails");
  const content = hazards[name] || "<h2>Unknown Hazard</h2><p>No data available.</p>";

  details.innerHTML = `
    <div class="disaster-content">
      ${content}
    </div>
    <div style="margin-top: 30px; text-align: center;">
      <button class="learn-btn" onclick="markLearned('${name}')">
        ${learnedDisasters.includes(name) ? '<i class="fa-solid fa-check-double"></i> Review Complete' : '<i class="fa-solid fa-check"></i> Mark as Learned'}
      </button>
    </div>
  `;
}

function markLearned(name) {
  if (!learnedDisasters.includes(name)) {
    learnedDisasters.push(name);
    safeSetItem("learned", learnedDisasters);

    // Confetti effect (simple CSS/JS trigger)
    triggerConfetti();
    goBack();
  } else {
    goBack();
  }
}

function goBack() {
  showSection("library");
}

function triggerConfetti() {
  // Simple visual feedback
  const btn = document.querySelector('.learn-btn');
  if (btn) {
    btn.innerHTML = "🎉 Learned!";
    btn.style.background = "var(--secondary)";
  }
}

/***********************
 KIT LOGIC
************************/
const kitData = {
  water: ["Drinking Water (3 days)", "Water Purification Tablets", "Canteen"],
  food: ["Non-perishable Food", "Energy Bars", "Manual Can Opener", "Utensils"],
  medical: ["First Aid Kit", "Prescription Meds", "Pain Relievers", "Masks", "Thermometer"],
  communication: ["Cell Phone & Charger", "Power Bank", "Emergency Radio", "Whistle", "Paper Map"],
  tools: ["Multi-tool", "Duct Tape", "Rope", "Flashlight", "Batteries", "Matches"],
  clothing: ["Change of Clothes", "Rain Gear", "Sturdy Shoes", "Work Gloves"],
  shelter: ["Tent / Tarp", "Sleeping Bag", "Emergency Blanket"],
  sanitation: ["Hand Sanitizer", "Wet Wipes", "Soap", "Trash Bags", "Toilet Paper"],
  documents: ["ID Copies", "Insurance Policies", "Bank Records", "Emergency Contacts"],
  financial: ["Cash (Small Bills)", "Credit Cards", "Emergency Savings"]
};

function loadKitCategory(category, btn) {
  // Update sidebar active state
  document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const box = document.getElementById("kitItemsBox");
  box.innerHTML = "";

  kitData[category].forEach(item => {
    const isChecked = kitItems.includes(item);
    const div = document.createElement("div");
    div.className = `kit-item-check ${isChecked ? 'checked' : ''}`;
    div.onclick = (e) => {
      // Prevent double toggle if clicking the checkbox directly
      if (e.target.type !== 'checkbox') {
        const cb = div.querySelector('input');
        cb.checked = !cb.checked;
        toggleKitItem(cb, item);
      }
    };

    div.innerHTML = `
      <input type="checkbox" ${isChecked ? "checked" : ""} onchange="toggleKitItem(this, '${item}')">
      <span>${item}</span>
    `;
    box.appendChild(div);
  });
}

function toggleKitItem(cb, item) {
  const parent = cb.closest('.kit-item-check');
  if (cb.checked) {
    if (!kitItems.includes(item)) kitItems.push(item);
    parent.classList.add('checked');
  } else {
    kitItems = kitItems.filter(i => i !== item);
    parent.classList.remove('checked');
  }
  safeSetItem("kit", kitItems);
  updateProgress();
}

/***********************
 QUIZ LOGIC
************************/
const quizData = {
  natural: [
    { q: "Safest place during earthquake?", options: ["Under sturdy table", "Elevator", "Near window", "Balcony"], correct: 0 },
    { q: "Sign of a Tsunami?", options: ["Heavy snow", "Water receding rapidly", "Strong wind", "Rainbow"], correct: 1 },
    { q: "Disaster on Richter scale?", options: ["Cyclone", "Flood", "Earthquake", "Heatwave"], correct: 2 },
    { q: "What is a Heatwave?", options: ["Rain", "Extreme heat period", "Volcano", "Cold"], correct: 1 },
    { q: "Cause of Landslide?", options: ["Gravity/Saturation", "Moon", "Wind", "Cold"], correct: 0 },
    { q: "Safest in Lightning?", options: ["Tree", "Open field", "Sturdy building", "Pool"], correct: 2 },
    { q: "Volcanic hazard?", options: ["Ash fall", "Blizzard", "Tornado", "Hail"], correct: 0 },
    { q: "Richter 7 is...?", options: ["Weak", "Major earthquake", "Small", "None"], correct: 1 },
    { q: "Most common disaster?", options: ["Tornado", "Flood", "Meteor", "Drought"], correct: 1 },
    { q: "Forest fire cause?", options: ["Rain", "Lightning/Human", "Snow", "Wind"], correct: 1 },
    { q: "Cyclone formation?", options: ["Cold water", "Warm ocean waters", "Desert", "Ice"], correct: 1 },
    { q: "Drop-Cover-Hold is for?", options: ["Flood", "Fire", "Earthquake", "Tsunami"], correct: 2 }
  ],
  biological: [
    { q: "Prevention for pandemics?", options: ["Vitamins", "Hand hygiene & masks", "Closing windows", "Exercise"], correct: 1 },
    { q: "What is a vaccine?", options: ["Immunity builder", "Cure for bones", "Bandage", "Energy drink"], correct: 0 },
    { q: "How do viruses spread?", options: ["Though soul", "Droplets/Airborne", "Loud noises", "Light"], correct: 1 },
    { q: "What is Social Distancing?", options: ["Staying home forever", "Keeping 6ft apart", "No internet", "Wearing hats"], correct: 1 },
    { q: "What is Quarantine?", options: ["Group party", "Isolation to prevent spread", "Hospital wing", "Medicine name"], correct: 1 },
    { q: "Biological hazard example?", options: ["Rust", "Infectious bacteria", "Oil spill", "Lightning"], correct: 1 },
    { q: "First step in an outbreak?", options: ["Panic", "Report to health authorities", "Go to the mall", "Ignore symptoms"], correct: 1 },
    { q: "Safe water practice?", options: ["Boiling", "Adding sugar", "Chilling", "Shaking"], correct: 0 },
    { q: "What is 'Patient Zero'?", options: ["A doctor", "The first identified case", "A hospital bed", "A type of medicine"], correct: 1 },
    { q: "Sanitizer should have at least...?", options: ["10% Alcohol", "60% Alcohol", "90% Water", "5% Soap"], correct: 1 },
    { q: "Zoonotic means...?", options: ["From robots", "From animals to humans", "From plants", "From space"], correct: 1 },
    { q: "Incubation period means...?", options: ["Time to recover", "Time from infection to symptoms", "A surgery", "Sleeping time"], correct: 1 }
  ],
  industrial: [
    { q: "Action in chemical leak?", options: ["Inhale", "Evacuate upwind", "Take photo", "Run to it"], correct: 1 },
    { q: "Hazmat suit is for?", options: ["Swimming", "Hazard Protection", "Party", "Sleeping"], correct: 1 },
    { q: "MSDS stands for?", options: ["Material Safety Data Sheet", "Main Sheet", "My Safety", "None"], correct: 0 },
    { q: "First action in chemical leak?", options: ["Inhale deeply", "Stay upwind/Evacuate", "Take photos", "Run towards it"], correct: 1 },
    { q: "Siren in a factory usually means?", options: ["Lunch time", "Emergency/Evacuation", "New shift", "Test complete"], correct: 1 },
    { q: "Radiation hazard symbol color?", options: ["Green/White", "Yellow/Black", "Blue/Red", "Pink"], correct: 1 },
    { q: "Secondary containment prevents?", options: ["Fires", "Spills from spreading", "Noise", "Theft"], correct: 1 },
    { q: "Major cause of industrial fires?", options: ["Rain", "Electrical faults/Negligence", "Sunlight", "Wind"], correct: 1 },
    { q: "Boiler explosions are caused by?", options: ["Excessive pressure", "Cold water", "Low fuel", "Rust"], correct: 0 },
    { q: "PPE for industrial workers?", options: ["Sandals", "Hard hats & gloves", "T-shirts", "Sunglasses"], correct: 1 },
    { q: "Safety shut-off valves do what?", options: ["Increase flow", "Stop flow in emergency", "Change color", "Clean pipes"], correct: 1 },
    { q: "Industrial smog is caused by?", options: ["Trees", "Factory emissions", "Clouds", "Ocean salt"], correct: 1 },
    { q: "Evacuation assembly point is?", options: ["The basement", "A designated safe area", "The roof", "The parking gate"], correct: 1 }
  ],
  environmental: [
    { q: "Cause of acid rain?", options: ["Sugar", "Sulfur/Nitrogen", "Salt", "Dust"], correct: 1 },
    { q: "Ozone protects from?", options: ["Rain", "UV Radiation", "Meteors", "Wind"], correct: 1 },
    { q: "Deforestation leads to...?", options: ["More rain", "Soil erosion", "Better air", "Cooler climate"], correct: 1 },
    { q: "Global warming gas?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], correct: 1 },
    { q: "Main ocean pollutant?", options: ["Fish", "Plastic", "Sand", "Seaweed"], correct: 1 },
    { q: "Eutrophication is caused by?", options: ["Lack of water", "Nutrient runoff", "Fish", "Cold"], correct: 1 },
    { q: "Renewable energy source?", options: ["Coal", "Solar", "Oil", "Gas"], correct: 1 },
    { q: "Desertification cause?", options: ["Overgrazing/Climate", "Too much rain", "Planting trees", "Snow"], correct: 0 },
    { q: "Loss of Biodiversity means?", options: ["More pets", "Extinction of species", "New plants", "Zoo growth"], correct: 1 },
    { q: "Melting ice caps raise...?", options: ["Mountain height", "Sea levels", "Air pressure", "Moon distance"], correct: 1 },
    { q: "Primary source of air pollution?", options: ["Trees", "Fossil fuel combustion", "Birds", "Clouds"], correct: 1 },
    { q: "Composting helps with?", options: ["Plastic waste", "Organic waste", "Metal", "Glass"], correct: 1 }
  ],
  social: [
    { q: "Crowd crush action?", options: ["Push", "Follow exit signs", "Scream", "Sit"], correct: 1 },
    { q: "Suspicious package?", options: ["Open it", "Do not touch/Report", "Take home", "Kick it"], correct: 1 },
    { q: "Crowd crush prevention?", options: ["Pushing", "Following exit signs", "Shouting", "Sitting down"], correct: 1 },
    { q: "Cyber-security safety?", options: ["Sharing passwords", "Using 2FA/Strong passwords", "No antivirus", "Clicking random links"], correct: 1 },
    { q: "Public panic solution?", options: ["Join the panic", "Stay calm/Follow authorities", "Run blindly", "Hide in a corner"], correct: 1 },
    { q: "Phishing is...?", options: ["A sport", "Fraudulent emails", "Cooking", "A new app"], correct: 1 },
    { q: "Terrorism awareness means?", options: ["Paranoia", "Reporting unusual activity", "Running away", "Ignoring news"], correct: 1 },
    { q: "Stampede danger?", options: ["Fresh air", "Asphyxiation/Crushing", "Rain", "Silence"], correct: 1 },
    { q: "Data breach impact?", options: ["Faster internet", "Identity theft", "Clear storage", "New phone"], correct: 1 },
    { q: "Social engineering target?", options: ["Computers", "Human psychology", "Hardware", "Cables"], correct: 1 },
    { q: "Safe evacuation speed?", options: ["Sprinting", "Orderly walking", "Crawling", "Running over people"], correct: 1 },
    { q: "Malware stands for?", options: ["Male-software", "Malicious software", "Main-ware", "Metal-ware"], correct: 1 },
    { q: "Emergency exit marking?", options: ["Hidden signs", "Illuminated/Green signs", "Written on floor", "None"], correct: 1 }
  ]
};

let currentQuizCat = "";
let currentQIndex = 0;
let quizScore = 0;
let selectedOptionIndex = null;

function startQuiz(cat) {
  currentQuizCat = cat;
  currentQIndex = 0;
  quizScore = 0;
  selectedOptionIndex = null;

  document.getElementById("quizOverlay").classList.remove("hidden");
  document.getElementById("quizTitle").innerText = cat.charAt(0).toUpperCase() + cat.slice(1) + " Quiz";
  renderQuestion();
}

function closeQuiz() {
  document.getElementById("quizOverlay").classList.add("hidden");
}

function renderQuestion() {
  const box = document.getElementById("quizBox");
  const questions = quizData[currentQuizCat];

  // Safety check
  if (currentQIndex >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[currentQIndex];
  const isLast = currentQIndex === questions.length - 1;

  selectedOptionIndex = null; // Reset selection

  box.innerHTML = `
    <h4 style="color:var(--primary); margin-bottom:1rem;">Question ${currentQIndex + 1} / ${questions.length}</h4>
    <p style="font-size:1.2rem; margin-bottom:2rem;">${q.q}</p>
    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom: 2rem;">
      ${q.options.map((opt, i) => `
        <button id="opt-${i}" class="btn secondary" onclick="selectOption(${i})" style="width:100%; text-align:left; justify-content:flex-start;">
          ${opt}
        </button>
      `).join('')}
    </div>
    <div style="text-align: right;">
      <button id="nextBtn" class="btn primary" onclick="submitAnswer()" disabled style="opacity: 0.5; cursor: not-allowed;">
        ${isLast ? 'Submit Quiz' : 'Next Question'} <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  `;
}

function selectOption(index) {
  selectedOptionIndex = index;

  // Visual update
  document.querySelectorAll('#quizBox .btn.secondary').forEach((btn, i) => {
    if (i === index) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  // Enable Next button
  const nextBtn = document.getElementById("nextBtn");
  nextBtn.disabled = false;
  nextBtn.style.opacity = "1";
  nextBtn.style.cursor = "pointer";
}

function submitAnswer() {
  if (selectedOptionIndex === null) return;

  const q = quizData[currentQuizCat][currentQIndex];
  if (selectedOptionIndex === q.correct) quizScore++;

  currentQIndex++;

  if (currentQIndex >= quizData[currentQuizCat].length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

function finishQuiz() {
  const total = quizData[currentQuizCat].length;
  const percent = Math.round((quizScore / total) * 100);

  quizzesCompleted++;
  safeSetItem("quizzesDone", quizzesCompleted);

  // Save history with more details
  const now = new Date();
  quizHistory.push({
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cat: currentQuizCat,
    score: percent,
    correct: quizScore,
    total: total
  });
  safeSetItem("quizHistory", quizHistory);

  updateProgress();

  const box = document.getElementById("quizBox");
  let isGood = percent >= 70;
  let colorVar = isGood ? "var(--secondary)" : "var(--accent)"; // Green vs Red/Orange
  let bgGradient = isGood
    ? "linear-gradient(135deg, rgba(0, 255, 157, 0.1), rgba(0, 255, 157, 0.05))"
    : "linear-gradient(135deg, rgba(255, 0, 85, 0.1), rgba(255, 0, 85, 0.05))";
  let borderCol = isGood ? "var(--secondary)" : "var(--accent)";

  box.innerHTML = `
    <div class="result-card" style="
        background: ${bgGradient};
        border: 2px solid ${borderCol};
        border-radius: 15px;
        padding: 2rem;
        text-align: center;
        box-shadow: 0 0 20px ${borderCol}40;
        animation: fadeIn 0.5s ease;
    ">
      <div style="
          width: 80px; height: 80px; margin: 0 auto 1.5rem;
          background: ${borderCol}20; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
      ">
        <i class="fa-solid ${isGood ? 'fa-trophy' : 'fa-book-open'}" style="font-size: 3rem; color: ${borderCol};"></i>
      </div>
      
      <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: ${borderCol};">${percent}%</h2>
      <h3 style="margin-bottom: 0.5rem; color: var(--text-main);">${isGood ? 'Mission Accomplished!' : 'Training Required'}</h3>
      <p style="margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 1.1rem;">Score: ${quizScore}/${total} correct</p>
      <p style="margin-bottom: 2rem; color: var(--text-secondary);">${isGood ? 'You are ready to handle this disaster.' : 'Review the safety guides in the Library and try again.'}</p>
      
      <button class="btn" onclick="closeQuiz()" style="
          background: ${borderCol}; 
          color: #000; 
          font-weight: bold;
          border: none;
          padding: 10px 30px;
          border-radius: 50px;
          cursor: pointer;
          transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        ${isGood ? 'Awesome!' : 'Try Again'}
      </button>
    </div>
  `;
}

/***********************
 PROGRESS DASHBOARD
************************/
function updateProgress() {
  // Library
  const libScore = Math.min(100, (learnedDisasters.length / 20) * 100);
  if (document.getElementById("libraryBar")) document.getElementById("libraryBar").style.width = libScore + "%";
  if (document.getElementById("learnedCount")) document.getElementById("learnedCount").innerText = learnedDisasters.length;

  // Kit
  const allKitItems = Object.values(kitData).flat();
  const kitScore = (kitItems.length / allKitItems.length) * 100;
  if (document.getElementById("kitBar")) document.getElementById("kitBar").style.width = kitScore + "%";
  if (document.getElementById("kitBarStat")) document.getElementById("kitBarStat").style.width = kitScore + "%";
  if (document.getElementById("kitPercent")) document.getElementById("kitPercent").innerText = Math.round(kitScore) + "%";
  if (document.getElementById("kitPercentLabel")) document.getElementById("kitPercentLabel").innerText = Math.round(kitScore) + "%";

  // Quiz
  // Simple logic: 20 points per quiz taken, max 100 (for demo)
  const quizProgress = Math.min(100, quizzesCompleted * 20);
  if (document.getElementById("quizBar")) document.getElementById("quizBar").style.width = quizProgress + "%";
  if (document.getElementById("quizCount")) document.getElementById("quizCount").innerText = quizzesCompleted;

  // Overall
  const overall = (libScore * 0.4) + (kitScore * 0.3) + (quizProgress * 0.3);
  if (document.getElementById("overallProgress")) document.getElementById("overallProgress").innerText = Math.round(overall) + "%";


  // Update bubble liquid fill
  const bubbleLiquid = document.getElementById("bubbleLiquid");
  const bubblePercentage = document.getElementById("bubblePercentage");
  const bubbleGlow = document.getElementById("bubbleGlow");

  if (bubbleLiquid) {
    bubbleLiquid.style.height = Math.round(overall) + "%";

    // Change liquid color based on progress
    if (overall >= 90) {
      bubbleLiquid.style.background = "linear-gradient(180deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.9) 50%, rgba(21, 128, 61, 1) 100%)";
    } else if (overall >= 70) {
      bubbleLiquid.style.background = "linear-gradient(180deg, rgba(56, 189, 248, 0.8) 0%, rgba(14, 165, 233, 0.9) 50%, rgba(2, 132, 199, 1) 100%)";
    } else if (overall >= 40) {
      bubbleLiquid.style.background = "linear-gradient(180deg, rgba(251, 191, 36, 0.8) 0%, rgba(245, 158, 11, 0.9) 50%, rgba(217, 119, 6, 1) 100%)";
    } else {
      bubbleLiquid.style.background = "linear-gradient(180deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.9) 50%, rgba(185, 28, 28, 1) 100%)";
    }
  }

  if (bubblePercentage) {
    bubblePercentage.textContent = Math.round(overall) + "%";
  }

  // Update glow color
  if (bubbleGlow) {
    if (overall >= 90) {
      bubbleGlow.style.background = "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0) 70%)";
    } else if (overall >= 70) {
      bubbleGlow.style.background = "radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(56, 189, 248, 0) 70%)";
    } else if (overall >= 40) {
      bubbleGlow.style.background = "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(251, 191, 36, 0) 70%)";
    } else {
      bubbleGlow.style.background = "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 70%)";
    }
  }

  // Rank
  let rank = "Novice Protector";
  if (overall > 30) rank = "Safety Scout";
  if (overall > 60) rank = "Emergency Responder";
  if (overall > 90) rank = "Disaster Master";
  if (document.getElementById("readinessLevel")) document.getElementById("readinessLevel").innerText = rank;

  // Render quiz history, packed items, and learned disasters
  renderQuizHistory();
  renderPackedItems();
  renderLearnedDisasters();
}

function renderQuizHistory() {
  const container = document.getElementById("quizHistoryContainer");
  if (!container) return;

  if (quizHistory.length === 0) {
    container.innerHTML = '<p class="empty-state">No quizzes taken yet. Start learning!</p>';
    return;
  }

  // Reverse to show most recent first
  const reversedHistory = [...quizHistory].reverse();

  let tableHTML = `
    <table class="history-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Category</th>
          <th>Score</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
  `;

  reversedHistory.forEach(entry => {
    const categoryName = entry.cat.charAt(0).toUpperCase() + entry.cat.slice(1);
    const scoreClass = entry.score >= 90 ? 'excellent' : entry.score >= 70 ? 'good' : 'needs-improvement';
    const scoreLabel = entry.score >= 90 ? 'Excellent' : entry.score >= 70 ? 'Good' : 'Needs Review';

    tableHTML += `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.time || 'N/A'}</td>
        <td>${categoryName}</td>
        <td>${entry.correct || '?'}/${entry.total || '?'}</td>
        <td><span class="score-badge ${scoreClass}">${entry.score}% - ${scoreLabel}</span></td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;
}

function renderPackedItems() {
  const container = document.getElementById("packedItemsContainer");
  if (!container) return;

  if (kitItems.length === 0) {
    container.innerHTML = '<p class="empty-state">No items packed yet. Build your emergency kit!</p>';
    return;
  }

  let itemsHTML = '';
  kitItems.forEach(item => {
    itemsHTML += `
      <div class="packed-item">
        <i class="fa-solid fa-check-circle"></i>
        <span>${item}</span>
      </div>
    `;
  });

  container.innerHTML = itemsHTML;
}

function toggleQuizHistory() {
  const section = document.getElementById('quizHistoryContainer').closest('.progress-section');
  if (section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    section.classList.add('expanded');
  } else if (section.classList.contains('expanded')) {
    section.classList.remove('expanded');
    section.classList.add('collapsed');
  } else {
    // First time - expand it
    section.classList.add('expanded');
  }

  // Scroll to the section
  setTimeout(() => {
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function toggleKitItems() {
  const section = document.getElementById('packedItemsContainer').closest('.progress-section');
  if (section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    section.classList.add('expanded');
  } else if (section.classList.contains('expanded')) {
    section.classList.remove('expanded');
    section.classList.add('collapsed');
  } else {
    // First time - expand it
    section.classList.add('expanded');
  }

  // Scroll to the section
  setTimeout(() => {
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function renderLearnedDisasters() {
  const container = document.getElementById("learnedDisastersContainer");
  if (!container) return;

  if (learnedDisasters.length === 0) {
    container.innerHTML = '<p class="empty-state">No disasters learned yet. Explore the library!</p>';
    return;
  }

  let itemsHTML = '';
  learnedDisasters.forEach(disaster => {
    const iconClass = disasterIcons[disaster] || "fa-triangle-exclamation";
    itemsHTML += `
      <div class="learned-disaster-badge" onclick="openDisaster('${disaster}')">
        <i class="fa-solid ${iconClass}"></i>
        <span>${disaster}</span>
      </div>
    `;
  });

  container.innerHTML = itemsHTML;
}

function toggleLearnedDisasters() {
  const section = document.getElementById('learnedDisastersContainer').closest('.progress-section');
  if (section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    section.classList.add('expanded');
  } else if (section.classList.contains('expanded')) {
    section.classList.remove('expanded');
    section.classList.add('collapsed');
  } else {
    // First time - expand it
    section.classList.add('expanded');
  }

  // Scroll to the section
  setTimeout(() => {
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  renderLibrary();
  updateProgress();

  // Mobile Support
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      document.querySelector(".navbar nav").classList.remove("show");
    }
  });
});
