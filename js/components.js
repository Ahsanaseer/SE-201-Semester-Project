import { getCurrentUser, logOut } from './login.js';
import { showSuccessToast } from './toast.js';

/**
 * Reusable Components for Pulse Chain GIKI
 * This file contains functions to dynamically inject reusable components (sidebar, top bar, etc.)
 * into pages
 */

/**
 * Renders the sidebar component
 * @param {string} activePage - The current active page ('home', 'hospital-dashboard', 'donate', 'request', 'history', 'profile')
 */
export function renderSidebar(activePage = 'home') {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) {
        console.error('Sidebar container not found. Please add a div with id="sidebar-container" to your page.');
        return;
    }

    const sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-logo">
                <img src="PICS/Pulse_Chain_GIKI Logo Icon.png" alt="Pulse Chain GIKI Logo" class="logo-icon-img">
                <div class="logo-text">Pulse Chain GIKI</div>
            </div>

            <nav class="sidebar-menu">
                <a href="index.html" class="menu-item ${activePage === 'home' ? 'active' : ''}" data-page="dashboard">
                    <span class="menu-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </span>
                    <span class="menu-text">Home</span>
                </a>
                <a href="hospital-dashboard.html" class="menu-item ${activePage === 'hospital-dashboard' ? 'active' : ''}">
                    <span class="menu-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </span>
                    <span class="menu-text">Hospital Dashboard</span>
                </a>
                <a href="donate.html" class="menu-item ${activePage === 'donate' ? 'active' : ''}">
                    <span class="menu-icon" style="display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            style="width: 24px; height: 24px; display: block; margin-top: -2px;">
                            <path
                                d="M12 2c-2.5 0-4.5 2-4.5 4.5 0 3 4.5 7.5 4.5 7.5s4.5-4.5 4.5-7.5c0-2.5-2-4.5-4.5-4.5z"
                                fill="currentColor" transform="scale(1 -1) translate(0 -24)" />
                        </svg>
                    </span>
                    <span class="menu-text">Donate Blood</span>
                </a>
                <a href="request.html" class="menu-item ${activePage === 'request' ? 'active' : ''}">
                    <span class="menu-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </span>
                    <span class="menu-text">Request Blood</span>
                </a>
                <a href="history.html" class="menu-item ${activePage === 'history' ? 'active' : ''}">
                    <span class="menu-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                    </span>
                    <span class="menu-text">My History</span>
                </a>
                <a href="#" class="menu-item ${activePage === 'profile' ? 'active' : ''}" data-page="profile">
                    <span class="menu-icon" id="userProfileSideBar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </span>
                    <span class="menu-text">Profile</span>
                </a>
            </nav>

            <div class="user-profile-section">
                <div class="user-profile" id="userProfile">
                    <div class="user-avatar" id="userAvatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div class="user-info">
                        <div class="user-name" id="userName">Login</div>
                        <div class="user-role" id="userRole">Click to sign in</div>
                    </div>
                </div>
            </div>
        </aside>
    `;

    sidebarContainer.innerHTML = sidebarHTML;
}

/**
 * Renders the top header component
 * @param {string} title - The title to display in the header
 * @param {string} searchPlaceholder - Placeholder text for the search bar
 */
export function renderTopHeader(title = 'Dashboard', searchPlaceholder = 'Search donors, requests...') {
    const topHeaderContainer = document.getElementById('top-header-container');
    if (!topHeaderContainer) {
        console.error('Top header container not found. Please add a div with id="top-header-container" to your page.');
        return;
    }

    const topHeaderHTML = `
        <header class="top-header">
            <h1 class="header-title">${title}</h1>
            <div class="header-actions">
                <div class="search-bar">
                    <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input type="text" id="searchInput" placeholder="${searchPlaceholder}">
                </div>
                <button class="logout-icon-btn" id="logoutBtn" style="display: none;" title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </header>
    `;

    topHeaderContainer.innerHTML = topHeaderHTML;
}

/**
 * Renders the mobile menu toggle button
 */
export function renderMobileMenuToggle() {
    const mobileToggleContainer = document.getElementById('mobile-menu-toggle-container');
    if (!mobileToggleContainer) {
        console.error('Mobile menu toggle container not found. Please add a div with id="mobile-menu-toggle-container" to your page.');
        return;
    }

    const mobileToggleHTML = `
        <button class="mobile-menu-toggle" id="mobileMenuToggle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
        </button>
    `;

    mobileToggleContainer.innerHTML = mobileToggleHTML;

    // Add event listener for mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

/**
 * Renders the profile modal component
 */
export function renderProfileModal() {
    const profileModalContainer = document.getElementById('profile-modal-container');
    if (!profileModalContainer) {
        console.error('Profile modal container not found. Please add a div with id="profile-modal-container" to your page.');
        return;
    }

    const profileModalHTML = `
        <div id="profileModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Profile</h2>
                    <button class="modal-close" id="closeProfileModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="profile-content">
                        <div class="profile-avatar-section">
                            <div class="profile-avatar-large" id="profileAvatarLarge">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <h3 id="profileName">User</h3>
                            <p id="profileEmail" class="profile-email">user@example.com</p>
                        </div>

                        <div class="profile-info-section">
                            <div class="profile-info-item">
                                <label>Full Name</label>
                                <div class="profile-info-value" id="profileDisplayName">-</div>
                            </div>
                            <div class="profile-info-item">
                                <label>Email</label>
                                <div class="profile-info-value" id="profileEmailValue">-</div>
                            </div>
                            <div class="profile-info-item">
                                <label>Role</label>
                                <div class="profile-info-value">User</div>
                            </div>
                            <div class="profile-info-item">
                                <label>Member Since</label>
                                <div class="profile-info-value" id="profileMemberSince">-</div>
                            </div>
                        </div>

                        <div class="profile-actions">
                            <button class="btn btn-primary btn-block" id="editProfileBtn">Edit Profile</button>
                            <button class="btn btn-secondary btn-block" id="profileLogoutBtn">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    profileModalContainer.innerHTML = profileModalHTML;
}

/**
 * Sets up event listeners for the profile modal
 */
function setupProfileModalEvents() {
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const profileLogoutBtn = document.getElementById('profileLogoutBtn');
    const userProfile = document.getElementById('userProfile');
    const profileMenuItem = document.querySelector('.menu-item[data-page="profile"]');

    if (!profileModal) return;

    // Function to open profile modal
    const openProfileModal = () => {
        const user = getCurrentUser();
        if (!user) {
            // If not logged in, redirect to login
            window.location.href = 'login.html';
            return;
        }

        // Update modal content with user data
        if (document.getElementById('profileName')) document.getElementById('profileName').textContent = user.displayName || user.email || 'User';
        if (document.getElementById('profileEmail')) document.getElementById('profileEmail').textContent = user.email || '-';
        if (document.getElementById('profileDisplayName')) document.getElementById('profileDisplayName').textContent = user.displayName || '-';
        if (document.getElementById('profileEmailValue')) document.getElementById('profileEmailValue').textContent = user.email || '-';

        // Set avatar
        const profileAvatarLarge = document.getElementById('profileAvatarLarge');
        if (profileAvatarLarge) {
            if (user.displayName) {
                profileAvatarLarge.innerHTML = `<span style="font-size: 32px; font-weight: 400;">${user.displayName.charAt(0).toUpperCase()}</span>`;
            } else {
                profileAvatarLarge.innerHTML = '<span style="font-size: 32px; font-weight: 400;">U</span>';
            }
        }

        // Set member since
        if (document.getElementById('profileMemberSince')) {
            if (user.metadata && user.metadata.creationTime) {
                const createdDate = new Date(user.metadata.creationTime);
                document.getElementById('profileMemberSince').textContent = createdDate.toLocaleDateString();
            } else {
                document.getElementById('profileMemberSince').textContent = '-';
            }
        }

        profileModal.style.display = 'flex';
    };

    // Event listeners for opening modal
    if (userProfile) {
        // Clone and replace to remove existing listeners (prevent duplicates)
        const newUserProfile = userProfile.cloneNode(true);
        userProfile.parentNode.replaceChild(newUserProfile, userProfile);
        newUserProfile.addEventListener('click', openProfileModal);
    }

    if (profileMenuItem) {
        // Clone and replace to remove existing listeners
        const newProfileMenuItem = profileMenuItem.cloneNode(true);
        profileMenuItem.parentNode.replaceChild(newProfileMenuItem, profileMenuItem);
        newProfileMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            openProfileModal();
        });
    }

    // Close modal
    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.style.display = 'none';
        }
    });

    // Logout logic
    if (profileLogoutBtn) {
        // Clone and replace to remove existing listeners
        const newLogoutBtn = profileLogoutBtn.cloneNode(true);
        profileLogoutBtn.parentNode.replaceChild(newLogoutBtn, profileLogoutBtn);

        newLogoutBtn.addEventListener('click', async () => {
            const result = await logOut();
            if (result.success) {
                sessionStorage.removeItem('adminLoggedIn');
                sessionStorage.removeItem('adminEmail');
                profileModal.style.display = 'none';
                showSuccessToast('Logged out successfully!');
                // UI updates will be handled by onAuthStateChange in the respective pages
            }
        });
    }
}

/**
 * Initializes all components for a dashboard page
 * @param {Object} config - Configuration object
 * @param {string} config.activePage - The current active page
 * @param {string} config.headerTitle - Title for the top header
 * @param {string} config.searchPlaceholder - Placeholder for search bar
 */
export function initializeDashboardComponents(config = {}) {
    const {
        activePage = 'home',
        headerTitle = 'Dashboard',
        searchPlaceholder = 'Search donors, requests...'
    } = config;

    // 1. Shimmer Overlay is now in HTML to prevent FOUC

    // 2. Hide Main Content initially
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
        dashboardContainer.classList.add('content-hidden');
    }

    // 3. Render Components
    renderSidebar(activePage);
    renderTopHeader(headerTitle, searchPlaceholder);
    renderMobileMenuToggle();
    renderProfileModal();

    // 4. Setup Event Listeners (Profile Modal, etc.)
    setupProfileModalEvents();

    // 5. Synchronize and Reveal (1 second delay)
    setTimeout(() => {
        const overlay = document.getElementById('shimmerOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500); // Remove from DOM after fade out
        }

        if (dashboardContainer) {
            dashboardContainer.classList.remove('content-hidden');
            dashboardContainer.classList.add('content-visible');
        }
    }, 1000);
}
