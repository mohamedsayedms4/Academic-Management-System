document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Set user info in header
    document.getElementById('display-user-name').textContent = userData.fullName || userData.username || 'User';

    // Logout logic
    document.getElementById('btn-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // Load Dashboard Data
    loadRounds();
    loadDiplomas();
});

async function loadRounds() {
    try {
        const response = await fetch('/api/v1/rounds?size=10', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch rounds');

        const data = await response.json();
        // Spring Data JPA Page object returns results in 'content'
        renderDashboardTable(data.content || []);
    } catch (error) {
        console.error('Error loading rounds:', error);
    }
}

async function loadDiplomas() {
    try {
        const response = await fetch('/api/v1/diplomas', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const diplomas = await response.json();
            const select = document.getElementById('filter-diploma');
            diplomas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.name;
                select.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Error loading diplomas:', error);
    }
}

function renderDashboardTable(rounds) {
    const tbody = document.getElementById('dashboard-tbody');
    tbody.innerHTML = '';

    if (rounds.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No active rounds found.</td></tr>';
        return;
    }

    rounds.forEach(round => {
        // Round Group Header Row
        const groupRow = document.createElement('tr');
        groupRow.className = 'round-group-row';
        groupRow.innerHTML = `
            <td>
                <div class="round-info">
                    <i class="fas fa-chevron-down"></i>
                    <span>${round.name}</span>
                    <span class="start-date">Starts ${formatDate(round.startDate)}</span>
                    <span class="round-badge">active</span>
                </div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        `;
        tbody.appendChild(groupRow);

        // Individual Diploma Row (Mocking multiple entries per round for UI demonstration as per Figma)
        // In a real app, you'd iterate over the diplomas linked to the round
        const diplomaRow = document.createElement('tr');
        diplomaRow.innerHTML = `
            <td></td>
            <td>${round.diploma ? round.diploma.name : 'N/A'}</td>
            <td>${round.currentEnrollment}</td>
            <td>
                <div class="status-cell">
                    <span class="status-date">15 Jan 2025</span>
                    <span class="status-label paid"><i class="fas fa-check-circle"></i> All paid</span>
                </div>
            </td>
            <td>
                <div class="status-cell">
                    <span class="status-date">15 Mar 2025</span>
                    <span class="status-label paid"><i class="fas fa-check-circle"></i> All paid</span>
                </div>
            </td>
            <td>
                <div class="status-cell">
                    <span class="status-date">15 May 2025</span>
                    <span class="status-label delayed"><i class="fas fa-exclamation-circle"></i> 4 delayed <span class="delayed-count">4</span></span>
                </div>
            </td>
            <td>
                <div class="status-cell">
                    <span class="status-date">15 Jul 2025</span>
                    <span class="status-label upcoming"><i class="far fa-clock"></i> Upcoming</span>
                </div>
            </td>
        `;
        tbody.appendChild(diplomaRow);
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
