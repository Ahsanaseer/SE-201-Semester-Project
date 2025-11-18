// Authentication Module - Firebase imports
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { auth } from './firebase-config.js';
import { showSuccessToast, showErrorToast } from './toast.js';

// Admin credentials (hardcoded)
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123@';

/**
 * Sign up a new user with name, email and password
 */
export async function signUp(email, password, name) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with display name
        if (name) {
            await updateProfile(user, {
                displayName: name
            });
        }

        return { success: true, user: user };
    } catch (error) {
        // Handle Firebase Auth errors
        let errorMessage = error.message;
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email format. Please check your email address.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak. Please use a stronger password.';
        }
        
        return { success: false, error: errorMessage };
    }
}

/**
 * Sign in user or admin
 */
export async function signIn(email, password) {
    try {
        // Check admin credentials first (client-side check, no Firebase Auth needed)
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Admin login - purely client-side, no Firebase Auth required
            return { success: true, user: { email: ADMIN_EMAIL }, isAdmin: true };
        }

        // Regular user - authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        return { success: true, user: user, isAdmin: false };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Sign out current user
 */
export async function logOut() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get current user
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Monitor auth state changes
 */
export function onAuthStateChange(callback) {
    onAuthStateChanged(auth, callback);
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
    const user = auth.currentUser;
    if (!user) return false;
    
    // Check admin status based on email from Firebase Authentication
    return user.email === ADMIN_EMAIL;
}

// Login page UI logic - only run if login.html elements exist
const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const alertContainer = document.getElementById('alertContainer');

const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');

const loginPasswordToggle = document.getElementById('loginPasswordToggle');
const loginPasswordInput = document.getElementById('loginPassword');
const signupPasswordToggle = document.getElementById('signupPasswordToggle');
const signupPasswordInput = document.getElementById('signupPassword');
const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Only initialize login page UI if elements exist (i.e., we're on login.html)
if (loginCard && signupCard && signinForm && signupForm) {
    // Switch between login and signup cards
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.remove('active');
        signupCard.classList.add('active');
        clearAlerts();
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupCard.classList.remove('active');
        loginCard.classList.add('active');
        clearAlerts();
    });

    // Password visibility toggles
    function setupPasswordToggle(toggle, input) {
        toggle.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            const eyeIcon = toggle.querySelector('.eye-icon');
            const eyeOffIcon = toggle.querySelector('.eye-off-icon');
            
            if (type === 'password') {
                eyeIcon.style.display = 'block';
                eyeOffIcon.style.display = 'none';
            } else {
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'block';
            }
        });
    }

    setupPasswordToggle(loginPasswordToggle, loginPasswordInput);
    setupPasswordToggle(signupPasswordToggle, signupPasswordInput);
    setupPasswordToggle(confirmPasswordToggle, confirmPasswordInput);

    function clearAlerts() {
        alertContainer.innerHTML = '';
    }

    // Login form submission
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Use signIn function which handles admin check internally
        const result = await signIn(email, password);

        if (result.success) {
            // Check if admin login
            if (result.isAdmin) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminEmail', email);
                
                showSuccessToast('Admin login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html?admin=true';
                }, 1000);
            } else {
                // Regular user login
                showSuccessToast('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } else {
            // Handle errors - signIn already provides formatted error messages
            let errorMessage = result.error || 'Login Failed! Please Check Your Credentials.';
            
            // Additional error message formatting for better UX
            if (result.error && result.error.includes('auth/invalid-credential')) {
                errorMessage = 'Email Not Found! Please Sign Up';
            } else if (result.error && result.error.includes('auth/user-not-found')) {
                errorMessage = 'Email Not Found! Please Sign Up';
            } else if (result.error && result.error.includes('auth/wrong-password')) {
                errorMessage = 'Incorrect Password! Please Try Again.';
            } else if (result.error && result.error.includes('auth/invalid-email')) {
                errorMessage = 'Invalid Email Format! Please Check Your Email.';
            }
            
            showErrorToast(errorMessage);
        }
    });

    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!name || name.trim() === '') {
            showErrorToast('Please enter your name!');
            return;
        }

        if (password !== confirmPassword) {
            showErrorToast('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            showErrorToast('Password must be at least 6 characters long!');
            return;
        }

        // Use signUp function which handles Firebase errors
        const result = await signUp(email, password, name);

        if (result.success) {
            showSuccessToast('Account created successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            // signUp already provides formatted error messages
            showErrorToast(result.error || 'Sign up failed. Please try again.');
        }
    });
}

