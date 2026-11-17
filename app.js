// ==========================================
// 🇨🇮 TON DICTIONNAIRE DE VOCABULAIRE (MODIFIE ICI !)
// ==========================================
const VOCAB = {
  appName: "DCLTAP",     // <--- Change le nom ici
  tagline: "on donne pas conseils !", // <--- Change le slogan ici
  
  statusVisible: "● Dispo",
  // ... (garde tout le reste de ton dictionnaire)
  // En-tête
  appName: "DCLTP!",
  tagline: "On donne pas conseils.",
  statusVisible: "● Dispo",
  statusInvisible: "● Invisible",

  // Navigation (Barre du bas)
  navDiscover: "Découvrir",
  navAvailability: "Ma Dispo",
  navInvite: "Lancer",
  navMessages: "Chat",
  navProfile: "Profil",

  // Page Découvrir
  discoverTitle: "Qui est chaud pour sortir ?",
  discoverSubtitle: "Regarde qui est dispo autour de toi et lance-toi.",
  discoverActiveNotice: "Tu es visible à",
  discoverInactiveTitle: "Es ce que tu es libre actuellement ?",
  discoverInactiveSubtitle: "Montre aux autres que tu es dispo pour bouger.",
  discoverBtnActivate: "Activer ma dispo",
  discoverPeopleTitle: "Les personnes dispo",
  discoverInvitesTitle: "Les invitations",
  discoverEmptyInvites: "Personne n'a encore lancé d'invite.",
  actionContact: "Faire signe",
  actionContactSent: "Envoyé ✓",
  actionJoin: "Je suis partant !",

  // Page Disponibilité
  availTitle: "Ma Dispo",
  availSubtitle: "C'est toi qui décides quand et où on peut te trouver.",
  availVisibleTitle: "Tu es visible",
  availInvisibleTitle: "Tu es invisible",
  availInvisibleText: "Ta dispo est coupée.",
  availBtnDeactivate: "Couper ma dispo",
  availBtnActivate: "Je suis dispo",
  availFormZone: "Choisir ma zone",
  availFormVisibility: "Type de visibilité",
  availFormVisZone: "Quartier ou zone choisie",
  availFormVisRadius: "Rayon autour d'un lieu",
  availFormRadius: "Rayon approximatif",
  availFormDuration: "Pendant combien de temps ?",
  availFormCustom: "Durée perso (minutes)",
  availFormSubmit: "Enregistrer",
  availFooter: "GAMMÉ! ne te suit pas par GPS. C'est toi qui choisis ta zone.",

  // Page Invitation
  inviteTitle: "Lance une invite",
  inviteSubtitle: "Propose une activité et vois qui est partant.",
  inviteFormActivity: "Qu'est-ce qu'on fait ?",
  inviteFormChooseAct: "Choisir une activité",
  inviteFormZone: "Dans quelle zone ?",
  inviteFormWhen: "C'est pour quand ?",
  inviteFormBudget: "Le budget ?",
  inviteFormDesc: "Un petit mot",
  inviteFormDescPlaceholder: "Explique ton plan en quelques mots...",
  inviteFormSubmit: "Publier l'invite",

  // Page Messages
  msgTitle: "Chat",
  msgEmpty: "Les discussions s'ouvriront quand quelqu'un acceptera ton invite.",

  // Page Profil
  profileTitle: "Mon Profil",
  profileSubtitle: "Bientôt, tu pourras mettre ta plus belle photo ici.",
  profileNotice: "On protège ta vie privée. Tu contrôles tout.",
  profileBtnReset: "Réinitialiser l'appli",

  // Notifications (Toasts) & Modales
  toastRequestSent: "C'est envoyé, on te répondra !",
  toastJoinSent: "Demande envoyée !",
  toastInvalidDuration: "Durée invalide",
  toastSaved: "C'est enregistré !",
  toastInvitePublished: "Ton invite est en ligne !",
  confirmResetTitle: "Reset",
  confirmResetMsg: "Tu veux effacer toutes les données ?"
};

// ==========================================
// ⚙️ LOGIQUE DE L'APPLICATION (Ne touche pas en dessous)
// ==========================================

const STORAGE_KEY = "now_prototype_v2";

const defaults = {
  available: false, zone: "Cocody", visibility: "zone", radius: 3,
  duration: "60", customMinutes: 90, expiresAt: null, invitations: [], requests: []
};

let data;
try { data = { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; } 
catch { data = { ...defaults }; }

let currentPage = "discover";
let timerInterval = null;

const people = [
  {id: 1, name: "Kevin", age: 27, zone: "Cocody", emoji: "🙂", activities: ["Café", "Discussion"], time: "Encore 1 h 30"},
  {id: 2, name: "Mélanie", age: 25, zone: "Angré", emoji: "😊", activities: ["Resto", "Ciné"], time: "Encore 45 min"},
  {id: 3, name: "David", age: 30, zone: "Marcory", emoji: "😎", activities: ["Foot", "Sorties"], time: "Encore 2 h"}
];

const sampleInvitations = [
  {id: "sample1", activity: "AfterWork", zone: "Cocody", timing: "Dans 30 minutes", places: "2 places", budget: "Chacun paie sa part", description: "Envie de discuter autour d'un café ?"},
  {id: "sample2", activity: "GarbaParty", zone: "Angré", timing: "Dans 1 heure", places: "3 places", budget: "Budget partagé", description: "Il nous manque quelques joueurs."}
];

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]); }

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showConfirm(title, message, onConfirm) {
  const modal = document.getElementById('confirm-modal');
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  modal.classList.remove('hidden');

  const btnOk = document.getElementById('confirm-ok');
  const btnCancel = document.getElementById('confirm-cancel');
  
  const newBtnOk = btnOk.cloneNode(true);
  const newBtnCancel = btnCancel.cloneNode(true);
  btnOk.replaceWith(newBtnOk);
  btnCancel.replaceWith(newBtnCancel);

  newBtnOk.addEventListener('click', () => { modal.classList.add('hidden'); onConfirm(); });
  newBtnCancel.addEventListener('click', () => modal.classList.add('hidden'));
}

function checkExpiration() {
  if (data.available && data.expiresAt && Date.now() >= data.expiresAt) {
    data.available = false; data.expiresAt = null; save();
    if(currentPage === 'discover' || currentPage === 'availability') render();
  }
}

function remainingTime() {
  if (!data.expiresAt) return "";
  const minutes = Math.max(0, Math.ceil((data.expiresAt - Date.now()) / 60000));
  if (minutes < 60) return minutes + " min restantes";
  return Math.floor(minutes / 60) + " h " + (minutes % 60) + " min restantes";
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    checkExpiration();
    const timeElements = document.querySelectorAll('.live-timer');
    timeElements.forEach(el => {
      if (data.available) el.textContent = remainingTime();
    });
  }, 10000); 
}

function navHTML() {
  const items = [
    ["discover", "⌕", VOCAB.navDiscover], 
    ["availability", "◉", VOCAB.navAvailability], 
    ["invite", "+", VOCAB.navInvite], 
    ["messages", "✉", VOCAB.navMessages], 
    ["profile", "○", VOCAB.navProfile]
  ];
  return items.map(item => `
    <button data-nav="${item[0]}" class="${currentPage === item[0] ? "active" : ""}">
      <span>${item[1]}</span>${item[2]}
    </button>
  `).join("");
}

function personCard(person) {
  const sent = data.requests.includes(person.id);
  return `
    <div class="card person">
      <div class="avatar">${person.emoji}</div>
      <div class="details">
        <div class="name">${person.name}, ${person.age} ans</div>
        <div class="meta">${person.zone} · ${person.time}</div>
        <div class="tags">${person.activities.map(a => `<span class="tag">${a}</span>`).join("")}</div>
      </div>
      <button class="${sent ? "secondary" : ""}" data-action="request" data-id="${person.id}">
        ${sent ? VOCAB.actionContactSent : VOCAB.actionContact}
      </button>
    </div>
  `;
}

function invitationCard(invitation) {
  return `
    <div class="card">
      <div class="invitation">
        <div class="avatar">📍</div>
        <div class="details">
          <div class="name">${escapeHTML(invitation.activity)}</div>
          <div class="meta">${escapeHTML(invitation.zone)} · ${escapeHTML(invitation.timing)}</div>
        </div>
      </div>
      <p class="subtitle">${escapeHTML(invitation.description)}</p>
      <div class="tags">
        <span class="tag">${escapeHTML(invitation.places || "Places ouvertes")}</span>
        <span class="tag">${escapeHTML(invitation.budget)}</span>
      </div>
      <button class="full" data-action="join" data-id="${invitation.id}">${VOCAB.actionJoin}</button>
    </div>
  `;
}

function renderDiscover() {
  const invitations = [...data.invitations.filter(i => i.expiresAt > Date.now()), ...sampleInvitations];
  return `
    <h1>${VOCAB.discoverTitle}</h1>
    <p class="subtitle">${VOCAB.discoverSubtitle}</p>
    ${data.available ? `
      <div class="notice">✓ ${VOCAB.discoverActiveNotice} ${escapeHTML(data.zone)}. <span class="live-timer">${remainingTime()}</span></div>
    ` : `
      <div class="card">
        <strong>${VOCAB.discoverInactiveTitle}</strong>
        <p class="subtitle">${VOCAB.discoverInactiveSubtitle}</p>
        <button class="full" data-action="go-availability">${VOCAB.discoverBtnActivate}</button>
      </div>
    `}
    <h2>${VOCAB.discoverPeopleTitle}</h2>
    ${people.map(personCard).join("")}
    <h2>${VOCAB.discoverInvitesTitle}</h2>
    ${invitations.length ? invitations.map(invitationCard).join("") : `<div class="empty">${VOCAB.discoverEmptyInvites}</div>`}
  `;
}

function renderAvailability() {
  return `
    <h1>${VOCAB.availTitle}</h1>
    <p class="subtitle">${VOCAB.availSubtitle}</p>
    <div class="card">
      <div class="name">${data.available ? VOCAB.availVisibleTitle : VOCAB.availInvisibleTitle}</div>
      <p class="subtitle">${data.available ? `<span class="live-timer">${remainingTime()}</span>` : VOCAB.availInvisibleText}</p>
      <button class="full ${data.available ? "danger" : ""}" data-action="toggle-availability">
        ${data.available ? VOCAB.availBtnDeactivate : VOCAB.availBtnActivate}
      </button>
    </div>
    <form id="availabilityForm" class="card">
      <label>${VOCAB.availFormZone}</label>
      <select name="zone">
        ${["Cocody","Angré","Deux-Plateaux","Plateau","Marcory","Zone 4","Yopougon","Adjamé","Treichville","Autre"].map(z => `<option ${data.zone === z ? "selected" : ""}>${z}</option>`).join("")}
      </select>
      <label>${VOCAB.availFormVisibility}</label>
      <select name="visibility">
        <option value="zone" ${data.visibility === "zone" ? "selected" : ""}>${VOCAB.availFormVisZone}</option>
        <option value="radius" ${data.visibility === "radius" ? "selected" : ""}>${VOCAB.availFormVisRadius}</option>
      </select>
      <label>${VOCAB.availFormRadius}</label>
      <select name="radius">
        ${[1,2,3,5,10,15].map(n => `<option value="${n}" ${data.radius == n ? "selected" : ""}>${n} km</option>`).join("")}
      </select>
      <label>${VOCAB.availFormDuration}</label>
      <select name="duration" id="durationSelect">
        <option value="30" ${data.duration === "30" ? "selected" : ""}>30 minutes</option>
        <option value="60" ${data.duration === "60" ? "selected" : ""}>1 heure</option>
        <option value="120" ${data.duration === "120" ? "selected" : ""}>2 heures</option>
        <option value="240" ${data.duration === "240" ? "selected" : ""}>4 heures</option>
        <option value="custom" ${data.duration === "custom" ? "selected" : ""}>Personnalisée</option>
      </select>
      <div id="customDuration" class="${data.duration === "custom" ? "" : "hidden"}">
        <label>${VOCAB.availFormCustom}</label>
        <input type="number" name="customMinutes" min="15" max="720" value="${data.customMinutes}">
      </div>
      <button class="full" type="submit">${VOCAB.availFormSubmit}</button>
    </form>
    <p class="small">${VOCAB.availFooter}</p>
  `;
}

function renderInvite() {
  return `
    <h1>${VOCAB.inviteTitle}</h1>
    <p class="subtitle">${VOCAB.inviteSubtitle}</p>
    <form id="inviteForm" class="card">
      <label>${VOCAB.inviteFormActivity}</label>
<select name="activity" required>
  <option value="">Choisir une activité</option>
  <option>Café / Verre</option>
  <option>Resto / Maquis</option>
  <option>Garba / Attiéké</option>
  <option>Ciné</option>
  <option>Foot / Sport</option>
  <option>Piscine / Plage</option>
  <option>Balade / Promenade</option>
  <option>Concert / Soirée</option>
  <option>Jeux (Billard, Cartes...)</option>
  <option>Shopping / Marché</option>
  <option>Chill / Discussion</option>
  <option>Musée / Expo</option>
  <option>Jogging</option>
  <option>Autre</option>
</select>
      <label>${VOCAB.inviteFormZone}</label>
      <select name="zone">
        ${["Cocody","Angré","Deux-Plateaux","Plateau","Marcory","Zone 4","Yopougon","Adjamé","Treichville","Autre"].map(z => `<option>${z}</option>`).join("")}
      </select>
      <label>${VOCAB.inviteFormWhen}</label>
      <select name="timing">
        <option>Now</option><option>Dans 30 min</option><option>Dans 1 heure</option><option>Dans 2 heures</option><option>Plus tard</option>
      </select>
      <label>${VOCAB.inviteFormBudget}</label>
      <select name="budget">
        <option>Chacun gère sa part</option><option>C'est moi qui régale</option><option>On voit sur place</option>
      </select>
      <label>${VOCAB.inviteFormDesc}</label>
      <textarea name="description" maxlength="240" placeholder="${VOCAB.inviteFormDescPlaceholder}" required></textarea>
      <button class="full" type="submit">${VOCAB.inviteFormSubmit}</button>
    </form>
  `;
}

function renderMessages() {
  return `
    <h1>${VOCAB.msgTitle}</h1>
    <div class="card empty">
      <div style="font-size:35px">💬</div>
      <p>${VOCAB.msgEmpty}</p>
    </div>
  `;
}

function renderProfile() {
  return `
    <h1>${VOCAB.profileTitle}</h1>
    <div class="card">
      <div class="avatar" style="margin: 0 auto 10px;">👤</div>
      <h2 style="text-align:center;">Mon espace</h2>
      <p class="subtitle" style="text-align:center;">${VOCAB.profileSubtitle}</p>
      <div class="notice">${VOCAB.profileNotice}</div>
      <button class="secondary full" data-action="reset-demo">${VOCAB.profileBtnReset}</button>
    </div>
  `;
}

function render() {
  document.getElementById("header-logo").textContent = VOCAB.appName;
  document.getElementById("header-tagline").textContent = VOCAB.tagline;
  document.title = VOCAB.appName + " — " + VOCAB.tagline; 
  checkExpiration();
  const pages = { discover: renderDiscover, availability: renderAvailability, invite: renderInvite, messages: renderMessages, profile: renderProfile };
  
  document.getElementById("app").innerHTML = pages[currentPage]();
  document.getElementById("navigation").innerHTML = navHTML();
  
  const headerStatus = document.getElementById("headerStatus");
  headerStatus.textContent = data.available ? VOCAB.statusVisible : VOCAB.statusInvisible;
  headerStatus.className = data.available ? "status active" : "status";
  
  startTimer();
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.nav) { currentPage = btn.dataset.nav; render(); return; }
  if (btn.dataset.action === "go-availability") { currentPage = "availability"; render(); }
  
  if (btn.dataset.action === "request") {
    const id = Number(btn.dataset.id);
    if (!data.requests.includes(id)) {
      data.requests.push(id); save(); showToast(VOCAB.toastRequestSent);
      render();
    }
  }
  
  if (btn.dataset.action === "join") { showToast(VOCAB.toastJoinSent); }
  
  if (btn.dataset.action === "toggle-availability") {
    if (data.available) {
      data.available = false; data.expiresAt = null; save(); render();
    } else {
      const minutes = data.duration === "custom" ? Number(data.customMinutes) : Number(data.duration);
      if (!Number.isFinite(minutes) || minutes < 15) return showToast(VOCAB.toastInvalidDuration, "danger");
      data.available = true; data.expiresAt = Date.now() + minutes * 60000;
      save(); render();
    }
  }

  if (btn.dataset.action === "reset-demo") {
    showConfirm(VOCAB.confirmResetTitle, VOCAB.confirmResetMsg, () => {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });
  }
});

document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "availabilityForm") {
    const form = new FormData(e.target);
    data.zone = form.get("zone"); data.visibility = form.get("visibility");
    data.radius = Number(form.get("radius")); data.duration = form.get("duration");
    data.customMinutes = Number(form.get("customMinutes") || 90);
    save(); showToast(VOCAB.toastSaved);
  }
  if (e.target.id === "inviteForm") {
    const form = new FormData(e.target);
    data.invitations.unshift({
      id: Date.now(), activity: form.get("activity"), zone: form.get("zone"),
      timing: form.get("timing"), budget: form.get("budget"),
      places: "Places ouvertes", description: form.get("description"),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000
    });
    save(); showToast(VOCAB.toastInvitePublished); currentPage = "discover"; render();
  }
});

document.addEventListener("change", (e) => {
  if (e.target.id === "durationSelect") {
    document.getElementById("customDuration").classList.toggle("hidden", e.target.value !== "custom");
  }
});

render();
