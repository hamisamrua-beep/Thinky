// ===============================================================
// DATA MANAGEMENT
// ===============================================================
const STORAGE_KEY = 'hamisa_shows';
const ADMIN_PASSWORD = 'hamisa123'; // Change this to your password

// Default sample data
const defaultShows = [
    {
        title: "Sore",
        director: "Yandy Laurens",
        year: "2025",
        reviewText: "A beautiful meditation on time and connection. The scene where she teaches him to cook Croatian stew while explaining future habits brought tears to my eyes."
    },
    {
        title: "Sanctuary",
        director: "Zach Wigon",
        year: "2024",
        reviewText: "Tense, claustrophobic, and brilliantly acted. It's a two-hander that never lets you breathe."
    },
    {
        title: "Limonov",
        director: "Kirill Serebrennikov",
        year: "2024",
        reviewText: "A punk rock biopic that captures the chaotic essence of its subject."
    },
    {
        title: "Persian Lessons",
        director: "Vadim Perelman",
        year: "2020",
        reviewText: "A Holocaust film that finds a fresh angle: inventing a language to survive."
    },
    {
        title: "Drive My Car",
        director: "Ryusuke Hamaguchi",
        year: "2021",
        reviewText: "Three hours long but feels like a single, perfect breath."
    }
];

// Initialize data
if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultShows));
}

function getShows() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveShows(shows) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shows));
    renderReviews();
    if (document.getElementById('admin-section').classList.contains('active')) {
        renderAdminList();
        updateStats();
    }
}

// ===============================================================
// TOAST NOTIFICATIONS
// ===============================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===============================================================
// LANDING PAGE
// ===============================================================
const landingSection = document.getElementById('landing-section');
const reviewsSection = document.getElementById('reviews-section');
const landingCanvas = document.getElementById('landingCanvas');

setTimeout(() => {
    if (!landingSection.classList.contains('hidden')) {
        transitionToReviews();
    }
}, 3000);

landingCanvas.addEventListener('click', transitionToReviews);

function transitionToReviews() {
    landingSection.classList.add('hidden');
    setTimeout(() => {
        landingSection.style.display = 'none';
        reviewsSection.classList.add('visible');
        renderReviews();
    }, 800);
}

// ===============================================================
// AUTHENTICATION
// ===============================================================
let isAuthenticated = sessionStorage.getItem('hamisa_auth') === 'true';

const loginModal = document.getElementById('loginModal');
const openAdminBtn = document.getElementById('open-admin-btn');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const loginCancelBtn = document.getElementById('loginCancelBtn');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');

openAdminBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
    passwordInput.value = '';
    loginError.textContent = '';
    passwordInput.focus();
