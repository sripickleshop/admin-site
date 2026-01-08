// Core Admin Dashboard Logic

// --- Tab Switching ---
window.switchTab = function (tabName) {
    // 1. Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));

    // 2. Show selected view
    document.getElementById(`view-${tabName}`).classList.remove('hidden');

    // 3. Update Nav State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${tabName}`).classList.add('active');

    // 4. Update Header Title
    const titles = {
        'dashboard': 'Overview',
        'orders': 'Order Management',
        'products': 'Product Inventory',
        'customers': 'Customer Insights',
        'analytics': 'Advanced Analytics'
    };
    document.getElementById('page-title').innerText = titles[tabName] || 'Dashboard';

    // Module Initialization triggers
    if (tabName === 'orders' && window.OrdersModule) {
        window.OrdersModule.init();
    }
    if (tabName === 'products' && window.ProductsModule) {
        window.ProductsModule.init();
    }
    if (tabName === 'customers' && window.CustomersModule) {
        window.CustomersModule.init();
    }
    if (tabName === 'profile' && window.ProfileModule) {
        window.ProfileModule.init();
    }
}

// --- Login Handler ---
document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('login-error');

    errorEl.classList.add('hidden');

    try {
        const { data, error } = await window.supabaseAdmin.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        // Success handled by auto-state check in supabase-admin.js
        console.log('Login successful');

    } catch (err) {
        console.error('Login error:', err);
        errorEl.textContent = "Invalid credentials or connection error.";
        errorEl.classList.remove('hidden');
    }
});

// --- Logout Handler ---
window.handleLogout = async function () {
    await window.supabaseAdmin.auth.signOut();
    window.location.reload();
}

// --- Data Loading (Placeholder for now) ---
window.loadDashboardData = function () {
    console.log('Loading dashboard data...');

    // Real Data Load trigger
    if (window.OrdersModule) {
        window.OrdersModule.init(); // Fetch orders and update Stats
    }

    if (window.ProductsModule) {
        window.ProductsModule.init(); // Fetch products and update Low Stock
    }

    // Simulate other widgets for now
    setTimeout(() => {
        document.getElementById('dash-users-count').innerText = '128';
        // document.getElementById('dash-low-stock').innerText = '3'; // Now handled by ProductsModule
        document.getElementById('pending-count-badge').classList.remove('hidden');

        loadCharts(); // Initialize Chart.js
    }, 800);
}

// --- Charts Initialization ---
function loadCharts() {
    // Revenue Chart
    const ctxRev = document.getElementById('revenueChart')?.getContext('2d');
    if (ctxRev) {
        new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [4500, 6200, 3100, 8900],
                    borderColor: '#D32F2F', // spice-red
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } }
            }
        });
    }

    // Products Pie Chart
    const ctxProd = document.getElementById('productsChart')?.getContext('2d');
    if (ctxProd) {
        new Chart(ctxProd, {
            type: 'doughnut',
            data: {
                labels: ['Mango Pickle', 'Chicken Pickle', 'Garlic Pickle'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: ['#FBC02D', '#D32F2F', '#388E3C'], // Colors matching theme
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }, // Simple legend
                cutout: '70%'
            }
        });
    }
}

// Check initial state
document.addEventListener('DOMContentLoaded', () => {
    // Default to Dashboard tab
    switchTab('dashboard');
});
