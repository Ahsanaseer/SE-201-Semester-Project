/**
 * Toast Notification System
 * Displays toast notifications from top center with animations
 */

// Create toast container if it doesn't exist
function ensureToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
export function showToast(message, type = 'success', duration = 4000) {
    const container = ensureToastContainer();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    
    // Create close button with SVG icon
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    
    // Add close functionality
    const closeToast = () => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeToast);
    
    // Assemble toast
    toast.appendChild(messageEl);
    toast.appendChild(closeBtn);
    
    // Add to container
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('toast-show');
    }, 10);
    
    // Auto-dismiss after duration
    const timeoutId = setTimeout(closeToast, duration);
    
    // Clear timeout if manually closed
    closeBtn.addEventListener('click', () => {
        clearTimeout(timeoutId);
    });
}

/**
 * Show success toast
 */
export function showSuccessToast(message, duration = 4000) {
    showToast(message, 'success', duration);
}

/**
 * Show error toast
 */
export function showErrorToast(message, duration = 5000) {
    showToast(message, 'error', duration);
}


