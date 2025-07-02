// ===== CONFIGURATION =====
const redirectConfig = {
    firstPageUrl: window.location.href,
    secondPageUrl: 'welcome.html',
    redirectDelay: 500,
    animationDuration: 2000,
    localStorageKey: 'page_redirect_cycle',
    textElements: '.anim-text',
    charDelay: 50,
    unlockDateTime: new Date('2025-07-14T08:00:00') // Change this to your target date
};

// ===== UTILITY FUNCTIONS =====
function log(message) {
    console.log(`[Redirect System] ${message}`);
}

function isUnlocked() {
    return new Date() >= redirectConfig.unlockDateTime;
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

    // Create countdown content
    overlay.innerHTML = `
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">Coming Soon</h1>
        <div id="countdown-display" style="font-size: 2rem; margin-bottom: 2rem;"></div>
        <p style="font-size: 1.2rem; max-width: 600px; line-height: 1.6;">
            Kamu kepo. Cek lagi di July 9th jam 8 AM!
        </p>
    `;

    document.body.appendChild(overlay);
    log("Countdown overlay created");

    // Start countdown update
    const countdownElement = document.getElementById('countdown-display');
    updateCountdown(countdownElement);
    
    return setInterval(() => {
        updateCountdown(countdownElement);
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
                log("Countdown removed, unlocking page");
                handlePageUnlocked();
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

// ===== SECTION MANAGEMENT =====
function hideAllSections() {
    log("Hiding all sections");
    const sections = document.querySelectorAll('section, main, .container'); // Add other selectors as needed
    sections.forEach(section => {
        section.style.display = 'none'; // Instantly hide without animation
    });
    return Promise.resolve(); // Return resolved promise since we're not animating
}

function showAllSections() {
    log("Showing all sections");
    const sections = document.querySelectorAll('section, main, .container');
    sections.forEach(section => {
        section.style.display = '';
        section.style.opacity = '1'; // Instantly show without animation
    });
    return Promise.resolve(); // Return resolved promise since we're not animating
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

// ===== REDIRECT LOGIC =====
async function handlePageUnlocked() {
    const cycleState = localStorage.getItem(redirectConfig.localStorageKey);
    
    if (!cycleState) {
        // First visit - animate in then redirect to second page
        await showAllSections();
        animateTextElements();
        
        await new Promise(resolve => setTimeout(resolve, redirectConfig.redirectDelay));
        await hideAllSections();
        
        localStorage.setItem(redirectConfig.localStorageKey, 'first_redirect');
        window.location.href = redirectConfig.secondPageUrl;
    } 
    else if (cycleState === 'first_redirect') {
        // Second page should redirect back here with normal display
        await showAllSections();
        localStorage.setItem(redirectConfig.localStorageKey, 'cycle_complete');
    }
    else {
        // Normal subsequent visits
        redirectConfig.animationDuration = 0;
        await showAllSections();
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    log("DOM fully loaded");
    
    if (!isUnlocked()) {
        log("Page is locked - showing countdown immediately");
        // Hide all content instantly (no animation)
        document.querySelectorAll('section, main, .container, .css-slider-wrapper, .navbar').forEach(el => {
            el.style.display = 'none';
        });
        // Show countdown immediately
        initializeCountdown();
    } else {
        log("Page is unlocked - proceeding with normal flow");
        // For unlocked state, use the normal flow with animations
        await hideAllSections();
        await handlePageUnlocked();
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

// Debug helper
window.resetRedirectSystem = function() {
    localStorage.removeItem(redirectConfig.localStorageKey);
    log("Redirect system has been reset");
    location.reload();
};