// ===============================================================
// THOUGHTS PAGE - Using Local Storage (No SheetDB needed)
// ===============================================================
const ADMIN_PASSWORD = 'cute123';
const STORAGE_KEY = 'thinky_place_comments';

// ===============================================================
// INITIALIZE SAMPLE DATA
// ===============================================================
const sampleComments = [
    {
        id: '1',
        name: 'cozy potato',
        comment: 'clouds are looking extra fluffy today ☁️',
        date: new Date().toISOString(),
        likes: 5,
        anonymous: false,
        parent_id: null,
        replies: []
    },
    {
        id: '2',
        name: 'sneaky friend',
        comment: 'just wanted to say that everyone here is valid and loved! 💕',
        date: new Date(Date.now() - 3600000).toISOString(),
        likes: 12,
        anonymous: true,
        parent_id: null,
        replies: []
    },
    {
        id: '3',
        name: 'thoughtful human',
        comment: 'does anyone else think about how amazing it is that we exist??',
        date: new Date(Date.now() - 86400000).toISOString(),
        likes: 8,
        anonymous: false,
        parent_id: null,
        replies: []
    }
];

// Initialize localStorage with sample data if empty
if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleComments));
}

// ===============================================================
// GET COMMENTS
// ===============================================================
function getComments() {
    try {
        const comments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        console.log('Comments from localStorage:', comments);
        return comments;
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

// ===============================================================
// SAVE COMMENT
// ===============================================================
function saveComment(comment) {
    try {
        const comments = getComments();
        
        // Create new comment object
        const newComment = {
            id: Date.now().toString(), // Simple unique ID
            name: comment.name || 'anonymous',
            comment: comment.comment,
            date: new Date().toISOString(),
            likes: 0,
            anonymous: comment.anonymous || false,
            parent_id: comment.parent_id || null,
            replies: []
        };
        
        comments.push(newComment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
        
        showToast('✨ thought sent to the universe!');
        return true;
    } catch (error) {
        console.error('Error saving comment:', error);
        showToast('🌈 something went wrong... try again?', 'error');
        return false;
    }
}

// ===============================================================
// UPDATE LIKES
// ===============================================================
function updateLikes(commentId, newLikes) {
    try {
        const comments = getComments();
        const commentIndex = comments.findIndex(c => c.id === commentId);
        
        if (commentIndex !== -1) {
            comments[commentIndex].likes = newLikes;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
            console.log('Likes updated');
        }
    } catch (error) {
        console.error('Error updating likes:', error);
    }
}

// ===============================================================
// ADD REPLY
// ===============================================================
function addReply(parentId, replyData) {
    try {
        const comments = getComments();
        const newReply = {
            id: Date.now().toString() + '-reply',
            name: replyData.name || 'sneaky friend',
            comment: replyData.comment,
            date: new Date().toISOString(),
            likes: 0,
            anonymous: replyData.anonymous || true,
            parent_id: parentId
        };
        
        comments.push(newReply);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
        return true;
    } catch (error) {
        console.error('Error adding reply:', error);
        return false;
    }
}

// ===============================================================
// BACK TO TOP
// ===============================================================
const backToTop = document.getElementById('backToTop');

if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 300);
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===============================================================
// DISPLAY COMMENTS
// ===============================================================
async function displayComments() {
    const container = document.getElementById('commentsContainer');
    if (!container) return;
    
    const comments = getComments();
    
    // Separate top-level comments from replies
    const topLevelComments = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);
    
    const sortBy = document.getElementById('sortComments')?.value || 'newest';
    
    // Sort comments
    if (sortBy === 'popular') {
        topLevelComments.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'oldest') {
        topLevelComments.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
        topLevelComments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    if (topLevelComments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #d9aa8b;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🫧</div>
                <p>no thoughts yet... be the first!</p>
                <p style="font-size: 0.9rem;">drop a thought in the box ➡️</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    for (const comment of topLevelComments) {
        // Find replies for this comment
        const commentReplies = replies.filter(r => r.parent_id === comment.id);
        
        html += `
            <div class="thought-card" data-id="${comment.id}">
                <div class="thought-header">
                    <span class="thought-name">${comment.anonymous ? '🕵️‍♀️ sneaky friend' : (comment.name || 'someone cute')}</span>
                    <span class="thought-date">${formatDate(comment.date)}</span>
                </div>
                <div class="thought-content">${comment.comment}</div>
                <div class="thought-footer">
                    <div class="like-section">
                        <button class="like-btn ${localStorage.getItem(`liked-${comment.id}`) ? 'liked' : ''}" 
                                onclick="toggleLike('${comment.id}', ${comment.likes})">❤️</button>
                        <span id="likes-${comment.id}">${comment.likes}</span>
                    </div>
                    <button class="reply-btn" onclick="showReplyForm('${comment.id}')">💬 reply</button>
                    ${comment.anonymous ? '<span class="sneaky-badge">sneaky mode</span>' : ''}
                </div>
                <div class="reply-form" id="reply-form-${comment.id}">
                    <input type="text" class="reply-input" id="reply-name-${comment.id}" placeholder="your name (or stay sneaky)">
                    <input type="text" class="reply-input" id="reply-text-${comment.id}" placeholder="type your reply...">
                    <button class="reply-submit" onclick="postReply('${comment.id}')">send reply ✨</button>
                </div>
                ${renderReplies(commentReplies)}
            </div>
        `;
    }
    
    container.innerHTML = html;
    updateStats(topLevelComments.length);
}

// ===============================================================
// RENDER REPLIES
// ===============================================================
function renderReplies(replies) {
    if (!replies || replies.length === 0) return '';
    
    let html = '<div class="replies">';
    replies.forEach(reply => {
        html += `
            <div class="reply-card">
                <span class="reply-name">${reply.anonymous ? '🕵️‍♀️' : (reply.name || 'someone')}</span>
                <span class="reply-time">${formatDate(reply.date)}</span>
                <p style="margin-top: 0.3rem;">${reply.comment}</p>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

// ===============================================================
// POST NEW COMMENT
// ===============================================================
document.addEventListener('DOMContentLoaded', function() {
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim() || 'anonymous';
            const comment = document.getElementById('comment').value.trim();
            const anonymous = document.getElementById('anonymousCheck').checked;
            const captcha = document.getElementById('captcha').value;
            
            if (parseInt(captcha) !== 4) {
                showToast('🧸 oops! 2+2 is 4! try again?', 'error');
                return;
            }
            
            if (!comment) {
                showToast('🌸 write something sweet first!', 'error');
                return;
            }
            
            const success = saveComment({
                name: name,
                comment: comment,
                anonymous: anonymous
            });
            
            if (success) {
                e.target.reset();
                document.getElementById('anonymousCheck').checked = true;
                await displayComments();
            }
        });
    }
});

// ===============================================================
// TOGGLE LIKE
// ===============================================================
window.toggleLike = async function(commentId, currentLikes) {
    const liked = localStorage.getItem(`liked-${commentId}`);
    let newLikes;
    
    if (liked) {
        newLikes = currentLikes - 1;
        localStorage.removeItem(`liked-${commentId}`);
        showToast('💔 un-liked');
    } else {
        newLikes = currentLikes + 1;
        localStorage.setItem(`liked-${commentId}`, 'true');
        showToast('❤️ liked!');
    }
    
    // Update the display immediately
    const likesSpan = document.getElementById(`likes-${commentId}`);
    if (likesSpan) {
        likesSpan.textContent = newLikes;
    }
    
    // Update the button class
    const likeBtn = event.target;
    if (likeBtn) {
        if (liked) {
            likeBtn.classList.remove('liked');
        } else {
            likeBtn.classList.add('liked');
        }
    }
    
    // Update in localStorage
    updateLikes(commentId, newLikes);
};

// ===============================================================
// SHOW REPLY FORM
// ===============================================================
window.showReplyForm = function(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
        form.classList.toggle('show');
    }
};

// ===============================================================
// POST REPLY
// ===============================================================
window.postReply = async function(parentId) {
    const nameInput = document.getElementById(`reply-name-${parentId}`);
    const textInput = document.getElementById(`reply-text-${parentId}`);
    
    if (!nameInput || !textInput) return;
    
    const name = nameInput.value.trim() || 'sneaky friend';
    const text = textInput.value.trim();
    
    if (!text) {
        showToast('🤔 write something first!');
        return;
    }
    
    const success = addReply(parentId, {
        name: name,
        comment: text,
        anonymous: name === 'sneaky friend'
    });
    
    if (success) {
        document.getElementById(`reply-form-${parentId}`).classList.remove('show');
        nameInput.value = '';
        textInput.value = '';
        await displayComments();
        showToast('✨ reply posted!');
    }
};

// ===============================================================
// FORMAT DATE
// ===============================================================
function formatDate(dateString) {
    if (!dateString) return 'just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (isNaN(date.getTime())) return 'just now';
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return mins + (mins === 1 ? ' min ago' : ' mins ago');
    }
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    }
    if (diff < 172800000) return 'yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ===============================================================
// UPDATE STATS
// ===============================================================
function updateStats(totalComments) {
    const totalEl = document.getElementById('totalComments');
    const todayEl = document.getElementById('todayComments');
    const activeEl = document.getElementById('activeUsers');
    
    if (totalEl) totalEl.textContent = totalComments;
    
    // Calculate today's comments
    const comments = getComments();
    const today = new Date().toDateString();
    const todayComments = comments.filter(c => {
        if (!c.date) return false;
        const commentDate = new Date(c.date).toDateString();
        return commentDate === today;
    }).length;
    
    if (todayEl) todayEl.textContent = todayComments;
    if (activeEl) activeEl.textContent = Math.floor(Math.random() * 10) + 4;
}

// ===============================================================
// SHOW TOAST
// ===============================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===============================================================
// SORT COMMENTS
// ===============================================================
document.getElementById('sortComments')?.addEventListener('change', displayComments);

// ===============================================================
// INITIAL LOAD
// ===============================================================
displayComments();

// ===============================================================
// ADMIN MODAL
// ===============================================================
const loginModal = document.getElementById('loginModal');
const openAdminBtn = document.getElementById('openAdminBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminCancelBtn = document.getElementById('adminCancelBtn');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');

if (openAdminBtn) {
    openAdminBtn.addEventListener('click', () => {
        if (loginModal) {
            loginModal.style.display = 'flex';
            if (adminPassword) adminPassword.value = '';
            if (loginError) loginError.textContent = '';
        }
    });
}

if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
        if (adminPassword && adminPassword.value === ADMIN_PASSWORD) {
            if (loginModal) loginModal.style.display = 'none';
            showToast('✨ welcome to the secret spot!');
        } else {
            if (loginError) loginError.textContent = 'nope! try again ✨';
            showToast('🔐 wrong password!', 'error');
        }
    });
}

if (adminCancelBtn) {
    adminCancelBtn.addEventListener('click', () => {
        if (loginModal) loginModal.style.display = 'none';
    });
}

if (loginModal) {
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
}
