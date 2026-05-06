document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Set user info in header
    document.getElementById('display-user-name').textContent = userData.fullName || userData.username || 'User';

    // Navigation logic
    const dashboardView = document.getElementById('dashboard-view');
    const addDiplomaView = document.getElementById('add-diploma-view');
    
    document.getElementById('nav-home').addEventListener('click', (e) => {
        e.preventDefault();
        showView('dashboard-view');
        loadRounds();
    });

    document.getElementById('nav-diplomas').addEventListener('click', (e) => {
        e.preventDefault();
        showView('diplomas-list-view');
        loadDiplomasList();
    });

    document.getElementById('btn-open-add-diploma').addEventListener('click', () => {
        showView('add-diploma-view');
        initAddDiplomaForm();
    });

    document.getElementById('nav-rounds').addEventListener('click', (e) => {
        e.preventDefault();
        showView('rounds-list-view');
        loadRoundsList();
    });

    document.getElementById('btn-open-add-round').addEventListener('click', () => {
        showView('add-round-view');
        initAddRoundForm();
    });

    // Logout logic
    document.getElementById('btn-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // Load Initial Data
    loadRounds();
    loadDiplomas();
});

function showView(viewId) {
    document.querySelectorAll('.page-content').forEach(view => {
        view.style.display = 'none';
    });
    document.getElementById(viewId).style.display = 'block';
    
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    if (viewId === 'dashboard-view') {
        document.getElementById('nav-home').parentElement.classList.add('active');
    } else if (viewId === 'diplomas-list-view' || viewId === 'add-diploma-view') {
        document.getElementById('nav-diplomas').parentElement.classList.add('active');
    } else if (viewId === 'rounds-list-view' || viewId === 'add-round-view') {
        document.getElementById('nav-rounds').parentElement.classList.add('active');
    }
}

async function loadRounds() {
    try {
        const response = await fetch('http://localhost:8080/api/v2/rounds?size=10', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch rounds');

        const data = await response.json();
        renderDashboardTable(data.content || []);
    } catch (error) {
        console.error('Error loading rounds:', error);
    }
}

async function loadDiplomas() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/diplomas', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const diplomas = await response.json();
            
            // Populate Home filter
            const filterHome = document.getElementById('filter-diploma');
            filterHome.innerHTML = '<option value="">Diploma</option>';
            
            // Populate Rounds list filter
            const filterList = document.getElementById('filter-round-list-diploma');
            if (filterList) filterList.innerHTML = '<option value="">Diploma</option>';

            diplomas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.name;
                
                filterHome.appendChild(opt.cloneNode(true));
                if (filterList) filterList.appendChild(opt.cloneNode(true));
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
        const diplomaCount = round.diplomas ? round.diplomas.length : 0;
        groupRow.innerHTML = `
            <td>
                <div class="round-info">
                    <i class="fas fa-chevron-down"></i>
                    <span>${round.name}</span>
                    <span class="start-date">Starts ${formatDate(round.startDate)}</span>
                    <span class="round-badge">${diplomaCount} diplomas</span>
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

        // Render each diploma name within the round (Simplified for V2)
        if (round.diplomas && round.diplomas.length > 0) {
            round.diplomas.forEach(d => {
                const diplomaRow = document.createElement('tr');
                diplomaRow.innerHTML = `
                    <td></td>
                    <td>${d.name}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                `;
                tbody.appendChild(diplomaRow);
            });
        }
    });
}

function renderInstallmentCell(dateStr) {
    if (!dateStr) return '<div class="status-cell">-</div>';
    
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let statusClass = 'upcoming';
    let statusIcon = 'far fa-clock';
    let statusLabel = 'Upcoming';
    
    if (date < today) {
        // Mocking some delayed and some paid for visual variety
        const random = Math.random();
        if (random > 0.7) {
            statusClass = 'delayed';
            statusIcon = 'fas fa-exclamation-circle';
            const count = Math.floor(Math.random() * 5) + 1;
            statusLabel = `${count} delayed <span class="delayed-count">${count}</span>`;
        } else {
            statusClass = 'paid';
            statusIcon = 'fas fa-check-circle';
            statusLabel = 'All payed';
        }
    }
    
    return `
        <div class="status-cell">
            <span class="status-date">${formatDate(dateStr)}</span>
            <span class="status-label ${statusClass}"><i class="${statusIcon}"></i> ${statusLabel}</span>
        </div>
    `;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* Add New Diploma Form Logic */
function initAddDiplomaForm() {
    loadDiplomasForForm();
    loadRoundsForForm();
    loadInstructorsForForm();

    const form = document.getElementById('form-add-diploma');
    const totalPriceInput = document.getElementById('input-total-price');
    const installmentsTbody = document.getElementById('installments-tbody');
    const btnAddInst = document.getElementById('btn-add-inst');
    const btnCancel = document.getElementById('btn-cancel-add');

    // Handle price changes to update installment amounts
    totalPriceInput.addEventListener('input', updateInstallmentAmounts);

    // Handle add installment
    btnAddInst.onclick = () => {
        const rowCount = installmentsTbody.querySelectorAll('tr').length;
        if (rowCount >= 4) return;

        const row = document.createElement('tr');
        row.className = 'installment-row';
        const num = rowCount === 2 ? '3rd' : '4th';
        row.innerHTML = `
            <td>${num} Installment</td>
            <td><input type="number" class="inst-percent" value="25"></td>
            <td><input type="number" class="inst-amount" placeholder="0"></td>
            <td><input type="date" class="inst-date"></td>
            <td><button type="button" class="btn-delete-inst"><i class="fas fa-trash"></i></button></td>
        `;
        installmentsTbody.appendChild(row);
        
        // Add listeners to new row
        row.querySelector('.inst-percent').addEventListener('input', updateInstallmentAmounts);
        row.querySelector('.btn-delete-inst').onclick = () => {
            row.remove();
            updateInstallmentAmounts();
        };
        
        updateInstallmentAmounts();
    };

    // Handle existing rows
    installmentsTbody.querySelectorAll('.installment-row').forEach(row => {
        row.querySelector('.inst-percent').addEventListener('input', updateInstallmentAmounts);
        row.querySelector('.btn-delete-inst').onclick = () => {
            row.remove();
            updateInstallmentAmounts();
        };
    });

    btnCancel.onclick = () => showView('dashboard-view');

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            diplomaId: document.getElementById('input-diploma-id').value,
            roundId: document.getElementById('input-round-id').value,
            instructorId: document.getElementById('input-instructor-id').value,
            totalPrice: document.getElementById('input-total-price').value,
            startDate: document.getElementById('input-start-date').value,
            endDate: document.getElementById('input-end-date').value,
            totalStudents: document.getElementById('input-total-students').value,
            diplomas: [ // Backend expects a list of diplomas for the round save/update
                {
                    diplomaId: document.getElementById('input-diploma-id').value,
                    instructorId: document.getElementById('input-instructor-id').value,
                    totalPrice: document.getElementById('input-total-price').value,
                    startDate: document.getElementById('input-start-date').value,
                    endDate: document.getElementById('input-end-date').value,
                    totalStudents: document.getElementById('input-total-students').value,
                    installment1Amount: getInstAmount(0),
                    installment2Amount: getInstAmount(1),
                    installment3Amount: getInstAmount(2),
                    installment4Amount: getInstAmount(3),
                    installment1Date: getInstDate(0),
                    installment2Date: getInstDate(1),
                    installment3Date: getInstDate(2),
                    installment4Date: getInstDate(3)
                }
            ]
        };

        // Note: The backend 'Round' save expects a RoundRequest which has a list of RoundDiplomaRequest.
        // We are updating a round by adding a diploma to it.
        try {
            const roundId = document.getElementById('input-round-id').value;
            // Fetch current round data first to keep other diplomas
            const roundResp = await fetch(`http://localhost:8080/api/v1/rounds/${roundId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const existingRound = await roundResp.json();
            
            // Prepare updated round request
            const updatePayload = {
                name: existingRound.name,
                startDate: existingRound.startDate,
                endDate: existingRound.endDate,
                status: existingRound.status,
                diplomas: existingRound.diplomas.map(d => ({
                    diplomaId: d.diploma.id,
                    instructorId: d.instructor ? d.instructor.id : null,
                    totalPrice: d.totalPrice,
                    startDate: d.startDate,
                    endDate: d.endDate,
                    totalStudents: d.totalStudents,
                    installment1Amount: d.installment1Amount,
                    installment2Amount: d.installment2Amount,
                    installment3Amount: d.installment3Amount,
                    installment4Amount: d.installment4Amount,
                    installment1Date: d.installment1Date,
                    installment2Date: d.installment2Date,
                    installment3Date: d.installment3Date,
                    installment4Date: d.installment4Date
                }))
            };
            
            // Add new diploma
            updatePayload.diplomas.push(payload.diplomas[0]);

            const response = await fetch(`http://localhost:8080/api/v1/rounds/${roundId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatePayload)
            });

            if (response.ok) {
                alert('Diploma added to round successfully!');
                showView('dashboard-view');
                loadRounds();
            } else {
                const err = await response.json();
                alert('Error: ' + (err.message || 'Failed to save'));
            }
        } catch (error) {
            console.error('Error saving diploma:', error);
            alert('An error occurred while saving.');
        }
    };
}

function updateInstallmentAmounts() {
    const total = parseFloat(document.getElementById('input-total-price').value) || 0;
    const rows = document.querySelectorAll('.installment-row');
    
    rows.forEach(row => {
        const percent = parseFloat(row.querySelector('.inst-percent').value) || 0;
        const amountInput = row.querySelector('.inst-amount');
        amountInput.value = ((percent / 100) * total).toFixed(2);
    });
}

function getInstAmount(index) {
    const rows = document.querySelectorAll('.installment-row');
    if (index >= rows.length) return null;
    return rows[index].querySelector('.inst-amount').value;
}

function getInstDate(index) {
    const rows = document.querySelectorAll('.installment-row');
    if (index >= rows.length) return null;
    return rows[index].querySelector('.inst-date').value || null;
}

async function loadDiplomasForForm() {
    const response = await fetch('http://localhost:8080/api/v1/diplomas', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
        const diplomas = await response.json();
        const select = document.getElementById('input-diploma-id');
        const currentVal = select.value;
        select.innerHTML = '<option value="">Select Diploma</option>';
        diplomas.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            select.appendChild(opt);
        });
        select.value = currentVal;
    }
}

async function loadRoundsForForm() {
    const response = await fetch('http://localhost:8080/api/v1/rounds?size=100', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
        const data = await response.json();
        const select = document.getElementById('input-round-id');
        select.innerHTML = '<option value="">Select Diploma round</option>';
        (data.content || []).forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.name;
            select.appendChild(opt);
        });
    }
}

async function loadInstructorsForForm() {
    const response = await fetch('http://localhost:8080/api/v1/users/role/EMPLOYEE', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
        const users = await response.json();
        const select = document.getElementById('input-instructor-id');
        select.innerHTML = '<option value="">Select Diploma Instructure</option>';
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.fullName;
            select.appendChild(opt);
        });
    }
}

async function loadRoundsList() {
    try {
        const response = await fetch('http://localhost:8080/api/v2/rounds?size=10', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch rounds');
        const data = await response.json();
        renderRoundsListTable(data.content || []);
    } catch (error) {
        console.error('Error loading rounds list:', error);
    }
}

function renderRoundsListTable(rounds) {
    const tbody = document.getElementById('rounds-list-tbody');
    tbody.innerHTML = '';

    rounds.forEach(round => {
        const row = document.createElement('tr');
        
        const diplomasList = (round.diplomas || [])
            .map(d => d.name)
            .join('<br>');

        row.innerHTML = `
            <td>${round.name}</td>
            <td>${formatDate(round.startDate)}</td>
            <td>${round.diplomas ? round.diplomas.length : 0}</td>
            <td class="diplomas-column">${diplomasList}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="editRound(${round.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn-action delete" onclick="deleteRound(${round.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function initAddRoundForm() {
    loadDiplomasForRoundForm();

    const form = document.getElementById('form-add-round');
    const btnCancel = document.getElementById('btn-cancel-round');

    btnCancel.onclick = () => showView('rounds-list-view');

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const selectedDiplomaIds = Array.from(document.querySelectorAll('.diploma-checkbox:checked'))
            .map(cb => cb.value);

        if (selectedDiplomaIds.length === 0) {
            alert('Please select at least one diploma');
            return;
        }

        const payload = {
            name: document.getElementById('input-round-name').value,
            startDate: document.getElementById('input-round-start-date').value,
            endDate: document.getElementById('input-round-end-date').value,
            diplomaIds: selectedDiplomaIds
        };

        try {
            const response = await fetch('http://localhost:8080/api/v2/rounds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Round created successfully!');
                showView('rounds-list-view');
                loadRoundsList();
            } else {
                const err = await response.json();
                alert('Error: ' + (err.message || 'Failed to create round'));
            }
        } catch (error) {
            console.error('Error creating round:', error);
            alert('An error occurred.');
        }
    };

    // Toggle Dropdown
    const trigger = document.getElementById('diploma-select-trigger');
    const dropdown = document.getElementById('diploma-select-dropdown');
    
    trigger.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        trigger.classList.toggle('active');
    };

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
        trigger.classList.remove('active');
    });

    dropdown.onclick = (e) => e.stopPropagation();

    // Search Logic
    const searchInput = document.getElementById('search-diplomas-input');
    searchInput.oninput = () => {
        const term = searchInput.value.toLowerCase();
        document.querySelectorAll('.option-item').forEach(item => {
            const text = item.querySelector('span').textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'flex' : 'none';
        });
    };
}

async function loadDiplomasForRoundForm() {
    try {
        const response = await fetch('http://localhost:8080/api/v2/diplomas', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const diplomas = await response.json();
            const list = document.getElementById('diploma-options-list');
            list.innerHTML = '';
            
            diplomas.forEach(d => {
                const item = document.createElement('div');
                item.className = 'option-item';
                item.innerHTML = `
                    <input type="checkbox" class="diploma-checkbox" value="${d.id}" id="dip-${d.id}">
                    <span>${d.name}</span>
                `;
                
                item.onclick = (e) => {
                    const cb = item.querySelector('input');
                    if (e.target !== cb) cb.checked = !cb.checked;
                    updateSelectedDiplomasText();
                };
                
                list.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error loading diplomas for form:', error);
    }
}

function updateSelectedDiplomasText() {
    const checked = document.querySelectorAll('.diploma-checkbox:checked');
    const textSpan = document.getElementById('selected-diplomas-text');
    
    if (checked.length === 0) {
        textSpan.textContent = 'Select diplomas in this round';
    } else if (checked.length === 1) {
        textSpan.textContent = checked[0].parentElement.querySelector('span').textContent;
    } else {
        textSpan.textContent = `${checked.length} diplomas selected`;
    }
}

async function deleteRound(id) {
    if (!confirm('Are you sure you want to delete this round?')) return;
    
    try {
        const response = await fetch(`http://localhost:8080/api/v2/rounds/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            loadRoundsList();
        } else {
            alert('Failed to delete round');
        }
    } catch (error) {
        console.error('Error deleting round:', error);
    }
}

function editRound(id) {
    alert('Edit functionality coming soon for ID: ' + id);
}

async function loadDiplomasList() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/diplomas', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch diplomas');
        const diplomas = await response.json();
        renderDiplomasListTable(diplomas);
    } catch (error) {
        console.error('Error loading diplomas list:', error);
    }
}

function renderDiplomasListTable(diplomas) {
    const tbody = document.getElementById('diplomas-list-tbody');
    tbody.innerHTML = '';

    diplomas.forEach(diploma => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${diploma.name}</td>
            <td>General</td>
            <td><span class="status-badge active">Active</span></td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="editDiploma(${diploma.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn-action delete" onclick="deleteDiploma(${diploma.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editDiploma(id) {
    alert('Edit Diploma coming soon for ID: ' + id);
}

function deleteDiploma(id) {
    alert('Delete Diploma coming soon for ID: ' + id);
}
