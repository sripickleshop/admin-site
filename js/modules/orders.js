// Orders Module for Admin Dashboard

const OrdersModule = {
    async init() {
        console.log('Initializing Orders Module...');
        this.renderTableSkeleton();
        await this.fetchOrders();
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

    async fetchOrders() {
        try {
            const { data, error } = await window.supabaseAdmin
                .from('shop_orders')
                .select('*, items:shop_order_items(*)') // Fetch real items
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.orders = data || [];
            this.renderOrders(this.orders);
            this.updateDashboardStats(this.orders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            document.getElementById('orders-table-body').innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">Failed to load orders.</td></tr>`;
        }
    },

    renderOrders(ordersData) {
        const tbody = document.getElementById('orders-table-body');
        if (!ordersData.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">No orders found.</td></tr>`;
            return;
        }

        tbody.innerHTML = ordersData.map(order => {
            const date = new Date(order.created_at).toLocaleDateString() + ' ' + new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Safe parsing of address
            let customerName = "Guest";
            let addr = order.shipping_address;
            if (typeof addr === 'string') {
                try { addr = JSON.parse(addr); } catch (e) { addr = {}; }
            }
            if (addr && addr.name) customerName = addr.name;
            else if (order.user_id) customerName = "REG: " + order.user_id.substring(0, 6);

            // Handle Items Count
            let itemsCount = 0;
            if (Array.isArray(order.items)) itemsCount = order.items.length;

            const statusClass = `status-${order.status || 'pending'}`;

            return `
                <tr class="hover:bg-gray-50 transition-colors group">
                    <td class="px-6 py-4 font-bold text-gray-700">
                        ${order.order_number || order.id}
                        ${order.payment_method === 'Pay When Confirming Order' ? '<span class="block text-[10px] text-orange-600 font-normal">Pay Later</span>' : ''}
                    </td>
                    <td class="px-6 py-4 text-gray-500">${date}</td>
                    <td class="px-6 py-4 font-medium text-gray-800">${customerName}</td>
                    <td class="px-6 py-4 text-gray-500">${itemsCount} Item(s)</td>
                    <td class="px-6 py-4 font-bold text-gray-800">₹${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td class="px-6 py-4">
                        <span class="status-badge ${statusClass}">
                            ${(order.status || 'Pending').toUpperCase()}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="OrdersModule.viewOrderDetails('${order.id}')" class="text-spice-red hover:bg-red-50 px-3 py-1 rounded text-xs font-bold border border-spice-red transition-colors">
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
        // Simple client-side calculation for dashboard view
        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
        const activeCount = orders.filter(o => o.status === 'pending' || o.status === 'processed').length;

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

        let addr = order.shipping_address;
        if (typeof addr === 'string') try { addr = JSON.parse(addr); } catch (e) { addr = {}; }

        // Items handling (Array from DB relation)
        let items = order.items || [];
        // No need to parse JSON string if we use the relation correctly, but fallback just in case
        if (typeof items === 'string') try { items = JSON.parse(items); } catch (e) { items = []; }

        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div class="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 class="font-serif text-xl font-bold text-gray-800">Order #${order.order_number}</h3>
                        <p class="text-xs text-gray-500">${new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <button onclick="document.getElementById('${modalId}').classList.add('hidden')" class="text-gray-400 hover:text-gray-700">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-6 space-y-6">
                    <!-- Status Bar -->
                    <div class="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div>
                            <span class="text-xs uppercase font-bold text-blue-600">Current Status</span>
                            <div class="text-lg font-bold text-blue-900 flex items-center gap-2">
                                <span class="status-badge status-${order.status || 'pending'}">${(order.status || 'Pending').toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <select id="update-status-select" class="border border-gray-300 rounded px-3 py-2 text-sm focus:border-spice-red outline-none">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="processed" ${order.status === 'processed' ? 'selected' : ''}>Processed</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                            <button onclick="OrdersModule.updateStatus('${order.id}', document.getElementById('update-status-select').value)" class="bg-spice-red text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors">
                                Update
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Customer Info -->
                        <div>
                            <h4 class="font-bold text-gray-700 mb-2 border-b pb-1">Customer Details</h4>
                            <p class="font-bold text-gray-800">${addr.name || 'Guest'}</p>
                            <p class="text-sm text-gray-600">${addr.address || ''}</p>
                            <p class="text-sm text-gray-600">${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}</p>
                            <p class="text-sm text-gray-600 mt-2"><span class="font-bold">Phone:</span> ${addr.phone || 'N/A'}</p>
                            <p class="text-sm text-gray-600"><span class="font-bold">Email:</span> ${addr.email || 'N/A'}</p>
                        </div>
                        
                        <!-- Payment Info -->
                        <div>
                            <h4 class="font-bold text-gray-700 mb-2 border-b pb-1">Payment Info</h4>
                            <p class="text-sm text-gray-600"><span class="font-bold">Method:</span> ${order.payment_method || 'N/A'}</p>
                            <p class="text-sm text-gray-600"><span class="font-bold">Transaction ID:</span> ${order.payment_id || 'N/A'}</p>
                            <p class="text-sm text-gray-600"><span class="font-bold">Payment Status:</span> ${order.payment_status || 'Pending'}</p>
                            
                            <!-- Payment Proof Display -->
                            ${order.payment_proof_url ? `
                                <div class="mt-3 p-2 bg-orange-50 rounded border border-orange-100">
                                    <p class="text-xs font-bold text-orange-800 mb-1 flex items-center gap-1"><i data-lucide="image" class="w-3 h-3"></i> Payment Proof</p>
                                    <a href="${order.payment_proof_url}" target="_blank">
                                        <img src="${order.payment_proof_url}" class="w-full h-32 object-cover rounded border border-gray-200 hover:opacity-90 cursor-zoom-in" alt="Payment Proof">
                                    </a>
                                    <div class="flex gap-2 mt-2">
                                        <button onclick="OrdersModule.updateStatus('${order.id}', 'processed')" class="flex-1 bg-green-600 text-white text-xs py-1 rounded hover:bg-green-700">Accept</button>
                                        <button onclick="OrdersModule.updateStatus('${order.id}', 'cancelled')" class="flex-1 bg-red-600 text-white text-xs py-1 rounded hover:bg-red-700">Decline</button>
                                    </div>
                                </div>
                            ` : ''}

                            <div class="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Subtotal:</span>
                                    <span>₹${order.subtotal || (parseFloat(order.total_amount) / 1.18).toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between text-lg font-bold text-spice-red border-t border-gray-200 pt-1 mt-1">
                                    <span>Total:</span>
                                    <span>₹${order.total_amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Items -->
                    <div>
                        <h4 class="font-bold text-gray-700 mb-2 border-b pb-1">Ordered Items</h4>
                        <table class="w-full text-sm text-left">
                            <thead class="bg-gray-100 text-gray-600">
                                <tr>
                                    <th class="p-2">Item</th>
                                    <th class="p-2">Qty</th>
                                    <th class="p-2 text-right">Price</th>
                                    <th class="p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => `
                                    <tr class="border-b border-gray-50">
                                        <td class="p-2 font-medium">
                                            ${item.product_name || item.name} 
                                            <span class="text-xs text-gray-500">(${item.variant_label || item.variantLabel || 'Std'})</span>
                                        </td>
                                        <td class="p-2">${item.quantity}</td>
                                        <td class="p-2 text-right">₹${item.price}</td>
                                        <td class="p-2 text-right font-bold">₹${item.quantity * item.price}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
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
