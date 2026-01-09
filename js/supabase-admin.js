// ADMIN Supabase Client Configuration
// NOTE: This uses the SAME Supabase project as the Client Side to ensure data connection.
// In a real production environment, you might use a stricter Role or separate keys.

const SUPABASE_URL = 'https://msgsyauarenjcxajjnmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZ3N5YXVhcmVuamN4YWpqbm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjI0NTEsImV4cCI6MjA4MzI5ODQ1MX0.a_v7FEXYnlI2MkRbX3hwrK6q8v-CCma25CGRUgdm-6o';

// Initialize Supabase Client
function initAdminSupabase() {
    if (typeof supabase !== 'undefined') {
        // Create client with explicit options
        window.supabaseAdmin = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            }
        });
        console.log('Admin Supabase Client Initialized with URL:', SUPABASE_URL);
        checkAdminAuth();
    } else {
        console.error('Supabase library not loaded');
    }
}

// Check Admin Authentication
// Check Admin Authentication (LIVE MODE)
async function checkAdminAuth() {
    console.log('Verifying Admin Access...');

    // --- DEVELOPER BYPASS CHECK ---
    if (localStorage.getItem('sri_pickle_dev_bypass') === 'true') {
        console.warn('⚡ DEV MODE ACTIVE');
        const app = document.getElementById('app-container');
        const login = document.getElementById('login-container');
        if (login) login.classList.add('hidden');
        if (app) app.classList.remove('hidden');
        if (window.loadDashboardData) window.loadDashboardData();
        return;
    }
    // -----------------------------

    // Check for Session
    const { data: { session } } = await window.supabaseAdmin.auth.getSession();

    if (!session) {
        console.warn('No active session. Redirecting to Login.');
        // Allow public access ONLY if we are on the login page itself (handled by page logic usually, but here we redirect APP pages)
        // Since this script runs on index.html (Dashboard), we redirect OUT.
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return;
    }

    try {
        // Strict Role Check against Database
        const { data: profile, error } = await window.supabaseAdmin
            .from('admin_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error || !profile || !profile.is_active) {
            throw new Error('Access Revoked or Invalid Admin Profile.');
        }

        console.log('Admin Verified:', profile.email);

        // --- UI Setup for Logged In Admin ---
        const loginContainer = document.getElementById('login-container');
        const appContainer = document.getElementById('app-container');
        const adminName = document.getElementById('admin-name');
        const adminRole = document.getElementById('admin-role-badge'); // If exists

        if (loginContainer) loginContainer.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');

        // Set Info
        if (adminName) adminName.textContent = profile.full_name || session.user.email;

        // Set Avatar
        const avatarContainer = document.getElementById('admin-header-avatar');
        if (avatarContainer) {
            if (profile.avatar_url) {
                avatarContainer.innerHTML = `<img src="${profile.avatar_url}" class="w-full h-full object-cover">`;
            } else {
                // Initials fallback
                const initials = (profile.full_name || 'AD').substring(0, 2).toUpperCase();
                avatarContainer.innerHTML = `<span class="text-xs font-bold text-gray-600">${initials}</span>`;
            }
        }

        // Trigger Data Load
        if (window.loadDashboardData) window.loadDashboardData();

    } catch (err) {
        console.error('Auth check failed:', err);
        await window.supabaseAdmin.auth.signOut();
        window.location.href = 'login.html?error=unauthorized';
    }
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', initAdminSupabase);
