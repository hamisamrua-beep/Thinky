// ===============================================================
// DATA MANAGEMENT
// ===============================================================
const STORAGE_KEY = 'hamisa_shows';
const ADMIN_PASSWORD = 'hamisa123';

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
    if (document.getElementById('admin-section') && document.getElementById('admin-section').classList.contains('active')) {
        renderAdminList();
        updateStats();
    }
}

// ===============================================================
// TOAST NOTIFICATIONS
// ===============================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===============================================================
// LANDING PAGE - FIXED VERSION
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, setting up landing page...');
    
    const landingSection = document.getElementById('landing-section');
    const reviewsSection = document.getElementById('reviews-section');
    const landingCanvas = document.getElementById('landingCanvas');
    
    // Check if elements exist
    if (!landingSection || !reviewsSection || !landingCanvas) {
        console.error('Missing required elements!');
        return;
    }
    
    // Function to transition to reviews
    function transitionToReviews() {
        console.log('Transitioning to reviews...');
        landingSection.classList.add('hidden');
        
        setTimeout(() => {
            landingSection.style.display = 'none';
            reviewsSection.classList.add('visible');
            renderReviews();
            console.log('Transition complete');
        }, 800);
    }
    
    // Auto transition after 3 seconds
    setTimeout(() => {
        if (!landingSection.classList.contains('hidden')) {
            console.log('Auto transition triggered');
            transitionToReviews();
        }
    }, 3000);
    
    // Click handler
    landingCanvas.addEventListener('click', function() {
        console.log('Canvas clicked');
        transitionToReviews();
    });
    
    // MANUAL OVERRIDE: If you're stuck, click anywhere on the page
    document.addEventListener('keydown', function(e) {
        // Press 'Escape' to force transition
        if (e.key === 'Escape') {
            console.log('Escape pressed - forcing transition');
            transitionToReviews();
        }
    });
    
    // Add a small hint
    console.log('Click the canvas or wait 3 seconds to enter. Press ESC if stuck.');
});

// ===============================================================
// AUTHENTICATION
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('loginModal');
    const openAdminBtn = document.getElementById('open-admin-btn');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const loginCancelBtn = document.getElementById('loginCancelBtn');
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');
    const backToReviewsBtn = document.getElementById('back-to-reviews-btn');
    
    if (openAdminBtn) {
        openAdminBtn.addEventListener('click', () => {
            if (loginModal) {
                loginModal.style.display = 'flex';
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.focus();
                }
                if (loginError) loginError.textContent = '';
            }
        });
    }
    
    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', () => {
            if (passwordInput && passwordInput.value === ADMIN_PASSWORD) {
                sessionStorage.setItem('hamisa_auth', 'true');
                if (loginModal) loginModal.style.display = 'none';
                showToast('welcome, admin', 'success');
                
                // Show admin section
                const reviewsSection = document.getElementById('reviews-section');
                const adminSection = document.getElementById('admin-section');
                
                if (reviewsSection) reviewsSection.classList.remove('visible');
                if (adminSection) adminSection.classList.add('active');
                
                renderAdminList();
                updateStats();
            } else {
                if (loginError) loginError.textContent = 'incorrect password';
                if (passwordInput) passwordInput.value = '';
                showToast('incorrect password', 'error');
            }
        });
    }
    
    if (loginCancelBtn) {
        loginCancelBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
            if (loginError) loginError.textContent = '';
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && loginSubmitBtn) loginSubmitBtn.click();
        });
    }
    
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                if (loginError) loginError.textContent = '';
            }
        });
    }
    
    // Back to reviews button
    if (backToReviewsBtn) {
        backToReviewsBtn.addEventListener('click', () => {
            const adminSection = document.getElementById('admin-section');
            const reviewsSection = document.getElementById('reviews-section');
            
            if (adminSection) adminSection.classList.remove('active');
            if (reviewsSection) reviewsSection.classList.add('visible');
        });
    }
});

// ===============================================================
// REVIEWS PAGE
// ===============================================================
function renderReviews() {
    const grid = document.getElementById('reviewGrid');
    const counterNote = document.getElementById('counterNote');
    
    if (!grid || !counterNote) return;
    
    const shows = getShows();
    grid.innerHTML = '';

    if (shows.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#9b846d;">no shows yet</div>';
        counterNote.innerHTML = '<span>✦ 0 shows ✦</span>';
        return;
    }

    shows.forEach((show, index) => {
        const card = document.createElement('div');
        card.className = 'review-card';
        
        const previewText = show.reviewText.length > 70 
            ? show.reviewText.substring(0, 70) + '…' 
            : show.reviewText;

        card.innerHTML = `
            <div class="card-index">${String(index + 1).padStart(2, '0')} <span>${show.year || '—'}</span></div>
            <div class="film-title">${show.title}</div>
            <div class="film-director">${show.director || ''}</div>
            <div class="film-synopsis">${previewText}</div>
            <div class="film-meta">
                <span class="badge">review</span>
                ${show.year ? '<span class="badge">' + show.year + '</span>' : ''}
            </div>
        `;

        card.addEventListener('click', () => {
            const modalOverlay = document.getElementById('reviewModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalReview = document.getElementById('modalReview');
            
            if (modalTitle && modalReview && modalOverlay) {
                modalTitle.textContent = show.title;
                modalReview.textContent = show.reviewText;
                modalOverlay.style.display = 'flex';
            }
        });

        grid.appendChild(card);
    });

    counterNote.innerHTML = `<span>✦ ${shows.length} shows · click any card ✦</span>`;
}

// ===============================================================
// MODAL HANDLERS
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('reviewModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const shareModalBtn = document.getElementById('shareModalBtn');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (modalOverlay) modalOverlay.style.display = 'none';
        });
    }
    
    if (shareModalBtn) {
        shareModalBtn.addEventListener('click', () => {
            const modalTitle = document.getElementById('modalTitle');
            const modalReview = document.getElementById('modalReview');
            
            if (modalTitle && modalReview) {
                const text = `${modalTitle.textContent}\n\n${modalReview.textContent}`;
                navigator.clipboard.writeText(text).then(() => {
                    showToast('copied to clipboard', 'success');
                });
            }
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    }
});

// ===============================================================
// SEARCH
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            const cards = document.querySelectorAll('.review-card');
            cards.forEach(card => {
                const title = card.querySelector('.film-title')?.textContent.toLowerCase() || '';
                const director = card.querySelector('.film-director')?.textContent.toLowerCase() || '';
                if (title.includes(term) || director.includes(term)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});

// ===============================================================
// ADMIN PANEL
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    const showForm = document.getElementById('showForm');
    const titleInput = document.getElementById('title');
    const directorInput = document.getElementById('director');
    const yearInput = document.getElementById('year');
    const reviewInput = document.getElementById('reviewText');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const showsContainer = document.getElementById('showsContainer');
    const showCount = document.getElementById('showCount');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    
    let editingIndex = null;
    
    window.updateStats = function() {
        const statsDashboard = document.getElementById('statsDashboard');
        if (!statsDashboard) return;
        
        const shows = getShows();
        statsDashboard.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${shows.length}</div>
                <div class="stat-label">total shows</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${new Set(shows.map(s => s.year)).size}</div>
                <div class="stat-label">years</div>
            </div>
        `;
    };
    
    window.renderAdminList = function() {
        if (!showsContainer || !showCount) return;
        
        const shows = getShows();
        showCount.textContent = shows.length;

        showsContainer.innerHTML = shows.map((show, index) => `
            <div class="show-item">
                <div>
                    <strong>${show.title}</strong> ${show.year ? '(' + show.year + ')' : ''}
                    <br><small>${show.director || ''}</small>
                </div>
                <div class="show-actions">
                    <button onclick="editShow(${index})">edit</button>
                    <button onclick="deleteShow(${index})" style="background:#e8cfc0;">delete</button>
                </div>
            </div>
        `).join('');
    };
    
    window.editShow = function(index) {
        const shows = getShows();
        const show = shows[index];
        if (titleInput) titleInput.value = show.title;
        if (directorInput) directorInput.value = show.director || '';
        if (yearInput) yearInput.value = show.year || '';
        if (reviewInput) reviewInput.value = show.reviewText;
        editingIndex = index;
        if (saveBtn) saveBtn.textContent = '✎ update show';
    };
    
    window.deleteShow = function(index) {
        if (confirm('delete this show?')) {
            const shows = getShows();
            shows.splice(index, 1);
            saveShows(shows);
            renderAdminList();
            updateStats();
            showToast('show deleted', 'success');
            if (editingIndex === index) clearForm();
        }
    };
    
    function clearForm() {
        if (titleInput) titleInput.value = '';
        if (directorInput) directorInput.value = '';
        if (yearInput) yearInput.value = '';
        if (reviewInput) reviewInput.value = '';
        editingIndex = null;
        if (saveBtn) saveBtn.textContent = '➕ add show';
    }
    
    if (showForm) {
        showForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!titleInput || !reviewInput) return;
            
            const shows = getShows();
            const newShow = {
                title: titleInput.value.trim(),
                director: directorInput ? directorInput.value.trim() : '',
                year: yearInput ? yearInput.value.trim() : '',
                reviewText: reviewInput.value.trim()
            };
            
            if (editingIndex !== null) {
                shows[editingIndex] = newShow;
                showToast('show updated', 'success');
            } else {
                shows.push(newShow);
                showToast('show added', 'success');
            }
            
            saveShows(shows);
            renderAdminList();
            updateStats();
            clearForm();
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearForm);
    }
    
    // Export
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataStr = JSON.stringify(getShows(), null, 2);
            const blob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hamisa_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            showToast('exported', 'success');
        });
    }
    
    // Import
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const shows = JSON.parse(e.target.result);
                        saveShows(shows);
                        renderAdminList();
                        updateStats();
                        showToast(`imported ${shows.length} shows`, 'success');
                    } catch {
                        showToast('invalid file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
    }
});

// ===============================================================
// BACK TO TOP
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// ===============================================================
// INITIAL RENDER
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initial render');
    renderReviews();
});
