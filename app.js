// --- 1. IMPORTATION DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// --- 2. TA CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyArChVfx20IRL09CrdsqMRBJf3N9Jz_GHM",
  authDomain: "dcltp-9e838.firebaseapp.com",
  projectId: "dcltp-9e838",
  storageBucket: "dcltp-9e838.firebasestorage.app",
  messagingSenderId: "1030113926538",
  appId: "1:1030113926538:web:c47a8ef08b55fa7a847c73",
  measurementId: "G-NVXE1Q1GKH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 3. TON DICTIONNAIRE DE VOCABULAIRE ---
const VOCAB = {
  appName: "DCLTP!", tagline: "On donne pas conseils.",
  statusVisible: "● Dispo", statusInvisible: "● Invisible",
  navDiscover: "Découvrir", navAvailability: "Ma Dispo", navInvite: "Lancer", navMessages: "Chat", navProfile: "Profil",
  discoverTitle: "Qui est chaud pour sortir ?", discoverSubtitle: "Regarde qui est dispo autour de toi et lance-toi.",
  discoverInactiveTitle: "Tu es libre now ?", discoverInactiveSubtitle: "Montre aux autres que tu es dispo pour bouger.",
  discoverBtnActivate: "Activer ma dispo", discoverPeopleTitle: "Les gens dispo", discoverInvitesTitle: "Les invitations",
  discoverEmptyInvites: "Personne n'a encore lancé d'invite.", actionContact: "Faire signe", actionJoin: "Je suis partant !",
  availTitle: "Ma Dispo", availSubtitle: "C'est toi qui décides quand et où on peut te trouver.",
  availFormZone: "Choisir ma zone", availFormDuration: "Pendant combien de temps ?",
  availFormSubmit: "Publier ma disponibilité",
  inviteTitle: "Lance une invite", inviteSubtitle: "Propose une activité et vois qui est partant.",
  inviteFormActivity: "Qu'est-ce qu'on fait ?", inviteFormZone: "Dans quelle zone ?", inviteFormWhen: "C'est pour quand ?",
  inviteFormBudget: "Le budget ?", inviteFormDesc: "Un petit mot", inviteFormSubmit: "Publier l'invite",
  toastInvitePublished: "Ton invite est en ligne !", toastDispoPublished: "Tu es maintenant visible !"
};

// --- 4. VARIABLES GLOBALES ---
let data = { 
  invitations: [], 
  personnesDispo: [],
  available: false 
};
let currentPage = "discover";

// --- 5. ÉCOUTE EN TEMPS RÉEL DE FIREBASE ---
// Écoute des invitations
const qInvites = query(collection(db, "invitations"), orderBy("timestamp", "desc"));
onSnapshot(qInvites, (snapshot) => {
  data.invitations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (currentPage === 'discover') render();
});

// Écoute des personnes disponibles
const qDispo = query(collection(db, "disponibilites"), orderBy("timestamp", "desc"));
onSnapshot(qDispo, (snapshot) => {
  data.personnesDispo = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (currentPage === 'discover') render();
});

// --- 6. FONCTIONS UTILITAIRES ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function navHTML() {
  const items = [["discover", "⌕", VOCAB.navDiscover], ["availability", "◉", VOCAB.navAvailability], ["invite", "+", VOCAB.navInvite], ["messages", "✉", VOCAB.navMessages], ["profile", "○", VOCAB.navProfile]];
  return items.map(item => `<button data-nav="${item[0]}" class="${currentPage === item[0] ? "active" : ""}"><span>${item[1]}</span>${item[2]}</button>`).join("");
}

// --- 7. RENDU HTML ---
function renderDiscover() {
  return `
    <h1>${VOCAB.discoverTitle}</h1>
    <p class="subtitle">${VOCAB.discoverSubtitle}</p>
    
    <div class="card">
      <strong>${VOCAB.discoverInactiveTitle}</strong>
      <p class="subtitle">${VOCAB.discoverInactiveSubtitle}</p>
      <button class="full" data-action="go-availability">${VOCAB.discoverBtnActivate}</button>
    </div>
    
    <h2>${VOCAB.discoverPeopleTitle}</h2>
    ${data.personnesDispo.length ? data.personnesDispo.map(p => `
      <div class="card person">
        <div class="avatar">👤</div>
        <div class="details">
          <div class="name">${p.nom}, ${p.age} ans</div>
          <div class="meta">📍 ${p.zone} · ⏳ ${p.temps}</div>
          <div class="tags">${p.activites.map(a => `<span class="tag">${a}</span>`).join("")}</div>
        </div>
        <button data-action="contact">Faire signe</button>
      </div>
    `).join("") : '<div class="empty">Personne n\'est dispo pour le moment.</div>'}

    <h2>${VOCAB.discoverInvitesTitle}</h2>
    ${data.invitations.length ? data.invitations.map(i => `
      <div class="card">
        <div class="invitation">
          <div class="avatar">📍</div>
          <div class="details">
            <div class="name">${i.activity}</div>
            <div class="meta">${i.zone} · ${i.timing}</div>
          </div>
        </div>
        <p class="subtitle">${i.description}</p>
        <div class="tags">
          <span class="tag">${i.places}</span><span class="tag">${i.budget}</span>
        </div>
        <button class="full" data-action="join">${VOCAB.actionJoin}</button>
      </div>
    `).join("") : `<div class="empty">${VOCAB.discoverEmptyInvites}</div>`}
  `;
}

function renderAvailability() {
  return `
    <h1>${VOCAB.availTitle}</h1>
    <p class="subtitle">${VOCAB.availSubtitle}</p>
    
    <form id="availabilityForm" class="card">
      <label>${VOCAB.availFormZone}</label>
      <select name="zone">
        <option>Cocody</option><option>Angré</option><option>Deux-Plateaux</option><option>Plateau</option>
        <option>Marcory</option><option>Zone 4</option><option>Yopougon</option><option>Adjamé</option>
      </select>
      
      <label>Quelle activité ?</label>
      <select name="activite">
        <option>Café / Discussion</option><option>Garba / Resto</option><option>Sport</option><option>Balade</option>
      </select>

      <label>${VOCAB.availFormDuration}</label>
      <select name="duree">
        <option value="30 minutes">30 minutes</option>
        <option value="1 heure">1 heure</option>
        <option value="2 heures">2 heures</option>
      </select>

      <button class="full" type="submit">${VOCAB.availFormSubmit}</button>
    </form>
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
        <option>Café / Verre</option><option>Resto / Maquis</option><option>Garba / Attiéké</option>
        <option>Ciné</option><option>Foot / Sport</option><option>Piscine / Plage</option>
        <option>Balade / Promenade</option><option>Concert / Soirée</option><option>Autre</option>
      </select>
      <label>${VOCAB.inviteFormZone}</label>
      <select name="zone">
        <option>Cocody</option><option>Angré</option><option>Deux-Plateaux</option><option>Plateau</option><option>Marcory</option><option>Zone 4</option><option>Yopougon</option>
      </select>
      <label>${VOCAB.inviteFormWhen}</label>
      <select name="timing">
        <option>Maintenant</option><option>Dans 30 min</option><option>Dans 1 heure</option><option>Ce soir</option>
      </select>
      <label>${VOCAB.inviteFormBudget}</label>
      <select name="budget">
        <option>Chacun gère sa part</option><option>C'est moi qui régale</option>
      </select>
      <label>${VOCAB.inviteFormDesc}</label>
      <textarea name="description" placeholder="Explique ton plan..." required></textarea>
      <button class="full" type="submit">${VOCAB.inviteFormSubmit}</button>
    </form>
  `;
}

function renderMessages() { return `<h1>Chat</h1><div class="empty">Bientôt...</div>`; }
function renderProfile() { return `<h1>Profil</h1><div class="empty">Bientôt...</div>`; }

function render() {
  const pages = { discover: renderDiscover, availability: renderAvailability, invite: renderInvite, messages: renderMessages, profile: renderProfile };
  document.getElementById("app").innerHTML = pages[currentPage]();
  document.getElementById("navigation").innerHTML = navHTML();
}

// --- 8. GESTION DES ÉVÉNEMENTS ---
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  
  if (btn.dataset.nav) { currentPage = btn.dataset.nav; render(); return; }
  
  if (btn.dataset.action === "go-availability") { currentPage = "availability"; render(); }
  
  if (btn.dataset.action === "contact") { showToast("Demande envoyée à l'utilisateur !"); }
  
  if (btn.dataset.action === "join") { showToast("Demande envoyée à l'organisateur !"); }
});

document.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Formulaire Disponibilité
  if (e.target.id === "availabilityForm") {
    const form = new FormData(e.target);
    
    try {
        await addDoc(collection(db, "disponibilites"), {
            nom: "Toi", // Plus tard on mettra le vrai nom de l'utilisateur
            age: 25,
            zone: form.get("zone"),
            activites: [form.get("activite")],
            temps: "Encore " + form.get("duree"),
            timestamp: new Date()
        });
        showToast(VOCAB.toastDispoPublished); 
        currentPage = "discover"; 
        render();
    } catch (err) {
        alert("❌ ERREUR FIREBASE : " + err.message);
    }
  }
  
  // Formulaire Invitation
  if (e.target.id === "inviteForm") {
    const form = new FormData(e.target);
    try {
        await addDoc(collection(db, "invitations"), {
            activity: form.get("activity"), 
            zone: form.get("zone"),
            timing: form.get("timing"), 
            budget: form.get("budget"),
            places: "Places ouvertes", 
            description: form.get("description"),
            timestamp: new Date()
        });
        showToast(VOCAB.toastInvitePublished); 
        currentPage = "discover"; 
        render();
    } catch (err) {
        alert("❌ ERREUR FIREBASE : " + err.message);
    }
  }
});

// --- 9. LANCEMENT ---
render();
