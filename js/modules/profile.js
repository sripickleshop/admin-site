// Team & Profile Management Module
// Handles list of admins, their roles (Teams), and permissions.

const ProfileModule = {
    currentFilter: 'all', // 'all', 'developer', 'manager', 'staff'

    async init() {
        console.log('Initializing Team Module...');
        this.renderToolbar(); // Add filter dropdown
        await this.fetchTeam();
    },

    renderToolbar() {
        const container = document.querySelector('#view-profile .flex.justify-between');
        if (container) {
            // Check if filter exists
            if (!document.getElementById('team-filter')) {
                const filterHtml = `
                    <div class="flex items-center gap-2 mr-auto ml-4">
                        <label class="text-sm font-bold text-gray-600">Team:</label>
                        <select id="team-filter" onchange="ProfileModule.filterTeam(this.value)" class="border border-gray-300 rounded p-1 text-sm outline-none focus:border-spice-red">
                            <option value="all">All Teams</option>
                            <option value="developer">Developers</option>
                            <option value="manager">Managers</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                `;
                // Insert after title
                container.firstElementChild.insertAdjacentHTML('afterend', filterHtml);
            }
        }
    },

    async fetchTeam() {
        try {
            const { data: { user } } = await window.supabaseAdmin.auth.getUser();
            if (!user) return;

            // Fetch current user role to determine edit rights
            const { data: myProfile } = await window.supabaseAdmin
                .from('admin_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            this.myRole = myProfile ? myProfile.role : 'staff';
            this.canEdit = (this.myRole === 'developer' || this.myRole === 'manager');

            // Fetch All Profiles
            const { data: profiles, error } = await window.supabaseAdmin
                .from('admin_profiles')
                .select('*')
                .order('role', { ascending: true }); // Group slightly by role

            if (error) throw error;

            this.team = profiles || [];
            this.filterTeam(this.currentFilter);

        } catch (err) {
            console.error('Error fetching team:', err);
            document.getElementById('admin-list-body').innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500">Failed to load team data.</td></tr>`;
        }
    },

    filterTeam(role) {
        this.currentFilter = role;
        const filtered = role === 'all' ? this.team : this.team.filter(m => m.role === role);
        this.renderTeam(filtered);
    },

    renderTeam(profiles) {
        const tbody = document.getElementById('admin-list-body');
        if (!profiles || profiles.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-400">No team members found in this group.</td></tr>`;
            return;
        }

        // Update Header if needed
        const thead = document.querySelector('#view-profile thead tr');
        if (thead && thead.children.length === 4) {
            // Add Status Column Header if missing
            thead.innerHTML = `
                <th class="px-6 py-3">Employee</th>
                <th class="px-6 py-3">Role (Team)</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3">Key Access</th>
                <th class="px-6 py-3 text-right">Actions</th>
             `;
        }

        tbody.innerHTML = profiles.map(profile => {
            // Determine avatar
            const initials = profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : (profile.email ? profile.email.substring(0, 2).toUpperCase() : '??');
            const avatarHtml = profile.avatar_url
                ? `<img src="${profile.avatar_url}" class="w-10 h-10 rounded-full object-cover border border-gray-200" alt="${profile.full_name}">`
                : `<div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-inner">${initials}</div>`;

            // Role Badge Color
            const roleColors = {
                'developer': 'bg-purple-100 text-purple-800 border-purple-200',
                'manager': 'bg-blue-100 text-blue-800 border-blue-200',
                'staff': 'bg-gray-100 text-gray-800 border-gray-200'
            };
            const roleClass = roleColors[profile.role] || roleColors['staff'];

            // Access Badges
            let permissions = profile.permissions || {};
            // If permissions is string, parse it
            if (typeof permissions === 'string') try { permissions = JSON.parse(permissions); } catch (e) { }

            const accessList = Object.keys(permissions).filter(k => permissions[k]).map(k =>
                `<span class="text-[10px] uppercase bg-white border border-gray-200 px-1 rounded text-gray-500">${k}</span>`
            ).join(' ');

            const isActive = profile.is_active !== false; // Default true

            return `
                <tr class="hover:bg-gray-50 transition-colors group cursor-pointer" onclick="ProfileModule.openMemberDetails('${profile.id}')">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            ${avatarHtml}
                            <div>
                                <div class="font-bold text-gray-800 text-sm">${profile.full_name || 'Unnamed Staff'}</div>
                                <div class="text-xs text-gray-500">${profile.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 rounded-full text-xs font-bold uppercase border ${roleClass}">
                            ${profile.role || 'Staff'}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                         <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}"></div>
                            <span class="text-xs font-medium text-gray-600">${isActive ? 'Active' : 'Inactive'}</span>
                         </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-1 max-w-[150px]">
                            ${accessList || '<span class="text-xs text-gray-300 italic">None</span>'}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-right" onclick="event.stopPropagation()">
                        ${this.canEdit ? `
                            <button onclick="ProfileModule.toggleActive('${profile.id}', ${!isActive})" 
                                class="text-gray-400 hover:text-${isActive ? 'red' : 'green'}-600 p-2 hover:bg-gray-100 rounded transition-colors" 
                                title="${isActive ? 'Deactivate' : 'Activate'} User">
                                <i data-lucide="${isActive ? 'user-x' : 'user-check'}" class="w-4 h-4"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    },

    openAddAdminModal() {
        const sql = `INSERT INTO admin_profiles (id, email, role, full_name, is_active, permissions)
VALUES (
  'USER_UUID_FROM_AUTH', 
  'email@sripickles.com', 
  'staff', 
  'Employee Name', 
  true, 
  '{"products": true, "orders": true}'::jsonb
);`;
        alert("To add a Global Developer/Admin:\n\n1. Use the 'Sign Up' page to create a user account.\n2. Run this SQL in Supabase:\n\n" + sql + "\n\n(Copy this from the console/logs if needed)");
        console.log("SQL TO ADD ADMIN:\n", sql);
    },

    async toggleActive(id, newState) {
        if (!this.canEdit) {
            alert('Permission Denied.');
            return;
        }

        try {
            const { error } = await window.supabaseAdmin
                .from('admin_profiles')
                .update({ is_active: newState })
                .eq('id', id);

            if (error) throw error;
            showToast(`User ${newState ? 'Activated' : 'Deactivated'}`);
            this.fetchTeam();
        } catch (err) {
            console.error('Update failed:', err);
            alert('Failed to update status.');
        }
    },

    openMemberDetails(id) {
        if (!this.canEdit) return;
        const member = this.team.find(m => m.id === id);
        if (!member) return;

        const newRole = prompt(`Update Role for ${member.full_name || member.email}?\n(developer, manager, staff)`, member.role);
        if (newRole && newRole !== member.role) {
            this.updateRole(id, newRole);
        }
    },

    async updateRole(id, newRole) {
        try {
            const { error } = await window.supabaseAdmin
                .from('admin_profiles')
                .update({ role: newRole.toLowerCase() })
                .eq('id', id);

            if (error) throw error;
            showToast('Role updated!');
            this.fetchTeam();
        } catch (e) {
            alert('Failed to update role.');
        }
    }
};

window.ProfileModule = ProfileModule;
