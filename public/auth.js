// public/auth.js

// --- Configuration ---
const msalConfig = {
  auth: {
    clientId: '<CLIENT_ID>', // Paste your Client ID here
    authority: 'https://login.microsoftonline.com/<TENANT_ID>', // Paste your Tenant ID here
    redirectUri: '/', // Must match the one in Entra ID app registration
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use session storage for better security
    storeAuthStateInCookie: false,
  },
};

// --- MSAL Instance ---
const msalInstance = new msal.PublicClientApplication(msalConfig);

// --- UI Helper Functions ---
const authenticatedDiv = document.getElementById('authenticated');
const unauthenticatedDiv = document.getElementById('unauthenticated');
const userInfoP = document.getElementById('userInfo');
const signOutButton = document.getElementById('signOutButton');

function updateUI(account) {
  if (account) {
    // User is signed in
    authenticatedDiv.classList.remove('hidden');
    unauthenticatedDiv.classList.add('hidden');
    userInfoP.innerText = `Welcome, ${account.name} (${account.username})`;
  } else {
    // User is not signed in
    authenticatedDiv.classList.add('hidden');
    unauthenticatedDiv.classList.remove('hidden');
  }
}

// --- Authentication Functions ---
async function signIn() {
  // Define scopes required for the application
  const loginRequest = {
    scopes: ['User.Read'],
  };

  // **Fetch domain_hint from URL query parameter**
  const urlParams = new URLSearchParams(window.location.search);
  const domainHint = urlParams.get('domain_hint');

  if (domainHint) {
    loginRequest.domainHint = domainHint;
    console.log(`Using domain_hint: ${domainHint}`);
  }

  try {
    // Use loginRedirect to start the authentication flow
    await msalInstance.loginRedirect(loginRequest);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

function signOut() {
  const logoutRequest = {
    account: msalInstance.getActiveAccount(),
    postLogoutRedirectUri: 'http://localhost:3000',
  };
  msalInstance.logoutRedirect(logoutRequest);
}

// --- Page Load Logic ---
async function initialize() {
  try {
    // Handle the redirect promise from Entra ID
    const response = await msalInstance.handleRedirectPromise();
    const urlParams = new URLSearchParams(window.location.search);
    const relayState = urlParams.get('RelayState') || '';    
    if (response) {
      // Authentication successful, set active account
      msalInstance.setActiveAccount(response.account);
      updateUI(response.account);
    } else {
      // No redirect response, check for existing accounts
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        // 
        if(relayState != '') {
            // value should be tested against whitelisted URL !
            // for the purpose of the demo, no check
            window.location.replace(relayState);
        }
        msalInstance.setActiveAccount(accounts[0]);
        updateUI(accounts[0]);
      } else {
        // **If no user is authenticated, trigger the sign-in process**
        console.log('No authenticated user found. Triggering sign-in...');
        signIn();
      }
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    // If there's an error, try to sign in again as a fallback
    signIn();
  }
}

// --- Event Listeners ---
signOutButton.addEventListener('click', signOut);

// --- Start the application ---
initialize();