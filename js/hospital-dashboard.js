/**
 * Hospital Dashboard JavaScript
 * Handles blood inventory display and donor requests for hospitals
 */

import { initializeDashboardComponents } from './components.js';
import { getCurrentUser, logOut, onAuthStateChange } from './login.js';
import { getAllDonors, getFilteredDonors } from './donor.js';
import { createBloodRequest } from './request.js';
import { showSuccessToast, showErrorToast } from './toast.js';

// Initialize dashboard components
initializeDashboardComponents({
    activePage: 'hospital-dashboard',
    headerTitle: 'Hospital Dashboard',
    searchPlaceholder: 'Search blood groups...'
});

// DOM Elements
const userNameSpan = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const userAvatar = document.getElementById('userAvatar');
const userProfile = document.getElementById('userProfile');
const closeProfileModal = document.getElementById('closeProfileModal');
const logoutBtn = document.getElementById('logoutBtn');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const searchBtn = document.getElementById('searchBtn');
const donorsContainer = document.getElementById('donorsContainer');
const inventoryContainer = document.getElementById('inventoryContainer');
const searchInput = document.getElementById('searchInput');

// State
let isLoggedIn = false;
let allDonorsData = [];
let currentFilter = 'all';

/**
 * Initialize UI to logged-out state
 */
// Check auth state
onAuthStateChange((user) => {
    if (!user) {
        window.location.href = `${window.getPath('login')}?redirect=${window.getPath('donate')}`;
    } else {
        // Update Sidebar UI
        const displayName = user.displayName || user.email || 'User';
        if (userNameSpan) userNameSpan.textContent = displayName;
        if (userRole) userRole.textContent = 'User';

        if (userAvatar) {
            if (displayName && displayName !== 'User') {
                userAvatar.innerHTML = `<span style="font-size: 16px; font-weight: 700;">${displayName.charAt(0).toUpperCase()}</span>`;
            } else {
                userAvatar.innerHTML = '<span style="font-size: 16px; font-weight: 700;">U</span>';
            }
        }

        if (userProfile) userProfile.style.cursor = 'pointer';
    }
});

/**
 * Load blood inventory from database
 */
async function loadBloodInventory() {
    try {
        const result = await getAllDonors();
        if (result.success) {
            allDonorsData = result.donors;
            displayBloodInventory(result.donors);
        } else {
            inventoryContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Failed to load inventory</div>';
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
        inventoryContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Error loading inventory</div>';
    }
}

/**
 * Display blood inventory cards
 * @param {Array} donors - Array of donor objects
 */
function displayBloodInventory(donors) {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const inventory = {};

    // Count available donors for each blood group
    bloodGroups.forEach(group => {
        inventory[group] = {
            total: donors.filter(d => d.bloodGroup === group).length,
            available: donors.filter(d => d.bloodGroup === group && d.availability === 'Yes').length
        };
    });

    let html = '';
    bloodGroups.forEach(group => {
        const data = inventory[group];
        const percentage = data.total > 0 ? (data.available / data.total * 100).toFixed(0) : 0;
        const isLow = data.available < 3;
        const statusColor = data.available === 0 ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';

        // Filter logic
        let shouldShow = true;
        if (currentFilter === 'available' && data.available === 0) shouldShow = false;
        if (currentFilter === 'low' && data.available >= 3) shouldShow = false;

        if (shouldShow) {
            html += `
                <div class="stat-card" style="cursor: pointer; transition: all 0.3s ease;" data-blood-group="${group}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div class="stat-label">${group}</div>
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></div>
                    </div>
                    <div class="stat-value">${data.available}</div>
                    <div class="stat-change">Available donors</div>
                    <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
                        Total: ${data.total} | ${percentage}% available
                    </div>
                    <div style="margin-top: 8px; height: 4px; background: var(--bg-secondary); border-radius: 2px; overflow: hidden;">
                        <div style="height: 100%; background: ${statusColor}; width: ${percentage}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
        }
    });

    if (html === '') {
        inventoryContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">No blood groups match the current filter</div>';
    } else {
        inventoryContainer.innerHTML = html;

        // Add click handlers to blood group cards
        const cards = inventoryContainer.querySelectorAll('.stat-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const bloodGroup = card.getAttribute('data-blood-group');
                document.getElementById('bloodGroupFilter').value = bloodGroup;
                document.getElementById('bloodGroupLabel').textContent = bloodGroup;
                document.getElementById('availabilityFilter').value = 'Yes';
                document.getElementById('availabilityLabel').textContent = 'Available Only';
                searchBtn.click();
                // Scroll to donors section
                document.getElementById('donorsContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }
}

/**
 * Display donors in table format
 * @param {Array} donors - Array of donor objects
 */
function displayDonors(donors) {
    if (donors.length === 0) {
        donorsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; margin: 0 auto 16px; display: block;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>No donors found matching your criteria.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div style="overflow-x: auto; margin-top: 20px;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Blood Group</th>
                        <th>Contact</th>
                        <th>Availability</th>
                        <th>Medical Note</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
    `;

    donors.forEach(donor => {
        const availabilityColor = donor.availability === 'Yes' ? '#10b981' : '#ef4444';
        html += `
            <tr>
                <td>${donor.fullName}</td>
                <td>${donor.age}</td>
                <td>${donor.gender}</td>
                <td><strong>${donor.bloodGroup}</strong></td>
                <td>${donor.contact}</td>
                <td><span style="color: ${availabilityColor}; font-weight: 500;">${donor.availability}</span></td>
                <td>${donor.medicalNote || '-'}</td>
                <td>
                    ${donor.availability === 'Yes' ?
                `<button class="action-btn request-blood-btn" data-blood-group="${donor.bloodGroup}" data-donor-id="${donor.id}" data-donor-name="${donor.fullName}">Request Blood</button>`
                : '<span style="color: var(--text-secondary);">-</span>'
            }
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    donorsContainer.innerHTML = html;

    // Add event listeners to request blood buttons
    const requestButtons = donorsContainer.querySelectorAll('.request-blood-btn');
    requestButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const bloodGroup = button.getAttribute('data-blood-group');
            const donorId = button.getAttribute('data-donor-id');
            const donorName = button.getAttribute('data-donor-name');
            const user = getCurrentUser();

            if (!user || !user.email) {
                showErrorToast('Please log in to request blood.');
                return;
            }

            // Disable button to prevent multiple clicks
            button.disabled = true;
            button.textContent = 'Requesting...';

            // Get user's display name (full name) from Firebase Auth
            const fullName = user.displayName || user.email;
            const result = await createBloodRequest(user.email, bloodGroup, fullName, donorId, donorName);

            if (result.success) {
                showSuccessToast(`Blood request for ${bloodGroup} from ${donorName} submitted successfully!`);
                button.textContent = 'Requested';
                button.disabled = true;
                button.style.opacity = '0.6';
            } else {
                showErrorToast('Failed to submit request. Please try again.');
                button.disabled = false;
                button.textContent = 'Request Blood';
            }
        });
    });
}

/**
 * Handle search button click
 */
async function handleSearch() {
    const bloodGroup = document.getElementById('bloodGroupFilter').value;
    const availability = document.getElementById('availabilityFilter').value || 'Yes';

    donorsContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="spinner"></div></div>';

    if (!bloodGroup) {
        // Get all available donors
        const result = await getAllDonors();
        if (result.success) {
            const filtered = availability ?
                result.donors.filter(d => d.availability === availability) :
                result.donors;
            displayDonors(filtered);
        } else {
            showErrorToast('Failed to fetch donors. Please try again.');
            donorsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Failed to load donors</div>';
        }
    } else {
        // Get filtered donors
        const result = await getFilteredDonors(bloodGroup, availability);
        if (result.success) {
            displayDonors(result.donors);
        } else {
            showErrorToast('Failed to fetch donors. Please try again.');
            donorsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Failed to load donors</div>';
        }
    }
}

/**
 * Initialize the hospital dashboard
 */
function initializeHospitalDashboard() {




    // User profile click - redirect to login if not logged in
    userProfile.addEventListener('click', () => {
        if (!isLoggedIn) {
            window.location.href = window.getPath('login');
        }
    });



    // Filter tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-filter');
            displayBloodInventory(allDonorsData);
        });
    });

    // Custom Dropdown Logic
    const submenuLinks = document.querySelectorAll('.submenu-link');
    submenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const value = link.getAttribute('data-value');
            const type = link.getAttribute('data-type');
            const text = link.textContent.trim();

            if (type === 'blood') {
                document.getElementById('bloodGroupFilter').value = value;
                document.getElementById('bloodGroupLabel').textContent = text;
            } else if (type === 'availability') {
                document.getElementById('availabilityFilter').value = value;
                document.getElementById('availabilityLabel').textContent = text;
            }
        });
    });

    // Search functionality for inventory
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm === '') {
            displayBloodInventory(allDonorsData);
        } else {
            const filtered = allDonorsData.filter(d =>
                d.bloodGroup.toLowerCase().includes(searchTerm)
            );
            displayBloodInventory(filtered);
        }
    });

    // Search button click handler
    searchBtn.addEventListener('click', handleSearch);

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
                userAvatar.innerHTML = '<span style="font-size: 16px; font-weight: 700;">H</span>';
            }

            logoutBtn.style.display = 'block';
            userProfile.style.cursor = 'default';

            // Load inventory
            loadBloodInventory();
        }
    });




    // Logout
    logoutBtn.addEventListener('click', async () => {
        const result = await logOut();
        if (result.success) {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminEmail');
            showSuccessToast('Logged out successfully!');
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
    document.addEventListener('DOMContentLoaded', initializeHospitalDashboard);
} else {
    initializeHospitalDashboard();
}
