// ===============================================================
// SHEETDB CONFIGURATION
// ===============================================================
// IMPORTANT: Replace this URL with your actual SheetDB API URL!
// Get one for free at https://sheetdb.io
const SHEETDB_URL = 'https://sheetdb.io/api/v1/YOUR_API_KEY_HERE'; 
const ADMIN_PASSWORD = 'cute123';

// ===============================================================
// FETCH COMMENTS FROM SHEETDB
// ===============================================================
async function getComments() {
    try {
        const response = await fetch(SHEETDB_URL);
        const data = await response.json();
        console.log('Raw data from SheetDB:', data);
        
        return data.map(row => ({
            id: row.id,
            name: row.name || 'anonymous',
            comment: row.comment || '',
            date: row.date || new Date().toISOString(),
            likes: parseInt(row.likes) || 0,
            anonymous: row.anonymous === 'TRUE' || row.anonymous === 'true',
            parent_id: row.parent_id && row.parent_id !== 'undefined' ? row.parent_id : null
        }));
    } catch (error) {
        console.error('Error fetching comments:', error);
        showToast('🤔 having trouble connecting to the thought cloud...', 'error');
        return [];
    }
}

// ===============================================================
// SAVE COMMENT TO SHEETDB
// ===============================================================
async function saveComment(comment) {
    try {
        const now = new Date();
        const formattedDate = now.toISOString();
        
        console.log('Saving comment with date:', formattedDate);
        
        const response = await fetch(SHEETDB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [{
                    name: comment.name || 'anonymous',
                    comment: comment.comment,
                    date: formattedDate,
                    likes: '0',
                    anonymous: comment.anonymous ? 'TRUE' : 'FALSE',
                    parent_id: comment.parent_id || ''
                }]
            })
        });
        
        if (response.ok) {
            showToast('✨ thought sent to the universe!');
            return true;
        } else {
            const errorText = await response.text();
            console.error('SheetDB error:', errorText);
            throw new Error('Failed to save');
        }
    } catch (error) {
        console.error('Error saving comment:', error);
        showToast('🌈 thought got lost in the clouds... try again?', 'error');
        return false;
    }
}

// ===============================================================
// UPDATE LIKES IN SHEETDB
// ===============================================================
async function updateLikes(commentId, newLikes) {
    try {
        console.log(`Updating likes for ${commentId} to ${newLikes}`);
        
        const response = await fetch(`${SHEETDB_URL}/id/${commentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    likes: newLikes.toString()
                }
            })
        });
        
        if (response.ok) {
            console.log('Likes updated successfully');
        } else {
            console.error('Failed to update likes');
        }
    } catch (error) {
        console.error('Error updating likes:', error);
    }
}

// ===============================================================
// DISPLAY COMMENTS
// ===============================================================
async function displayComments() {
    const container = document.getElementById('commentsContainer');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #d9aa8b;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">☁️</div>
            <p>gathering thoughts from the cloud...</p>
        </div>
    `;
    
    const comments = await getComments();
    console.log('All comments:', comments);
    
    // Separate top-level comments from replies
    const topLevelComments = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);
    
    console.log('Top level:', topLevelComments.length, 'Replies:', replies.length);
    
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
            
            const success = await saveComment({
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
    let newL
