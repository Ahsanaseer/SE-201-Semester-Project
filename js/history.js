/**
 * History Page JavaScript
 * Displays detailed user donation and request history
 */

import { initializeDashboardComponents } from './components.js';
import { getCurrentUser, logOut, onAuthStateChange } from './login.js';
import { getUserDonations } from './donor.js';
import { getUserRequests } from './request.js';
import { showSuccessToast, showErrorToast } from './toast.js';

// Initialize dashboard components
initializeDashboardComponents({
    activePage: 'history',
    headerTitle: 'My History',
    searchPlaceholder: 'Search history...'
});

// DOM Elements
const userNameSpan = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const userAvatar = document.getElementById('userAvatar');
const userProfile = document.getElementById('userProfile');
const logoutBtn = document.getElementById('logoutBtn');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const historyContainer = document.getElementById('historyContainer');
const searchInput = document.getElementById('searchInput');

// State
let isLoggedIn = false;
let allHistory = [];
let currentFilter = 'all';
let currentSearchTerm = '';

/**
 * Initialize UI to logged-out state
 */
function initializeLoggedOutState() {
    isLoggedIn = false;
    userNameSpan.textContent = 'Login';
    userRole.textContent = 'Click to sign in';
    userAvatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    logoutBtn.style.display = 'none';
    userProfile.style.cursor = 'pointer';
}

/**
 * Load user history (donations and requests)
 */
async function loadUserHistory(userEmail) {
    try {
        // Load donations
        const donationsResult = await getUserDonations(userEmail);
        let donations = [];
        if (donationsResult.success && donationsResult.donations) {
            donations = donationsResult.donations.map(d => ({ ...d, type: 'donation' }));
        }

        // Load requests
        const requestsResult = await getUserRequests(userEmail);
        let requests = [];
        if (requestsResult.success && requestsResult.requests) {
            requests = requestsResult.requests.map(r => ({ ...r, type: 'request' }));
        }

        // Combine and sort by timestamp
        allHistory = [...donations, ...requests];
        allHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Debug: Log donation data to check contact field
        console.log('Loaded donations:', donations);
        console.log('Sample donation data:', donations[0]);

        displayHistory();
    } catch (error) {
        console.error('Error loading history:', error);
        showErrorToast('Failed to load history');
        displayEmptyState('Error loading history. Please try again.');
    }
}

/**
 * Display history items
 */
function displayHistory() {
    // Filter by type
    let filtered = allHistory;
    if (currentFilter === 'donations') {
        filtered = allHistory.filter(item => item.type === 'donation');
    } else if (currentFilter === 'requests') {
        filtered = allHistory.filter(item => item.type === 'request');
    }

    // Filter by search term
    if (currentSearchTerm) {
        filtered = filtered.filter(item => {
            const searchLower = currentSearchTerm.toLowerCase();
            if (item.type === 'donation') {
                return item.fullName?.toLowerCase().includes(searchLower) ||
                    item.bloodGroup?.toLowerCase().includes(searchLower) ||
                    item.contact?.toLowerCase().includes(searchLower);
            } else {
                return item.bloodGroup?.toLowerCase().includes(searchLower) ||
                    item.requestedDonorName?.toLowerCase().includes(searchLower);
            }
        });
    }

    if (filtered.length === 0) {
        const message = currentSearchTerm
            ? 'No history items match your search.'
            : currentFilter === 'donations'
                ? 'No donations found. Start by donating blood!'
                : currentFilter === 'requests'
                    ? 'No requests found. Make a blood request!'
                    : 'No history found. Start by donating blood or making a request!';
        displayEmptyState(message);
        return;
    }

    let html = '<div class="history-timeline">';

    filtered.forEach(item => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (item.type === 'donation') {
            html += createDonationCard(item, formattedDate, formattedTime);
        } else {
            html += createRequestCard(item, formattedDate, formattedTime);
        }
    });

    html += '</div>';
    historyContainer.innerHTML = html;
}

/**
 * Create donation card HTML
 */
function createDonationCard(donation, formattedDate, formattedTime) {
    const availabilityClass = donation.availability === 'Yes' ? 'available' : 'unavailable';
    const availabilityText = donation.availability === 'Yes' ? 'Available' : 'Not Available';

    // Debug: Log contact field specifically
    console.log(`Donation ${donation.id} contact:`, donation.contact, 'Full object:', donation);

    return `
        <div class="history-card donation">
            <div class="history-card-header">
                <span class="history-type-badge donation">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2c-2.5 0-4.5 2-4.5 4.5 0 3 4.5 7.5 4.5 7.5s4.5-4.5 4.5-7.5c0-2.5-2-4.5-4.5-4.5z" transform="scale(1 -1) translate(0 -24)" />
                    </svg>
                    Donation
                </span>
                <div class="history-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${formattedDate} at ${formattedTime}
                </div>
            </div>
            
            <div class="history-card-body">
                <div class="history-detail">
                    <div class="history-detail-label">Full Name</div>
                    <div class="history-detail-value">${donation.fullName || '-'}</div>
                </div>
                <div class="history-detail">
                    <div class="history-detail-label">Blood Group</div>
                    <div class="history-detail-value blood-group">${donation.bloodGroup || '-'}</div>
                </div>
                <div class="history-detail">
                    <div class="history-detail-label">Age</div>
                    <div class="history-detail-value">${donation.age || '-'}</div>
                </div>
                <div class="history-detail">
                    <div class="history-detail-label">Gender</div>
                    <div class="history-detail-value">${donation.gender || '-'}</div>
                </div>
                <div class="history-detail">
                    <div class="history-detail-label">Contact</div>
                    <div class="history-detail-value">${donation.contact || '<span style="color: #ef4444;">Not provided</span>'}</div>
                </div>
                <div class="history-detail">
                    <div class="history-detail-label">Availability Status</div>
                    <div class="status-badge ${availabilityClass}">
                        <span class="status-indicator"></span>
                        ${availabilityText}
                    </div>
                </div>
            </div>
            
            ${donation.medicalNote ? `
                <div class="history-card-footer">
                    <div class="history-note">
                        <strong>Medical Note:</strong> ${donation.medicalNote}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Create request card HTML
 */
function createRequestCard(request, formattedDate, formattedTime) {
    const status = request.status || 'pending';
    const statusClass = status === 'completed' ? 'completed' : 'pending';
    const statusText = status === 'completed' ? 'Completed' : 'Pending';

    return `
        <div class="history-card request">
            <div class="history-card-header">
                <span class="history-type-badge request">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    Request
                </span>
                <div class="history-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${formattedDate} at ${formattedTime}
                </div>
            </div>
            
            <div class="history-card-body">
                <div class="history-detail">
                    <div class="history-detail-label">Blood Group Requested</div>
                    <div class="history-detail-value blood-group">${request.bloodGroup || '-'}</div>
                </div>
                ${request.requestedDonorName ? `
                    <div class="history-detail">
                        <div class="history-detail-label">Requested From</div>
                        <div class="history-detail-value">${request.requestedDonorName}</div>
                    </div>
                ` : ''}
                <div class="history-detail">
                    <div class="history-detail-label">Request Status</div>
                    <div class="status-badge ${statusClass}">
                        <span class="status-indicator"></span>
                        ${statusText}
                    </div>
                </div>
            </div>
            
            ${request.reason && request.reason !== '-' ? `
                <div class="history-card-footer">
                    <div class="history-note">
                        <strong>Reason:</strong> ${request.reason}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Display empty state
 */
function displayEmptyState(message) {
    historyContainer.innerHTML = `
        <div class="empty-state">
            <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            <div class="empty-state-title">No History Found</div>
            <div class="empty-state-description">${message}</div>
            <div class="empty-state-actions">
                <a href="donate.html" class="btn btn-primary">Donate Blood</a>
                <a href="request.html" class="btn btn-secondary">Request Blood</a>
            </div>
        </div>
    `;
}

/**
 * Initialize the history page
 */
function initializeHistoryPage() {
    // Initialize with logged-out state first
    initializeLoggedOutState();

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // User profile click - redirect to login if not logged in
    userProfile.addEventListener('click', () => {
        if (!isLoggedIn) {
            window.location.href = 'login.html';
        }
    });

    // Profile Modal Logic
    function openProfileModal() {
        const user = getCurrentUser();
        if (user) {
            // Update modal content
            document.getElementById('profileName').textContent = user.displayName || user.email || 'User';
            document.getElementById('profileEmail').textContent = user.email || '-';
            document.getElementById('profileDisplayName').textContent = user.displayName || '-';
            document.getElementById('profileEmailValue').textContent = user.email || '-';

            // Set avatar
            const profileAvatarLarge = document.getElementById('profileAvatarLarge');
            if (user.displayName) {
                profileAvatarLarge.innerHTML = `<span style="font-size: 32px; font-weight: 400;">${user.displayName.charAt(0).toUpperCase()}</span>`;
            } else {
                profileAvatarLarge.innerHTML = '<span style="font-size: 32px; font-weight: 400;">U</span>';
            }

            // Set member since
            if (user.metadata && user.metadata.creationTime) {
                const createdDate = new Date(user.metadata.creationTime);
                document.getElementById('profileMemberSince').textContent = createdDate.toLocaleDateString();
            } else {
                document.getElementById('profileMemberSince').textContent = '-';
            }

            profileModal.style.display = 'flex';
        }
    }

    if (userProfile) {
        userProfile.addEventListener('click', openProfileModal);
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
    }


    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-filter');
            displayHistory();
        });
    });

    // Search input
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.trim();
        displayHistory();
    });

    // Check auth state
    onAuthStateChange(async (user) => {
        await new Promise(resolve => setTimeout(resolve, 100));

        if (user) {
            isLoggedIn = true;
            const displayName = user.displayName || user.email || 'User';

            userNameSpan.textContent = displayName;
            userRole.textContent = 'User';

            if (displayName && displayName !== 'User') {
                userAvatar.innerHTML = `<span style="font-size: 16px; font-weight: 700;">${displayName.charAt(0).toUpperCase()}</span>`;
            } else {
                userAvatar.innerHTML = '<span style="font-size: 16px; font-weight: 700;">U</span>';
            }

            logoutBtn.style.display = 'block';
            userProfile.style.cursor = 'default';

            // Load history for logged-in user
            if (user.email) {
                loadUserHistory(user.email);
            }
        } else {
            initializeLoggedOutState();
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        const result = await logOut();
        if (result.success) {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminEmail');
            showSuccessToast('Logged out successfully!');
            window.location.href = 'login.html';
        }
    });

    // Top header background on scroll
    const topHeader = document.querySelector('.top-header');
    if (topHeader) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 50) {
                topHeader.classList.add('scrolled');
            } else {
                topHeader.classList.remove('scrolled');
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHistoryPage);
} else {
    initializeHistoryPage();
}
