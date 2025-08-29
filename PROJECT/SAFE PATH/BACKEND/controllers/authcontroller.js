
        // --- State Management ---
        let currentUser = null;
        let currentScreen = 'welcome';
        
        // --- UI Element References ---
        const screens = { welcome: document.getElementById('welcome-screen'), signup: document.getElementById('signup-screen'), login: document.getElementById('login-screen'), home: document.getElementById('home-screen'), aadhaar: document.getElementById('aadhaar-screen') };
        const showLoginBtn = document.getElementById('show-login-btn');
        const showSignupBtn = document.getElementById('show-signup-btn');
        const signupForm = document.getElementById('signup-form');
        const signupDetailsGroup = document.getElementById('signup-details-group');
        const signupNameInput = document.getElementById('signup-name');
        const signupDobInput = document.getElementById('signup-dob');
        const signupMobileInput = document.getElementById('signup-mobile');
        const signupOtpGroup = document.getElementById('signup-otp-group');
        const signupOtpInput = document.getElementById('signup-otp');
        const signupSubmitBtn = document.getElementById('signup-submit-btn');
        const signupMessage = document.getElementById('signup-message');
        const loginForm = document.getElementById('login-form');
        const loginMobileGroup = document.getElementById('login-mobile-group');
        const loginMobileInput = document.getElementById('login-mobile');
        const loginOtpGroup = document.getElementById('login-otp-group');
        const loginOtpInput = document.getElementById('login-otp');
        const loginSubmitBtn = document.getElementById('login-submit-btn');
        const loginMessage = document.getElementById('login-message');
        const welcomeMessage = document.getElementById('welcome-message');
        const verificationStatus = document.getElementById('verification-status');
        const verifyAadhaarBtn = document.getElementById('verify-aadhaar-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const aadhaarForm = document.getElementById('aadhaar-form');
        const aadhaarDetailsGroup = document.getElementById('aadhaar-details-group');
        const aadhaarNumberInput = document.getElementById('aadhaar-number');
        const aadhaarOtpGroup = document.getElementById('aadhaar-otp-group');
        const aadhaarOtpInput = document.getElementById('aadhaar-otp');
        const aadhaarSubmitBtn = document.getElementById('aadhaar-submit-btn');
        const aadhaarMessage = document.getElementById('aadhaar-message');
        const backToHomeBtn = document.getElementById('back-to-home-btn');
        const backBtns = document.querySelectorAll('.back-btn');

        // --- UI Control Functions ---
        function showScreen(screenName) {
            currentScreen = screenName;
            Object.values(screens).forEach(screen => screen.classList.add('hidden'));
            screens[screenName].classList.remove('hidden');
        }
        function showMessage(element, text, type) {
            element.textContent = text;
            element.className = 'message ' + type;
        }

        // --- Event Listeners for Navigation ---
        showLoginBtn.addEventListener('click', () => showScreen('login'));
        showSignupBtn.addEventListener('click', () => showScreen('signup'));
        backBtns.forEach(btn => btn.addEventListener('click', () => {
            // Reset forms when going back to the welcome screen
            resetSignupForm();
            resetLoginForm();
            showScreen('welcome');
        }));
        verifyAadhaarBtn.addEventListener('click', () => showScreen('aadhaar'));
        backToHomeBtn.addEventListener('click', () => showScreen('home'));

        // --- Form Handlers ---
        
        // SIGNUP FORM
        let isSignupOtpSent = false;
        signupForm.addEventListener('submit', async e => {
            e.preventDefault();
            signupSubmitBtn.disabled = true;
            showMessage(signupMessage, '', '');

            if (!isSignupOtpSent) {
                signupSubmitBtn.textContent = 'Sending OTP...';
                try {
                    const response = await fetch('http://localhost:3001/signup/request-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mobileNumber: signupMobileInput.value })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    
                    isSignupOtpSent = true;
                    signupDetailsGroup.classList.add('hidden');
                    signupOtpGroup.classList.remove('hidden');
                    signupSubmitBtn.textContent = 'Create Account';
                    showMessage(signupMessage, 'OTP Sent!', 'success');
                    // ** FIX: Manage required attributes **
                    signupNameInput.required = false;
                    signupDobInput.required = false;
                    signupMobileInput.required = false;
                    signupOtpInput.required = true;

                } catch (error) {
                    showMessage(signupMessage, error.message, 'error');
                }
            } else {
                signupSubmitBtn.textContent = 'Creating Account...';
                try {
                    const response = await fetch('http://localhost:3001/signup/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: signupNameInput.value, dob: signupDobInput.value, mobileNumber: signupMobileInput.value, otp: signupOtpInput.value })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    
                    showMessage(signupMessage, 'Account created! Please log in.', 'success');
                    setTimeout(() => {
                        resetSignupForm();
                        showScreen('login');
                    }, 2000);
                } catch (error) {
                    showMessage(signupMessage, error.message, 'error');
                }
            }
            signupSubmitBtn.disabled = false;
        });

        // LOGIN FORM
        let isLoginOtpSent = false;
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            loginSubmitBtn.disabled = true;
            showMessage(loginMessage, '', '');

            if (!isLoginOtpSent) {
                loginSubmitBtn.textContent = 'Sending OTP...';
                try {
                    const response = await fetch('http://localhost:3001/login/request-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mobileNumber: loginMobileInput.value })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    
                    isLoginOtpSent = true;
                    loginMobileGroup.classList.add('hidden');
                    loginOtpGroup.classList.remove('hidden');
                    loginSubmitBtn.textContent = 'Login';
                    showMessage(loginMessage, 'OTP Sent!', 'success');
                    // ** FIX: Manage required attributes **
                    loginMobileInput.required = false;
                    loginOtpInput.required = true;

                } catch (error) {
                    showMessage(loginMessage, error.message, 'error');
                }
            } else {
                loginSubmitBtn.textContent = 'Logging In...';
                try {
                    const response = await fetch('http://localhost:3001/login/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mobileNumber: loginMobileInput.value, otp: loginOtpInput.value })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    
                    currentUser = data.user;
                    updateHomeScreen();
                    showScreen('home');
                    resetLoginForm();
                } catch (error) {
                    showMessage(loginMessage, error.message, 'error');
                }
            }
            loginSubmitBtn.disabled = false;
        });

        // AADHAAR FORM
        let isAadhaarOtpSent = false;
        aadhaarForm.addEventListener('submit', async e => {
            e.preventDefault();
            aadhaarSubmitBtn.disabled = true;
            showMessage(aadhaarMessage, '', '');

            if (!isAadhaarOtpSent) {
                aadhaarSubmitBtn.textContent = 'Requesting OTP...';
                try {
                    const response = await fetch('http://localhost:3001/aadhaar/request-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ aadhaarNumber: aadhaarNumberInput.value })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);

                    isAadhaarOtpSent = true;
                    aadhaarDetailsGroup.classList.add('hidden');
                    aadhaarOtpGroup.classList.remove('hidden');
                    aadhaarSubmitBtn.textContent = 'Verify Aadhaar';
                    showMessage(aadhaarMessage, data.message, 'info');
                    // ** FIX: Manage required attributes **
                    aadhaarNumberInput.required = false;
                    aadhaarOtpInput.required = true;

                } catch (error) {
                    showMessage(aadhaarMessage, error.message, 'error');
                }
            } else {
                aadhaarSubmitBtn.textContent = 'Verifying...';
                try {
                    const response = await fetch('http://localhost:3001/aadhaar/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ aadhaarNumber: aadhaarNumberInput.value, otp: aadhaarOtpInput.value, loggedInUserMobile: currentUser.mobileNumber })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);

                    currentUser = data.user;
                    updateHomeScreen();
                    showScreen('home');
                    resetAadhaarForm();
                } catch (error) {
                    showMessage(aadhaarMessage, error.message, 'error');
                }
            }
            aadhaarSubmitBtn.disabled = false;
        });

        // LOGOUT
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            showScreen('welcome');
        });

        // --- Helper functions for updating UI and resetting forms ---
        function updateHomeScreen() {
            if (!currentUser) return;
            welcomeMessage.textContent = Hi, ${currentUser.name};
            if (currentUser.isAadhaarVerified) {
                verificationStatus.textContent = 'Aadhaar Verified';
                verificationStatus.className = 'message success';
                verifyAadhaarBtn.classList.add('hidden');
            } else {
                verificationStatus.textContent = 'Aadhaar Not Verified';
                verificationStatus.className = 'message error';
                verifyAadhaarBtn.classList.remove('hidden');
            }
        }

        function resetLoginForm() {
            isLoginOtpSent = false;
            loginForm.reset();
            loginMobileGroup.classList.remove('hidden');
            loginOtpGroup.classList.add('hidden');
            loginSubmitBtn.textContent = 'Send OTP';
            showMessage(loginMessage, '', '');
            // ** FIX: Reset required attributes **
            loginMobileInput.required = true;
            loginOtpInput.required = false;
        }

        function resetSignupForm() {
            isSignupOtpSent = false;
            signupForm.reset();
            signupDetailsGroup.classList.remove('hidden');
            signupOtpGroup.classList.add('hidden');
            signupSubmitBtn.textContent = 'Send OTP';
            showMessage(signupMessage, '', '');
            // ** FIX: Reset required attributes **
            signupNameInput.required = true;
            signupDobInput.required = true;
            signupMobileInput.required = true;
            signupOtpInput.required = false;
        }

        function resetAadhaarForm() {
            isAadhaarOtpSent = false;
            aadhaarForm.reset();
            aadhaarDetailsGroup.classList.remove('hidden');
            aadhaarOtpGroup.classList.add('hidden');
            aadhaarSubmitBtn.textContent = 'Get OTP';
            showMessage(aadhaarMessage, '', '');
            // ** FIX: Reset required attributes **
            aadhaarNumberInput.required = true;
            aadhaarOtpInput.required = false;
        }

        // --- Initial State ---
        showScreen('welcome');
        // ** FIX: Set initial required states **
        resetLoginForm();
        resetSignupForm();
        resetAadhaarForm();
