import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const VOCAB = {
  appName: "DCLTP!", tagline: "On donne pas conseils.",
  statusVisible: "● Dispo", statusInvisible: "● Invisible",
  navDiscover: "Découvrir", navAvailability: "Ma Dispo", navInvite: "Lancer", navMessages: "Chat", navProfile: "Profil",
  discoverTitle: "Qui est chaud pour sortir ?", discoverSubtitle: "Regarde qui est dispo autour de toi et lance-toi.",
  discoverInactiveTitle: "Tu es libre now ?", discoverInactiveSubtitle: "Montre aux autres que tu es dispo pour bouger.",
  discoverBtnActivate: "Activer ma dispo", discoverPeopleTitle: "Les gens dispo", discoverInvitesTitle: "Les invitations",
  discoverEmptyInvites: "Personne n'a encore lancé d'invite.", actionContact: "Faire signe", actionJoin: "Je suis partant !",
  inviteTitle: "Lance une invite", inviteSubtitle: "Propose une activité et vois qui est partant.",
  inviteFormActivity: "Qu'est-ce qu'on fait ?", inviteFormZone: "Dans quelle zone ?", inviteFormWhen: "C'est pour quand ?",
  inviteFormBudget: "Le budget ?", inviteFormDesc: "Un petit mot", inviteFormSubmit: "Publier l'invite",
  toastInvitePublished: "Ton invite est en ligne !"
};

let data = { invitations: [], personnesDispo: [] };
let currentPage = "discover";

// Connexion Firebase
const qInvites = query(collection(db, "invitations"), orderBy("timestamp", "desc"));
onSnapshot(qInvites, (snapshot) => {
  data.invitations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (currentPage === 'discover') render();
});

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

function renderDiscover() {
  return `
    <h1>${VOCAB.discoverTitle}</h1>
    <p class="subtitle">${VOCAB.discoverSubtitle}</p>
    <div class="card"><strong>${VOCAB.discoverInactiveTitle}</strong><p class="subtitle">${VOCAB.discoverInactiveSubtitle}</p><button class="full" data-action="go-availability">${VOCAB.discoverBtnActivate}</button></div>
    <h2>${VOCAB.discoverInvitesTitle}</h2>
    ${data.invitations.length ? data.invitations.map(i => `
      <div class="card">
        <div class="invitation"><div class="avatar">📍</div><div class="details"><div class="name">${i.activity}</div><div class="meta">${i.zone} · ${i.timing}</div></div></div>
        <p class="subtitle">${i.description}</p>
        <button class="full" data-action="join">${VOCAB.actionJoin}</button>
      </div>
    `).join("") : `<div class="empty">${VOCAB.discoverEmptyInvites}</div>`}
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
        <option>Balade / Promenade</option><option>Concert / Soirée</option><option>Jeux (Billard, Cartes...)</option>
        <option>Shopping / Marché</option><option>Chill / Discussion</option><option>Musée / Expo</option>
        <option>Jogging</option><option>Autre</option>
      </select>
      <label>${VOCAB.inviteFormZone}</label>
      <select name="zone"><option>Cocody</option><option>Angré</option><option>Deux-Plateaux</option><option>Plateau</option><option>Marcory</option><option>Zone 4</option><option>Yopougon</option><option>Adjamé</option><option>Treichville</option><option>Autre</option></select>
      <label>${VOCAB.inviteFormWhen}</label>
      <select name="timing"><option>Now</option><option>Dans 30 min</option><option>Dans 1 heure</option><option>Dans 2 heures</option><option>Plus tard</option></select>
      <label>${VOCAB.inviteFormBudget}</label>
      <select name="budget"><option>Chacun gère sa part</option><option>C'est moi qui régale</option><option>On voit sur place</option></select>
      <label>${VOCAB.inviteFormDesc}</label>
      <textarea name="description" required placeholder="Explique ton plan..."></textarea>
      <button class="full" type="submit">${VOCAB.inviteFormSubmit}</button>
    </form>
  `;
}

function renderAvailability() { return `<h1>Ma Dispo</h1><p class="subtitle">Bientôt disponible...</p>`; }
function renderMessages() { return `<h1>Chat</h1><div class="empty">Bientôt...</div>`; }
function renderProfile() { return `<h1>Profil</h1><div class="empty">Bientôt...</div>`; }

function render() {
  const pages = { discover: renderDiscover, availability: renderAvailability, invite: renderInvite, messages: renderMessages, profile: renderProfile };
  document.getElementById("app").innerHTML = pages[currentPage]();
  document.getElementById("navigation").innerHTML = navHTML();
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.nav) { currentPage = btn.dataset.nav; render(); return; }
  if (btn.dataset.action === "go-availability") { currentPage = "availability"; render(); }
});

document.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (e.target.id === "inviteForm") {
    const form = new FormData(e.target);
    try {
        await addDoc(collection(db, "invitations"), {
            activity: form.get("activity"), zone: form.get("zone"), timing: form.get("timing"),
            budget: form.get("budget"), places: "Places ouvertes", description: form.get("description"),
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

render();
