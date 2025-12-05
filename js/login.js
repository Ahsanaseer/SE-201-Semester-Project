
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
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
 * Send password reset email
 */
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        let errorMessage = error.message;
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No user found with this email address.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }
        return { success: false, error: errorMessage };
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

// Modal Elements
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModal = document.getElementById('closeModal');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const resetEmailInput = document.getElementById('resetEmail');

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
    console.log("Login page elements found, initializing...");

    // Helper functions for inline errors
    function showInputError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;

        // Add error class to input
        input.classList.add('error');

        // Check if error message already exists
        let errorMsg = input.parentNode.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            input.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
    }

    function clearInputError(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.classList.remove('error');
        const errorMsg = input.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    function clearAllErrors() {
        const inputs = document.querySelectorAll('.input');
        inputs.forEach(input => {
            input.classList.remove('error');
            const errorMsg = input.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
        alertContainer.innerHTML = '';
    }

    // Helper to toggle button loading state
    function setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    // Add input event listeners to clear errors on typing
    const allInputs = document.querySelectorAll('.input');
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            clearInputError(input.id);
        });
    });

    // Switch between login and signup cards
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.remove('active');
        signupCard.classList.add('active');
        clearAllErrors();
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupCard.classList.remove('active');
        loginCard.classList.add('active');
        clearAllErrors();
    });

    // Forgot Password Modal Logic
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink && forgotPasswordModal) {
        console.log("Forgot password link and modal found, attaching listener");
        forgotPasswordLink.addEventListener('click', (e) => {
            console.log("Forgot password clicked");
            e.preventDefault();
            forgotPasswordModal.classList.add('active');
            // Pre-fill email if available
            if (document.getElementById('loginEmail').value) {
                resetEmailInput.value = document.getElementById('loginEmail').value;
            }
            clearAllErrors();
        });

        const closeResetModal = () => {
            forgotPasswordModal.classList.remove('active');
            resetPasswordForm.reset();
            clearAllErrors();
        };

        if (closeModal) {
            closeModal.addEventListener('click', closeResetModal);
        }

        // Close on outside click
        forgotPasswordModal.addEventListener('click', (e) => {
            if (e.target === forgotPasswordModal) {
                closeResetModal();
            }
        });

        // Handle Reset Submission
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAllErrors();

            const email = resetEmailInput.value;
            if (!email) {
                showInputError('resetEmail', 'Please enter your email');
                return;
            }

            const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
            setLoadingState(submitBtn, true);

            const result = await resetPassword(email);

            setLoadingState(submitBtn, false);

            if (result.success) {
                showSuccessToast('Password reset link sent! Check your email.');
                closeResetModal();
            } else {
                if (result.error.includes('No user found')) {
                    showInputError('resetEmail', 'No account found with this email');
                } else if (result.error.includes('Invalid email')) {
                    showInputError('resetEmail', 'Invalid email format');
                } else {
                    showErrorToast(result.error || 'Failed to send reset link');
                }
            }
        });
    }

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

    // Login form submission
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = signinForm.querySelector('.sign-in-btn');

        setLoadingState(submitBtn, true);

        // Use signIn function which handles admin check internally
        const result = await signIn(email, password);

        setLoadingState(submitBtn, false);

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

                // Check for redirect URL in query parameters
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');

                setTimeout(() => {
                    window.location.href = redirectUrl || 'index.html';
                }, 1000);
            }
        } else {
            // Handle errors with inline validation
            if (result.error && result.error.includes('auth/invalid-credential')) {
                showInputError('loginEmail', 'Incorrect Email or Password');
                showInputError('loginPassword', 'Incorrect Email or Password');
            } else if (result.error && result.error.includes('auth/user-not-found')) {
                showInputError('loginEmail', 'Email Not Found! Please Sign Up');
            } else if (result.error && result.error.includes('auth/wrong-password')) {
                showInputError('loginPassword', 'Incorrect Password! Please Try Again.');
            } else if (result.error && result.error.includes('auth/invalid-email')) {
                showInputError('loginEmail', 'Invalid Email Format!');
            } else {
                showErrorToast(result.error || 'Login Failed! Please Check Your Credentials.');
            }
        }
    });

    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitBtn = signupForm.querySelector('.sign-up-btn'); // Assuming a class 'sign-up-btn' for signup button

        let hasError = false;

        // Validation
        if (!name || name.trim() === '') {
            showInputError('signupName', 'Please enter your name!');
            hasError = true;
        }

        if (password !== confirmPassword) {
            showInputError('confirmPassword', 'Passwords do not match!');
            hasError = true;
        }

        if (password.length < 6) {
            showInputError('signupPassword', 'Password must be at least 6 characters long!');
            hasError = true;
        }

        if (hasError) return;

        setLoadingState(submitBtn, true);

        // Use signUp function which handles Firebase errors
        const result = await signUp(email, password, name);

        setLoadingState(submitBtn, false);

        if (result.success) {
            showSuccessToast('Account created successfully! Redirecting...');

            // Check for redirect URL in query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');

            setTimeout(() => {
                window.location.href = redirectUrl || 'index.html';
            }, 2000);
        } else {
            // Handle Firebase errors inline
            if (result.error && result.error.includes('already registered')) {
                showInputError('signupEmail', 'This email is already registered.');
            } else if (result.error && result.error.includes('Invalid email')) {
                showInputError('signupEmail', 'Invalid email format.');
            } else if (result.error && result.error.includes('Password is too weak')) {
                showInputError('signupPassword', 'Password is too weak.');
            } else {
                showErrorToast(result.error || 'Sign up failed. Please try again.');
            }
        }
    });
}

