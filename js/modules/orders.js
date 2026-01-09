// Orders Module for Admin Dashboard

const OrdersModule = {
    async init() {
        console.log('Initializing Orders Module (Template Mode)...');
        this.renderTableSkeleton();
        // this.fetchOrders(); // Backend Disabled for Template Design
        this.loadMockOrders(); // Load Dummy Data
    },

    renderTableSkeleton() {
        const container = document.getElementById('view-orders');
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 class="text-lg font-bold text-gray-800">All Orders</h3>
                    <div class="flex gap-2">
                         <div class="relative">
                            <input type="text" id="order-search" placeholder="Search Order ID..." 
                                class="pl-8 pr-3 py-2 border border-blue-200 rounded text-sm focus:outline-none focus:border-spice-red">
                            <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"></i>
                        </div>
                        <select id="status-filter" class="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:border-spice-red">
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processed">Processed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button onclick="OrdersModule.fetchOrders()" class="p-2 text-gray-600 hover:text-spice-red hover:bg-red-50 rounded transition-colors" title="Refresh">
                            <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th class="px-6 py-3">Order ID</th>
                                <th class="px-6 py-3">Date</th>
                                <th class="px-6 py-3">Customer</th>
                                <th class="px-6 py-3">Items</th>
                                <th class="px-6 py-3">Total</th>
                                <th class="px-6 py-3">Status</th>
                                <th class="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="orders-table-body" class="divide-y divide-gray-100">
                             <!-- Rows injected here -->
                             <tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Loading orders...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div id="pagination-controls" class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 text-sm text-gray-600 hidden">
                    <!-- Pagination if needed -->
                </div>
            </div>
        `;
        lucide.createIcons();

        // Bind Filter Events
        document.getElementById('status-filter').addEventListener('change', (e) => this.filterOrders(e.target.value));
        document.getElementById('order-search').addEventListener('keyup', (e) => this.searchOrders(e.target.value));
    },

    loadMockOrders() {
        // Mock Data for "Perfect Order Management System" Visualization
        this.orders = [
            {
                id: '550e8400-e29b-41d4-a716-446655440000',
                order_number: 'ORD-1767891234',
                created_at: new Date().toISOString(),
                status: 'pending',
                total_amount: 1250.00,
                payment_method: 'UPI Gateway',
                payment_status: 'completed',
                payment_id: 'PG_123456789',
                user_id: 'user_001',
                shipping_address: JSON.stringify({
                    name: "Rahul Sharma",
                    phone: "+91 9876543210",
                    address: "Flat 402, Sunshine Apts, Jubilee Hills",
                    city: "Hyderabad",
                    state: "Telangana",
                    pincode: "500033"
                }),
                items: [
                    { name: 'Mango Pickle', variant_label: '500g', quantity: 2, price: 350 },
                    { name: 'Garlic Pickle', variant_label: '250g', quantity: 1, price: 200 }
                ]
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                order_number: '#ACH-2024-8892',
                created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                status: 'pending_payment',
                total_amount: 850.00,
                payment_method: 'Pay When Confirming Order',
                payment_status: 'pending',
                user_id: 'user_002',
                shipping_address: JSON.stringify({
                    name: "Priya Singh",
                    phone: "+91 88888 77777",
                    address: "12-4-56/A, MG Road",
                    city: "Bangalore",
                    state: "Karnataka",
                    pincode: "560001"
                }),
                items: [
                    { name: 'Tomato Pickle', variant_label: '500g', quantity: 2, price: 300 }
                ]
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440002',
                order_number: 'ORD-1767885000',
                created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                status: 'processed',
                total_amount: 2400.00,
                payment_method: 'UPI Gateway',
                payment_status: 'completed',
                user_id: 'user_003',
                shipping_address: JSON.stringify({
                    name: "Amit Patel",
                    phone: "+91 99999 55555",
                    address: "Sector 14, Plot 45",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400050"
                }),
                items: [
                    { name: 'Mixed Veg Pickle', variant_label: '1kg', quantity: 1, price: 600 },
                    { name: 'Red Chilli Pickle', variant_label: '500g', quantity: 3, price: 400 }
                ]
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440003',
                order_number: 'ORD-1767800000',
                created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                status: 'delivered',
                total_amount: 450.00,
                payment_method: 'UPI Gateway',
                payment_status: 'completed',
                user_id: 'user_004',
                shipping_address: JSON.stringify({
                    name: "Sneha Reddy",
                    phone: "+91 99887 77665",
                    address: "Hitech City, Mindspace",
                    city: "Hyderabad",
                    state: "Telangana",
                    pincode: "500081"
                }),
                items: [
                    { name: 'Gongura Pickle', variant_label: '250g', quantity: 2, price: 200 }
                ]
            }
        ];

        this.renderOrders(this.orders);
        this.updateDashboardStats(this.orders);
    },

    async fetchOrders() {
        // Disabled for Template Mode
        console.log('Backend sync disabled.');
    },

    renderOrders(ordersData) {
        // Updated Render Logic for "Perfect System"
        const tbody = document.getElementById('orders-table-body');
        if (!ordersData.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">No orders found.</td></tr>`;
            return;
        }

        tbody.innerHTML = ordersData.map(order => {
            const date = new Date(order.created_at).toLocaleDateString() + ' ' + new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            let customerName = "Guest";
            let addr = order.shipping_address;
            if (typeof addr === 'string') {
                try { addr = JSON.parse(addr); } catch (e) { addr = {}; }
            }
            if (addr && addr.name) customerName = addr.name;

            let itemsCount = 0;
            if (Array.isArray(order.items)) itemsCount = order.items.length;

            const isPayLater = order.payment_method === 'Pay When Confirming Order';
            const statusClass = `status-${order.status || 'pending'}`;

            // Visual Indicators
            let paymentBadge = '';
            if (order.payment_status === 'completed') paymentBadge = '<span class="text-[10px] bg-green-100 text-green-700 px-1 py-0.5 rounded ml-1">PAID</span>';
            else if (isPayLater) paymentBadge = '<span class="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded ml-1">PAY LATER</span>';
            else paymentBadge = '<span class="text-[10px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded ml-1">PAY PENDING</span>';

            return `
                <tr class="hover:bg-gray-50 transition-colors group border-b border-gray-100">
                    <td class="px-6 py-4 font-medium text-gray-800">
                        ${order.order_number || order.id.slice(0, 8)}
                    </td>
                    <td class="px-6 py-4 text-gray-500 text-xs">${date}</td>
                    <td class="px-6 py-4">
                        <div class="font-medium text-gray-800 text-sm">${customerName}</div>
                        <div class="text-xs text-gray-500">${addr.city || ''}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-sm text-gray-700">${itemsCount} Item(s)</span>
                    </td>
                    <td class="px-6 py-4 font-bold text-gray-800">
                        ₹${parseFloat(order.total_amount).toFixed(2)}
                        <div class="mt-1">${paymentBadge}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="status-badge ${statusClass} uppercase text-[10px] tracking-wider">
                            ${(order.status || 'Pending')}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="OrdersModule.viewOrderDetails('${order.id}')" class="bg-white border border-gray-200 text-gray-600 hover:text-spice-red hover:border-spice-red px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow">
                            Manage
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        lucide.createIcons();
    },

    // ... filter/search methods unchanged ...

    updateDashboardStats(orders) {
        // Mock Stats Logic (same as before)
        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
        const activeCount = orders.filter(o => o.status === 'pending' || o.status === 'processed' || o.status === 'pending_payment').length;

        const revEl = document.getElementById('dash-revenue');
        if (revEl) revEl.innerText = `₹${totalRevenue.toLocaleString('en-IN')}`;

        const actEl = document.getElementById('dash-orders-count');
        if (actEl) actEl.innerText = activeCount;

        const recentBody = document.getElementById('recent-orders-body');
        if (recentBody) {
            const recent5 = orders.slice(0, 5);
            recentBody.innerHTML = recent5.map(o => {
                let addr = o.shipping_address;
                if (typeof addr === 'string') try { addr = JSON.parse(addr); } catch (e) { }
                return `
                <tr>
                    <td class="px-6 py-4 text-gray-700 font-medium">${o.order_number || o.id}</td>
                    <td class="px-6 py-4 text-gray-600">
                        ${addr ? addr.name : 'Guest'}
                    </td>
                    <td class="px-6 py-4"><span class="status-badge status-${o.status || 'pending'} text-[10px]">${(o.status || 'Pending').toUpperCase()}</span></td>
                    <td class="px-6 py-4 font-bold">₹${o.total_amount}</td>
                    <td class="px-6 py-4 text-right">
                         <button onclick="switchTab('orders'); setTimeout(() => OrdersModule.viewOrderDetails('${o.id}'), 100)" class="text-blue-600 hover:text-blue-800"><i data-lucide="eye" class="w-4 h-4"></i></button>
                    </td>
                </tr>
             `}).join('');
            lucide.createIcons();
        }
    },

    async viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) return;

        const modalId = 'order-detail-modal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 hidden';
            document.body.appendChild(modal);
        }

        let sAddr = order.shipping_address;
        if (typeof sAddr === 'string') try { sAddr = JSON.parse(sAddr); } catch (e) { sAddr = {}; }

        let bAddr = order.billing_address || sAddr; // Fallback to shipping if no billing
        if (typeof bAddr === 'string') try { bAddr = JSON.parse(bAddr); } catch (e) { bAddr = {}; }

        // Items handling
        let items = order.items || [];
        if (typeof items === 'string') try { items = JSON.parse(items); } catch (e) { items = []; }

        // Calculate Breakdown if not present
        const total = parseFloat(order.total_amount) || 0;
        const subtotal = order.subtotal ? parseFloat(order.subtotal) : (total / 1.05); // Approx if missing
        const gst = order.gst ? parseFloat(order.gst) : (total - subtotal);
        const shipping = order.shipping_cost ? parseFloat(order.shipping_cost) : 0;

        // Payment Approval Logic
        const isManualPayment = order.payment_method === 'UPI Gateway' || order.payment_method === 'In-App Payment' || order.payment_method === 'Pay When Confirming Order';
        const showPaymentActions = isManualPayment && order.payment_status !== 'completed';

        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div class="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 class="font-serif text-2xl font-bold text-gray-800">Order #${order.order_number || order.id.slice(0, 8)}</h3>
                        <p class="text-xs text-gray-500">${new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <button onclick="document.getElementById('${modalId}').classList.add('hidden')" class="text-gray-400 hover:text-gray-700">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-8 space-y-8">
                    <!-- Status Bar -->
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between bg-blue-50 p-6 rounded-xl border border-blue-100 gap-4">
                        <div>
                            <span class="text-xs uppercase font-bold text-blue-600 tracking-wider">Current Status</span>
                            <div class="text-2xl font-bold text-blue-900 mt-1">
                                ${(order.status || 'Pending').toUpperCase()}
                            </div>
                            <p class="text-xs text-blue-600/70 mt-1">
                                ${order.status === 'pending' ? 'Waiting for approval' : order.status === 'processed' ? 'Approved & Processing' : 'Delivered to Customer'}
                            </p>
                        </div>
                        <div class="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-blue-100">
                            <select id="update-status-select" class="bg-transparent text-sm font-medium focus:outline-none text-gray-700 min-w-[120px]">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="processed" ${order.status === 'processed' ? 'selected' : ''}>Processed</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                            <button onclick="OrdersModule.updateStatus('${order.id}', document.getElementById('update-status-select').value)" class="bg-spice-red text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors shadow-sm">
                                Update
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Customer Info -->
                        <div class="space-y-6">
                            <h4 class="font-bold text-gray-800 text-lg border-b pb-2">Customer Details</h4>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h5 class="text-xs font-bold text-gray-500 uppercase mb-2">Shipping Address</h5>
                                    <p class="font-bold text-gray-800">${sAddr.name || 'Guest'}</p>
                                    <p class="text-sm text-gray-600 whitespace-pre-line">${sAddr.address || ''}</p>
                                    <p class="text-sm text-gray-600">${sAddr.city || ''}, ${sAddr.state || ''}</p>
                                    <p class="text-sm text-gray-600">${sAddr.pincode || ''}</p>
                                    <p class="text-sm text-gray-600 mt-2"><span class="font-bold">Phone:</span> ${sAddr.phone || 'N/A'}</p>
                                    <p class="text-sm text-gray-600"><span class="font-bold">Email:</span> ${sAddr.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <h5 class="text-xs font-bold text-gray-500 uppercase mb-2">Billing Address</h5>
                                    <p class="font-bold text-gray-800">${bAddr.name || sAddr.name || 'Guest'}</p>
                                    <p class="text-sm text-gray-600 whitespace-pre-line">${bAddr.address || sAddr.address || ''}</p>
                                    <p class="text-sm text-gray-600">${bAddr.city || sAddr.city || ''}, ${bAddr.state || sAddr.state || ''}</p>
                                    <p class="text-sm text-gray-600">${bAddr.pincode || sAddr.pincode || ''}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Payment Info -->
                        <div class="space-y-6">
                            <h4 class="font-bold text-gray-800 text-lg border-b pb-2">Payment Info</h4>
                            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Method</span>
                                        <span class="font-bold text-gray-800">${order.payment_method || 'N/A'}</span>
                                    </div>
                                    ${order.payment_method === 'PhonePe Gateway' ? `
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-500">Transaction ID</span>
                                        <span class="font-mono text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">${order.payment_id || 'N/A'}</span>
                                    </div>` : ''}
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-500">Status</span>
                                        <span class="px-2 py-1 rounded text-xs font-bold ${order.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} uppercase">
                                            ${order.payment_status || 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                <!-- UPI Approval Actions -->
                                ${showPaymentActions ? `
                                    <div class="mt-6 pt-4 border-t border-gray-200">
                                        <p class="text-xs font-bold text-orange-600 mb-2">Wait for Payment Confirmation</p>
                                        <div class="flex gap-2">
                                            <button onclick="OrdersModule.updateStatus('${order.id}', 'processed'); /* Add logic to set payment_status='completed' too */" class="flex-1 bg-green-600 text-white text-sm font-bold py-2 rounded hover:bg-green-700 transition-colors shadow-sm">
                                                Approve Payment
                                            </button>
                                            <button onclick="OrdersModule.updateStatus('${order.id}', 'cancelled')" class="flex-1 bg-white border border-red-200 text-red-600 text-sm font-bold py-2 rounded hover:bg-red-50 transition-colors">
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>

                            <!-- Cost Breakdown -->
                             <div class="space-y-2 pt-4">
                                <div class="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹${(subtotal).toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span>₹${(shipping).toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                    <span>Total</span>
                                    <span class="text-spice-red">₹${(total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Items -->
                    <div>
                        <h4 class="font-bold text-gray-800 text-lg mb-4">Ordered Items</h4>
                        <div class="border rounded-lg overflow-hidden">
                             <div class="bg-gray-50 px-6 py-3 border-b text-xs font-bold text-gray-500 uppercase flex">
                                 <div class="flex-1">Item Details</div>
                                 <div class="w-24 text-center">Qty</div>
                                 <div class="w-32 text-right">Price</div>
                                 <div class="w-32 text-right">Total</div>
                             </div>
                             <div class="divide-y divide-gray-100">
                                ${items.map(item => `
                                    <div class="px-6 py-4 flex items-center hover:bg-gray-50/50">
                                        <div class="flex-1">
                                            <p class="font-bold text-gray-800">${item.product_name || item.name}</p>
                                            <p class="text-sm text-gray-500 mt-0.5">${item.variant_label || item.variantLabel || 'Standard'}</p>
                                        </div>
                                        <div class="w-24 text-center font-medium text-gray-700">
                                            ${item.quantity}
                                        </div>
                                        <div class="w-32 text-right text-gray-600">
                                            ₹${parseFloat(item.price).toFixed(2)}
                                        </div>
                                        <div class="w-32 text-right font-bold text-gray-800">
                                            ₹${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                `).join('')}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    async updateStatus(orderId, newStatus) {
        if (!confirm(`Are you sure you want to change status to ${newStatus.toUpperCase()}?`)) return;

        try {
            const { error } = await window.supabaseAdmin
                .from('shop_orders') // Updated table
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // alert('Status updated!');
            document.getElementById('order-detail-modal').classList.add('hidden');
            this.fetchOrders(); // Refresh table
        } catch (err) {
            console.error('Update failed', err);
            alert('Failed to update status.');
        }
    }
};

// Initialize only when tab is active or app loads
// For simplicity in this structure, we expose it globally
window.OrdersModule = OrdersModule;
