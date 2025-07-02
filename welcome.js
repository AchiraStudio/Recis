// ===== CONFIGURATION =====
const redirectConfig = {
    firstPageUrl: window.location.href,
    secondPageUrl: 'index.html',
    redirectDelay: 500,
    animationDuration: 2000,
    localStorageKey: 'page_redirect_cycle',
    bypassKey: 'bypass_countdown',
    textElements: '.anim-text',
    charDelay: 50,
    unlockDateTime: new Date('2025-07-14T08:00:00'),
    adminPassword: 'rshs2025' // Set your password here
};

// ===== UTILITY FUNCTIONS =====
function log(message) {
    console.log(`[Redirect System] ${message}`);
}

function isUnlocked() {
    return localStorage.getItem(redirectConfig.bypassKey) === 'true' || 
           new Date() >= redirectConfig.unlockDateTime;
}

// ===== BUTTON MANAGEMENT =====
function createAdminButtons() {
    // Create bypass button in top-left corner
    const bypassBtn = document.createElement('button');
    bypassBtn.id = 'bypass-btn';
    bypassBtn.textContent = 'Admin Bypass';
    bypassBtn.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        padding: 8px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        z-index: 10000;
    `;
    document.body.appendChild(bypassBtn);

    // Create reset button in top-right corner
    const resetBtn = document.createElement('button');
    resetBtn.id = 'reset-btn';
    resetBtn.textContent = 'Reset Visit';
    resetBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 8px 15px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        z-index: 10000;
    `;
    document.body.appendChild(resetBtn);

    // Set up bypass functionality
    bypassBtn.addEventListener('click', function() {
        const password = prompt("Enter admin password to bypass countdown:");
        if (password === redirectConfig.adminPassword) {
            localStorage.setItem(redirectConfig.bypassKey, 'true');
            log("Countdown bypassed with correct password");
            removeAdminButtons();
            unlockPage();
        } else if (password !== null) {
            alert("Incorrect password! Please try again.");
        }
    });

    // Set up reset functionality
    resetBtn.addEventListener('click', function() {
        const password = prompt("Enter admin password to reset visit count:");
        if (password === redirectConfig.adminPassword) {
            localStorage.removeItem(redirectConfig.localStorageKey);
            log("Visit count reset by admin");
            alert("Visit count has been reset. The next visit will be treated as first visit.");
        } else if (password !== null) {
            alert("Incorrect password! Please try again.");
        }
    });
}

function removeAdminButtons() {
    const bypassBtn = document.getElementById('bypass-btn');
    const resetBtn = document.getElementById('reset-btn');
    if (bypassBtn) bypassBtn.remove();
    if (resetBtn) resetBtn.remove();
}

function unlockPage() {
    const overlay = document.getElementById('countdown-overlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.5s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            handleFirstVisitAfterUnlock();
        }, 500);
    }
}

// ===== COUNTDOWN SYSTEM =====
function initializeCountdown() {
    log("Initializing countdown...");
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.id = 'countdown-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.95);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: Arial, sans-serif;
        text-align: center;
        backdrop-filter: blur(5px);
    `;

    overlay.innerHTML = `
        <div style="max-width: 600px; padding: 20px;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">Coming Soon</h1>
            <div id="countdown-display" style="font-size: 2rem; margin-bottom: 2rem;"></div>
            <p style="font-size: 1.2rem; margin-bottom: 2rem; line-height: 1.6;">
                Please check back on July 14th at 8 AM!
            </p>
        </div>
    `;

    document.body.appendChild(overlay);
    createAdminButtons();

    // Start countdown update
    const countdownElement = document.getElementById('countdown-display');
    updateCountdown(countdownElement);
    
    return setInterval(() => {
        if (updateCountdown(countdownElement)) {
            clearInterval(this);
            removeAdminButtons();
        }
    }, 1000);
}

function updateCountdown(element) {
    const now = new Date();
    const diff = redirectConfig.unlockDateTime - now;

    if (diff <= 0) {
        element.textContent = "We're Live!";
        const overlay = document.getElementById('countdown-overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 1s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                log("Countdown completed naturally");
                handleFirstVisitAfterUnlock();
            }, 1000);
        }
        return true;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    element.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    return false;
}

// ===== VISIT COUNTER SYSTEM =====
async function handleFirstVisitAfterUnlock() {
    const cycleState = localStorage.getItem(redirectConfig.localStorageKey);
    
    if (!cycleState) {
        log("First visit after unlock - counting visit and redirecting");
        
        showAllSections();
        animateTextElements();
        
        await new Promise(resolve => setTimeout(resolve, redirectConfig.redirectDelay));
        
        localStorage.setItem(redirectConfig.localStorageKey, 'first_visit_after_unlock');
        window.location.href = redirectConfig.secondPageUrl;
    } 
    else if (cycleState === 'first_visit_after_unlock') {
        log("Second visit after unlock - showing normal content");
        showAllSections();
        localStorage.setItem(redirectConfig.localStorageKey, 'returning_visitor');
    }
    else {
        log("Returning visitor - showing normal content");
        showAllSections();
    }
}

// ===== SECTION MANAGEMENT =====
function hideAllSections() {
    log("Hiding all sections");
    const sections = document.querySelectorAll('section, main, .container, .css-slider-wrapper, .navbar');
    sections.forEach(section => {
        section.style.display = 'none';
    });
}

function showAllSections() {
    log("Showing all sections");
    const sections = document.querySelectorAll('section, main, .container, .css-slider-wrapper, .navbar');
    sections.forEach(section => {
        section.style.display = '';
        section.style.opacity = '1';
    });
}

// ===== TEXT ANIMATION =====
function animateTextElements() {
    document.querySelectorAll(redirectConfig.textElements).forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            setTimeout(() => {
                element.textContent += text[i];
                if (i === text.length - 1) {
                    element.classList.add('animation-complete');
                }
            }, i * redirectConfig.charDelay);
        }
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    log("DOM fully loaded");
    
    // Clear bypass flag on page load (optional)
    localStorage.removeItem(redirectConfig.bypassKey);
    
    if (!isUnlocked()) {
        log("Page is locked - showing countdown with admin buttons");
        hideAllSections();
        initializeCountdown();
    } else {
        log("Page is unlocked - checking visit count");
        handleFirstVisitAfterUnlock();
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .anim-text {
        display: inline-block;
        white-space: pre;
    }
    .anim-text.animation-complete {
        animation: pulse 0.5s ease-in-out;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);