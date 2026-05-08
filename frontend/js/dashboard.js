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
        loadDiplomasV2();
    });

    document.getElementById('btn-open-add-diploma').addEventListener('click', () => {
        showView('add-diploma-view');
        initAddDiplomaV2Form();
    });

    if (document.getElementById('search-diplomas-v2')) {
        document.getElementById('search-diplomas-v2').oninput = () => loadDiplomasV2();
    }
    if (document.getElementById('filter-diploma-instructor')) {
        document.getElementById('filter-diploma-instructor').onchange = () => loadDiplomasV2();
    }

    document.getElementById('nav-rounds').addEventListener('click', (e) => {
        e.preventDefault();
        showView('rounds-list-view');
        loadRoundsList();
    });

    document.getElementById('nav-instructors').addEventListener('click', (e) => {
        e.preventDefault();
        showView('instructors-list-view');
        loadInstructors();
        loadDiplomasForFilters();
    });

    document.getElementById('btn-add-instructor-nav').onclick = () => {
        showView('add-instructor-view');
        initAddInstructorForm();
        loadDiplomasForInstructorForm();
    };

    if (document.getElementById('search-instructors')) {
        document.getElementById('search-instructors').oninput = () => loadInstructors();
    }
    if (document.getElementById('filter-instructor-diploma')) {
        document.getElementById('filter-instructor-diploma').onchange = () => loadInstructors();
    }

    document.getElementById('btn-open-add-round').addEventListener('click', () => {
        showView('add-round-view');
        initAddRoundForm();
    });

    // Students Submenu
    const navStudentsParent = document.getElementById('nav-students-parent');
    const studentsSubmenu = document.getElementById('students-submenu');
    if (navStudentsParent) {
        navStudentsParent.addEventListener('click', (e) => {
            e.preventDefault();
            studentsSubmenu.classList.toggle('show');
            const arrow = navStudentsParent.querySelector('.arrow');
            if (arrow) {
                arrow.classList.toggle('fa-chevron-down');
                arrow.classList.toggle('fa-chevron-right');
            }
        });
    }

    document.getElementById('nav-cancelled-students').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        showView('cancelled-students-view');
        loadCancelledStudents();
    });

    document.getElementById('nav-future-enrollments').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        showView('future-enrollments-view');
        loadFutureEnrollments();
    });

    document.getElementById('btn-add-student-nav').onclick = () => {
        showView('add-student-view');
        initAddStudentForm();
    };

    if (document.getElementById('search-cancelled-students')) {
        document.getElementById('search-cancelled-students').oninput = () => loadCancelledStudents();
    }
    if (document.getElementById('search-future-students')) {
        document.getElementById('search-future-students').oninput = () => loadFutureEnrollments();
    }

    // Logout logic
    document.getElementById('btn-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    document.getElementById('nav-invoices').addEventListener('click', (e) => {
        e.preventDefault();
        showView('invoices-list-view');
        loadInvoices();
    });

    document.getElementById('nav-employees').addEventListener('click', (e) => {
        e.preventDefault();
        showView('employees-list-view');
        loadEmployees();
    });

    document.getElementById('btn-open-add-employee').addEventListener('click', () => {
        showView('add-employee-view');
        initAddEmployeeForm();
    });

    document.getElementById('nav-leads').addEventListener('click', (e) => {
        e.preventDefault();
        showView('leads-list-view');
        loadLeads();
    });

    if (document.getElementById('search-leads')) {
        document.getElementById('search-leads').oninput = () => loadLeads();
    }
    if (document.getElementById('filter-leads-status')) {
        document.getElementById('filter-leads-status').onchange = () => loadLeads();
    }

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
    } else if (viewId === 'invoices-list-view' || viewId === 'add-invoice-view') {
        document.getElementById('nav-invoices').parentElement.classList.add('active');
    } else if (viewId === 'employees-list-view' || viewId === 'add-employee-view') {
        document.getElementById('nav-employees').parentElement.classList.add('active');
    } else if (viewId === 'leads-list-view') {
        document.getElementById('nav-leads').parentElement.classList.add('active');
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

    // Apply button
    document.getElementById('btn-apply-diplomas').onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.remove('show');
        trigger.classList.remove('active');
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
    const tagsContainer = document.getElementById('selected-diplomas-tags');
    
    tagsContainer.innerHTML = '';
    
    if (checked.length === 0) {
        textSpan.textContent = 'Select diplomas in this round';
    } else {
        if (checked.length === 1) {
            textSpan.textContent = checked[0].parentElement.querySelector('span').textContent;
        } else {
            textSpan.textContent = `${checked.length} diplomas selected`;
        }
        
        // Render Tags
        checked.forEach(cb => {
            const name = cb.parentElement.querySelector('span').textContent;
            const tag = document.createElement('div');
            tag.className = 'diploma-tag';
            tag.innerHTML = `
                <span>${name}</span>
                <i class="fas fa-trash-alt" onclick="removeDiplomaTag(${cb.value})"></i>
            `;
            tagsContainer.appendChild(tag);
        });
    }
}

function removeDiplomaTag(id) {
    const cb = document.getElementById(`dip-${id}`);
    if (cb) {
        cb.checked = false;
        updateSelectedDiplomasText();
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

// ===============================
// Instructors (V2)
// ===============================

async function loadInstructors(page = 0) {
    const search = document.getElementById('search-instructors').value;
    const diplomaId = document.getElementById('filter-instructor-diploma').value;
    
    let url = `http://localhost:8080/api/v2/instructors?page=${page}&size=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            renderInstructorsTable(data.content || []);
            renderPagination('instructors-pagination', data, loadInstructors);
        }
    } catch (error) {
        console.error('Error loading instructors:', error);
    }
}

function renderInstructorsTable(instructors) {
    const tbody = document.getElementById('instructors-tbody');
    tbody.innerHTML = '';
    
    instructors.forEach(inst => {
        const row = document.createElement('tr');
        const diplomasList = inst.assignedDiplomas.map(d => d.name).join('<br>');
        
        row.innerHTML = `
            <td>${inst.name}</td>
            <td>${inst.phoneNumber}</td>
            <td>${inst.salary}</td>
            <td>${inst.paymentMethod}</td>
            <td class="diplomas-column">${diplomasList}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="editInstructor(${inst.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn-action delete" onclick="deleteInstructor(${inst.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function initAddInstructorForm() {
    const form = document.getElementById('form-add-instructor');
    form.reset();
    document.getElementById('inst-selected-diplomas-tags').innerHTML = '';
    document.getElementById('inst-selected-diplomas-text').textContent = 'Select diplomas';
    
    const btnCancel = document.getElementById('btn-cancel-instructor');
    btnCancel.onclick = () => showView('instructors-list-view');

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const selectedDiplomaIds = Array.from(document.querySelectorAll('.inst-diploma-checkbox:checked'))
            .map(cb => cb.value);

        if (selectedDiplomaIds.length === 0) {
            alert('Please select at least one diploma');
            return;
        }

        const payload = {
            name: document.getElementById('input-instructor-name').value,
            phoneNumber: document.getElementById('input-instructor-phone').value,
            salary: parseFloat(document.getElementById('input-instructor-salary').value),
            paymentMethod: document.getElementById('input-instructor-pay-method').value,
            assignedDiplomaIds: selectedDiplomaIds
        };

        try {
            const response = await fetch('http://localhost:8080/api/v2/instructors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Instructor added successfully!');
                showView('instructors-list-view');
                loadInstructors();
            } else {
                const err = await response.json();
                alert('Error: ' + (err.message || 'Failed to add instructor'));
            }
        } catch (error) {
            console.error('Error adding instructor:', error);
        }
    };

    // Custom Multi-select Logic
    const trigger = document.getElementById('instructor-diploma-trigger');
    const dropdown = document.getElementById('instructor-diploma-dropdown');
    
    trigger.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        trigger.classList.toggle('active');
    };

    document.getElementById('btn-apply-inst-diplomas').onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.remove('show');
        trigger.classList.remove('active');
    };

    const searchInput = document.getElementById('inst-search-diplomas-input');
    searchInput.oninput = () => {
        const term = searchInput.value.toLowerCase();
        document.querySelectorAll('#instructor-diploma-options .option-item').forEach(item => {
            const text = item.querySelector('span').textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'flex' : 'none';
        });
    };
}

async function loadDiplomasForInstructorForm() {
    try {
        const response = await fetch('http://localhost:8080/api/v2/diplomas', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const diplomas = await response.json();
            const list = document.getElementById('instructor-diploma-options');
            list.innerHTML = '';
            
            diplomas.forEach(d => {
                const item = document.createElement('div');
                item.className = 'option-item';
                item.innerHTML = `
                    <input type="checkbox" class="inst-diploma-checkbox" value="${d.id}" id="inst-dip-${d.id}">
                    <span>${d.name}</span>
                `;
                
                item.onclick = (e) => {
                    const cb = item.querySelector('input');
                    if (e.target !== cb) cb.checked = !cb.checked;
                    updateInstSelectedDiplomasText();
                };
                
                list.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error loading diplomas for instructor form:', error);
    }
}

function updateInstSelectedDiplomasText() {
    const checked = document.querySelectorAll('.inst-diploma-checkbox:checked');
    const textSpan = document.getElementById('inst-selected-diplomas-text');
    const tagsContainer = document.getElementById('inst-selected-diplomas-tags');
    
    tagsContainer.innerHTML = '';
    
    if (checked.length === 0) {
        textSpan.textContent = 'Select diplomas';
    } else {
        textSpan.textContent = checked.length === 1 ? 
            checked[0].parentElement.querySelector('span').textContent : 
            `${checked.length} diplomas selected`;
        
        checked.forEach(cb => {
            const name = cb.parentElement.querySelector('span').textContent;
            const tag = document.createElement('div');
            tag.className = 'diploma-tag';
            tag.innerHTML = `
                <span>${name}</span>
                <i class="fas fa-trash-alt" onclick="removeInstructorDiplomaTag(${cb.value})"></i>
            `;
            tagsContainer.appendChild(tag);
        });
    }
}

function removeInstructorDiplomaTag(id) {
    const cb = document.getElementById(`inst-dip-${id}`);
    if (cb) {
        cb.checked = false;
        updateInstSelectedDiplomasText();
    }
}

async function loadDiplomasForFilters() {
    try {
        const response = await fetch('http://localhost:8080/api/v2/diplomas', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const diplomas = await response.json();
            const filter = document.getElementById('filter-instructor-diploma');
            filter.innerHTML = '<option value="">Diploma</option>';
            diplomas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.name;
                filter.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Error loading filters:', error);
    }
}

async function deleteInstructor(id) {
    if (confirm('Are you sure you want to delete this instructor?')) {
        try {
            const response = await fetch(`http://localhost:8080/api/v2/instructors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                loadInstructors();
            }
        } catch (error) {
            console.error('Error deleting instructor:', error);
        }
    }
}

function editInstructor(id) {
    alert('Edit Instructor Coming Soon!');
}

// ===============================
// Students (V2)
// ===============================

async function loadCancelledStudents(page = 0) {
    const search = document.getElementById('search-cancelled-students').value;
    let url = `http://localhost:8080/api/v2/students/cancelled?page=${page}&size=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            renderCancelledStudentsTable(data.content || []);
            renderPagination('cancelled-students-pagination', data, loadCancelledStudents);
        }
    } catch (error) {
        console.error('Error loading cancelled students:', error);
    }
}

function renderCancelledStudentsTable(students) {
    const tbody = document.getElementById('cancelled-students-tbody');
    tbody.innerHTML = '';
    
    students.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.phone}</td>
            <td>${s.roundName}</td>
            <td>${s.diplomaName}</td>
            <td>${s.cancellationDate ? new Date(s.cancellationDate).toLocaleDateString() : 'N/A'}</td>
            <td>${s.cancellationReason || 'N/A'}</td>
            <td>${s.salesPersonName}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" title="Restore" onclick="restoreStudent(${s.id})"><i class="fas fa-undo"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function loadFutureEnrollments(page = 0) {
    const search = document.getElementById('search-future-students').value;
    let url = `http://localhost:8080/api/v2/students/future?page=${page}&size=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            renderFutureEnrollmentsTable(data.content || []);
            renderPagination('future-students-pagination', data, loadFutureEnrollments);
        }
    } catch (error) {
        console.error('Error loading future enrollments:', error);
    }
}

function renderFutureEnrollmentsTable(students) {
    const tbody = document.getElementById('future-enrollments-tbody');
    tbody.innerHTML = '';
    
    students.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.phone}</td>
            <td>${s.roundName}</td>
            <td>${s.diplomaName}</td>
            <td>${s.depositAmount}</td>
            <td>${s.salesPersonName}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action delete" title="Cancel" onclick="cancelStudentPrompt(${s.id})"><i class="fas fa-times-circle"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function initAddStudentForm(preRoundId = null, preDiplomaId = null) {
    const form = document.getElementById('form-add-student');
    form.reset();
    
    // Reset visibility and required status
    document.getElementById('enrollment-selectors').style.display = 'grid';
    document.getElementById('enrollment-summary-readonly').style.display = 'none';
    document.getElementById('input-student-round').required = true;
    document.getElementById('input-student-diploma').required = true;

    document.getElementById('btn-cancel-student').onclick = () => {
        if (preRoundId) {
            showView('diploma-details-view');
        } else {
            showView('future-enrollments-view');
        }
    };

    // Load Rounds, Diplomas, and Sales
    await loadOptionsForStudentForm();

    if (preRoundId) {
        // Hide selectors (remove required so browser doesn't complain about hidden focus)
        document.getElementById('enrollment-selectors').style.display = 'none';
        document.getElementById('input-student-round').required = false;
        document.getElementById('input-student-diploma').required = false;

        const summaryBox = document.getElementById('enrollment-summary-readonly');
        summaryBox.style.display = 'block';
        
        const roundSelect = document.getElementById('input-student-round');
        roundSelect.value = preRoundId;
        
        // Ensure onchange is awaited if it's a promise
        if (roundSelect.onchange) {
            await roundSelect.onchange();
        }
        
        if (preDiplomaId) {
            const diplomaSelect = document.getElementById('input-student-diploma');
            diplomaSelect.value = preDiplomaId;
            
            // Set readonly text with safety checks
            const roundText = roundSelect.selectedIndex >= 0 ? roundSelect.options[roundSelect.selectedIndex].text : 'Unknown Round';
            const diplomaText = diplomaSelect.selectedIndex >= 0 ? diplomaSelect.options[diplomaSelect.selectedIndex].text : 'Unknown Diploma';
            document.getElementById('readonly-enrollment-text').textContent = `${roundText} - ${diplomaText}`;
        }
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            name: document.getElementById('input-student-name').value,
            email: document.getElementById('input-student-email').value,
            phone: document.getElementById('input-student-phone').value,
            notes: document.getElementById('input-student-notes').value,
            roundId: document.getElementById('input-student-round').value,
            diplomaId: document.getElementById('input-student-diploma').value,
            depositAmount: parseFloat(document.getElementById('input-student-deposit').value),
            salesPersonId: document.getElementById('input-student-sales').value,
            discount: document.getElementById('input-student-discount').value
        };

        try {
            const response = await fetch('http://localhost:8080/api/v2/students/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Student enrolled successfully', 'success');
                if (preRoundId) {
                    showView('diploma-details-view');
                    loadDiplomaStudentsV2(currentDetailsRoundDiplomaId);
                } else {
                    showView('future-enrollments-view');
                    loadFutureEnrollments();
                }
            } else {
                showToast('Failed to enroll student', 'error');
            }
        } catch (error) {
            console.error('Error enrolling student:', error);
            showToast('Error connecting to server', 'error');
        }
    };
}

async function loadOptionsForStudentForm() {
    try {
        const [roundsRes, salesRes] = await Promise.all([
            fetch('http://localhost:8080/api/v2/rounds/all', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch('http://localhost:8080/api/v1/users', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }) 
        ]);

        const rounds = await roundsRes.json();
        const sales = await salesRes.json();

        const roundSelect = document.getElementById('input-student-round');
        roundSelect.innerHTML = '<option value="" disabled selected>Select Round</option>';
        rounds.forEach(r => roundSelect.add(new Option(r.name, r.id)));

        const diplomaSelect = document.getElementById('input-student-diploma');
        diplomaSelect.innerHTML = '<option value="" disabled selected>Select Diploma</option>';
        diplomaSelect.disabled = true; // Disable until round is selected

        roundSelect.onchange = async () => {
            const roundId = roundSelect.value;
            if (!roundId) return;

            diplomaSelect.innerHTML = '<option value="" disabled selected>Loading diplomas...</option>';
            diplomaSelect.disabled = true;

            try {
                const res = await fetch(`http://localhost:8080/api/v2/rounds/${roundId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const round = await res.json();
                    diplomaSelect.innerHTML = '<option value="" disabled selected>Select Diploma</option>';
                    round.diplomas.forEach(d => {
                        diplomaSelect.add(new Option(d.name, d.id));
                    });
                    diplomaSelect.disabled = false;
                }
            } catch (error) {
                console.error('Error loading diplomas for round:', error);
                diplomaSelect.innerHTML = '<option value="" disabled selected>Error loading diplomas</option>';
            }
        };

        const salesSelect = document.getElementById('input-student-sales');
        salesSelect.innerHTML = '<option value="" disabled selected>Assigned sales</option>';
        sales.forEach(u => salesSelect.add(new Option(u.fullName, u.id)));

    } catch (error) {
        console.error('Error loading options:', error);
    }
}

async function restoreStudent(id) {
    if (confirm('Restore this student enrollment?')) {
        try {
            const response = await fetch(`http://localhost:8080/api/v2/students/${id}/restore`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                loadCancelledStudents();
            }
        } catch (error) {
            console.error('Error restoring student:', error);
        }
    }
}

async function cancelStudentPrompt(id) {
    const reason = prompt('Please enter the reason for cancellation:');
    if (reason === null) return;

    try {
        const response = await fetch(`http://localhost:8080/api/v2/students/${id}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ reason })
        });
        if (response.ok) {
            loadFutureEnrollments();
        }
    } catch (error) {
        console.error('Error cancelling student:', error);
    }
}

// ===============================
// Invoices (V2)
// ===============================

async function loadInvoices(page = 0) {
    const search = document.getElementById('search-invoices').value;
    let url = `http://localhost:8080/api/v2/invoices?page=${page}&size=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            renderInvoicesTable(data.content || []);
            renderPagination('invoices-pagination', data, loadInvoices);
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

function renderInvoicesTable(invoices) {
    const tbody = document.getElementById('invoices-tbody');
    tbody.innerHTML = '';
    
    if (invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No invoices found.</td></tr>';
        return;
    }

    invoices.forEach(inv => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(inv.invoiceDate)}</td>
            <td>${inv.customerName}</td>
            <td>${inv.customerPhone}</td>
            <td>${inv.amount}</td>
            <td>${inv.notes || '-'}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="editInvoice(${inv.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn-action delete" onclick="deleteInvoice(${inv.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function initAddInvoiceForm() {
    const form = document.getElementById('form-add-invoice');
    form.reset();
    
    document.getElementById('btn-cancel-invoice').onclick = () => showView('invoices-list-view');

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            invoiceDate: document.getElementById('input-invoice-date').value,
            amount: parseFloat(document.getElementById('input-invoice-amount').value),
            customerName: document.getElementById('input-invoice-name').value,
            customerPhone: document.getElementById('input-invoice-phone').value,
            notes: document.getElementById('input-invoice-notes').value
        };

        try {
            const response = await fetch('http://localhost:8080/api/v2/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Invoice saved successfully!');
                showView('invoices-list-view');
                loadInvoices();
            } else {
                const err = await response.json();
                alert('Error: ' + (err.message || 'Failed to save invoice'));
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
        }
    };
}

async function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        try {
            const response = await fetch(`http://localhost:8080/api/v2/invoices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                loadInvoices();
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    }
}

function editInvoice(id) {
    alert('Edit Invoice Coming Soon!');
}

function renderPagination(containerId, data, loadFn) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (data.totalPages <= 1) return;
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = data.first;
    prevBtn.onclick = () => loadFn(data.number - 1);
    container.appendChild(prevBtn);
    
    for (let i = 0; i < data.totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === data.number ? 'active' : ''}`;
        pageBtn.textContent = i + 1;
        pageBtn.onclick = () => loadFn(i);
        container.appendChild(pageBtn);
    }
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = data.last;
    nextBtn.onclick = () => loadFn(data.number + 1);
    container.appendChild(nextBtn);
}
// ===============================
// Diplomas (V2)
// ===============================

async function loadDiplomasV2(page = 0) {
    const search = document.getElementById('search-diplomas-v2').value;
    const instructorId = document.getElementById('filter-diploma-instructor').value;
    
    let url = `http://localhost:8080/api/v2/round-diplomas?page=${page}&size=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            renderDiplomasV2Table(data.content || []);
            renderPagination('diplomas-pagination', data, loadDiplomasV2);
        }
    } catch (error) {
        console.error('Error loading diplomas V2:', error);
    }
}

function renderDiplomasV2Table(diplomas) {
    const tbody = document.getElementById('diplomas-list-tbody');
    tbody.innerHTML = '';
    
    if (diplomas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">No diplomas found.</td></tr>';
        return;
    }

    diplomas.forEach(d => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="clickable-name" onclick="viewDiplomaDetailsV2(${d.id})">${d.diplomaName}</span></td>
            <td>${d.roundName}</td>
            <td>${d.totalStudents}</td>
            <td>${d.instructorName}</td>
            <td>${d.totalPrice}</td>
            <td>${formatDate(d.startDate)}</td>
            <td>${formatDate(d.endDate)}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="editDiplomaV2(${d.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn-action delete" onclick="deleteDiplomaV2(${d.id}, '${d.diplomaName}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function initAddDiplomaV2Form() {
    // Load lookup data
    await loadV2LookupData();
    
    const form = document.getElementById('form-add-diploma-v2');
    form.reset();
    document.getElementById('v2-installments-tbody').innerHTML = '';
    updateV2PaymentSummary();

    const totalPriceInput = document.getElementById('v2-input-total-price');
    totalPriceInput.oninput = () => updateV2InstallmentAmounts();

    document.getElementById('v2-btn-cancel-add').onclick = () => showView('diplomas-list-view');

    document.getElementById('v2-btn-add-inst').onclick = () => {
        const tbody = document.getElementById('v2-installments-tbody');
        const count = tbody.children.length;
        if (count >= 4) return;

        const row = document.createElement('tr');
        const label = count === 0 ? '1st' : count === 1 ? '2nd' : count === 2 ? '3rd' : '4th';
        row.innerHTML = `
            <td style="padding: 12px;">${label} Installment</td>
            <td style="padding: 12px;"><input type="number" class="v2-inst-percent" style="width: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="0"></td>
            <td style="padding: 12px;"><input type="number" class="v2-inst-amount" style="width: 120px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;" readonly value="0"></td>
            <td style="padding: 12px;"><input type="date" class="v2-inst-date" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></td>
            <td style="padding: 12px;"><button type="button" class="v2-btn-del-inst" style="background: none; border: none; color: #dc3545; cursor: pointer;"><i class="fas fa-trash"></i></button></td>
        `;

        row.querySelector('.v2-inst-percent').oninput = () => {
            updateV2InstallmentAmounts();
            updateV2PaymentSummary();
        };
        row.querySelector('.v2-btn-del-inst').onclick = () => {
            row.remove();
            updateV2InstallmentAmounts();
            updateV2PaymentSummary();
        };

        tbody.appendChild(row);
        updateV2PaymentSummary();
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const totalPercent = calculateTotalV2Percent();
        if (totalPercent !== 100) {
            alert('Total percentage must be exactly 100%');
            return;
        }

        const payload = {
            roundId: document.getElementById('v2-input-round-id').value,
            diplomaName: document.getElementById('v2-input-diploma-name').value,
            instructorId: document.getElementById('v2-input-instructor-id').value,
            totalPrice: parseFloat(document.getElementById('v2-input-total-price').value),
            startDate: document.getElementById('v2-input-start-date').value,
            endDate: document.getElementById('v2-input-end-date').value,
            totalStudents: parseInt(document.getElementById('v2-input-total-students').value),
            installment1Percent: getV2InstPercent(0),
            installment2Percent: getV2InstPercent(1),
            installment3Percent: getV2InstPercent(2),
            installment4Percent: getV2InstPercent(3),
            installment1Amount: getV2InstAmount(0),
            installment2Amount: getV2InstAmount(1),
            installment3Amount: getV2InstAmount(2),
            installment4Amount: getV2InstAmount(3),
            installment1Date: getV2InstDate(0),
            installment2Date: getV2InstDate(1),
            installment3Date: getV2InstDate(2),
            installment4Date: getV2InstDate(3)
        };

        try {
            const response = await fetch('http://localhost:8080/api/v2/round-diplomas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Diploma added successfully', 'success');
                showView('diplomas-list-view');
                loadDiplomasV2();
            } else {
                showToast('Failed to add diploma', 'error');
            }
        } catch (error) {
            console.error('Error adding diploma:', error);
        }
    };
}

async function loadV2LookupData() {
    try {
        const [roundsRes, diplomasRes, instructorsRes] = await Promise.all([
            fetch('http://localhost:8080/api/v2/rounds/all', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch('http://localhost:8080/api/v2/diplomas/all', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch('http://localhost:8080/api/v2/instructors/all', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);

        const rounds = await roundsRes.json();
        const diplomas = await diplomasRes.json();
        const instructors = await instructorsRes.json();

        populateSelect('v2-input-round-id', rounds, 'name', 'id');
        populateSelect('v2-input-instructor-id', instructors, 'name', 'id');
        populateSelect('filter-diploma-instructor', instructors, 'name', 'id', 'Instructor');

    } catch (error) {
        console.error('Error loading lookup data:', error);
    }
}

function populateSelect(id, items, labelKey, valueKey, defaultLabel = 'Select') {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = `<option value="">${defaultLabel}</option>`;
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item[valueKey];
        opt.textContent = item[labelKey];
        select.appendChild(opt);
    });
}

function updateV2InstallmentAmounts() {
    const total = parseFloat(document.getElementById('v2-input-total-price').value) || 0;
    const rows = document.querySelectorAll('#v2-installments-tbody tr');
    rows.forEach(row => {
        const percent = parseFloat(row.querySelector('.v2-inst-percent').value) || 0;
        const amountInput = row.querySelector('.v2-inst-amount');
        amountInput.value = ((percent / 100) * total).toFixed(2);
    });
}

function calculateTotalV2Percent() {
    let total = 0;
    document.querySelectorAll('.v2-inst-percent').forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    return total;
}

function updateV2PaymentSummary() {
    const totalPercent = calculateTotalV2Percent();
    const totalPrice = parseFloat(document.getElementById('v2-input-total-price').value) || 0;
    const totalAmount = (totalPercent / 100) * totalPrice;

    const percentSpan = document.getElementById('v2-total-percent');
    const amountSpan = document.getElementById('v2-total-amount-summary');

    percentSpan.textContent = `${totalPercent}%`;
    amountSpan.textContent = `${totalAmount.toFixed(2)} EGP`;

    if (totalPercent === 100) {
        percentSpan.style.color = '#28a745';
        amountSpan.style.color = '#28a745';
        document.getElementById('v2-payment-summary').style.borderColor = '#28a745';
        document.getElementById('v2-payment-summary').style.backgroundColor = '#f4fff4';
    } else {
        percentSpan.style.color = '#dc3545';
        amountSpan.style.color = '#dc3545';
        document.getElementById('v2-payment-summary').style.borderColor = '#ddd';
        document.getElementById('v2-payment-summary').style.backgroundColor = '#fff';
    }
}

function getV2InstPercent(index) {
    const inputs = document.querySelectorAll('.v2-inst-percent');
    return index < inputs.length ? parseInt(inputs[index].value) : null;
}

function getV2InstAmount(index) {
    const inputs = document.querySelectorAll('.v2-inst-amount');
    return index < inputs.length ? parseFloat(inputs[index].value) : null;
}

function getV2InstDate(index) {
    const inputs = document.querySelectorAll('.v2-inst-date');
    return index < inputs.length ? inputs[index].value || null : null;
}

async function deleteDiplomaV2(id, name = "this diploma") {
    showDeleteModal(`Delete "${name}"?`, async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v2/round-diplomas/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                showToast('Diploma Deleted successfully', 'success');
                loadDiplomasV2();
            } else {
                showToast('Failed to delete diploma', 'error');
            }
        } catch (error) {
            console.error('Error deleting diploma:', error);
            showToast('Error connecting to server', 'error');
        }
    });
}

async function editDiplomaV2(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/v2/round-diplomas/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const d = await response.json();
            
            showView('edit-diploma-view');
            
            // Populate Breadcrumb and Title
            document.getElementById('edit-diploma-breadcrumb').textContent = `Edit ${d.diplomaName}`;
            document.getElementById('edit-diploma-title').textContent = `Edit ${d.diplomaName}`;
            
            // Load lookups then populate
            await loadV2LookupDataForEdit();
            
            document.getElementById('edit-v2-id').value = d.id;
            document.getElementById('edit-v2-input-diploma-name').value = d.diplomaName;
            document.getElementById('edit-v2-input-round-id').value = d.roundId;
            document.getElementById('edit-v2-input-instructor-id').value = d.instructorId || "";
            document.getElementById('edit-v2-input-total-price').value = d.totalPrice;
            document.getElementById('edit-v2-input-start-date').value = d.startDate;
            document.getElementById('edit-v2-input-end-date').value = d.endDate;
            document.getElementById('edit-v2-input-total-students').value = d.totalStudents;
            
            // Clear and add installments
            const tbody = document.getElementById('edit-v2-installments-tbody');
            tbody.innerHTML = '';
            
            if (d.installment1Percent) addV2InstallmentRowEdit(1, d.installment1Percent, d.installment1Amount, d.installment1Date);
            if (d.installment2Percent) addV2InstallmentRowEdit(2, d.installment2Percent, d.installment2Amount, d.installment2Date);
            if (d.installment3Percent) addV2InstallmentRowEdit(3, d.installment3Percent, d.installment3Amount, d.installment3Date);
            if (d.installment4Percent) addV2InstallmentRowEdit(4, d.installment4Percent, d.installment4Amount, d.installment4Date);
            
            updateV2PaymentSummaryEdit();
            initEditDiplomaFormLogic();
        }
    } catch (error) {
        console.error('Error loading diploma for edit:', error);
    }
}

async function loadV2LookupDataForEdit() {
    try {
        const [roundsRes, instructorsRes] = await Promise.all([
            fetch('http://localhost:8080/api/v2/rounds/all', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch('http://localhost:8080/api/v2/instructors/all', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);

        const rounds = await roundsRes.json();
        const instructors = await instructorsRes.json();

        populateSelect('edit-v2-input-round-id', rounds, 'name', 'id');
        populateSelect('edit-v2-input-instructor-id', instructors, 'name', 'id');
    } catch (error) {
        console.error('Error loading lookup data for edit:', error);
    }
}

function addV2InstallmentRowEdit(num, percent = 0, amount = 0, date = "") {
    const tbody = document.getElementById('edit-v2-installments-tbody');
    const label = num === 1 ? '1st' : num === 2 ? '2nd' : num === 3 ? '3rd' : '4th';
    const row = document.createElement('tr');
    row.innerHTML = `
        <td style="padding: 12px;">${label} Installment</td>
        <td style="padding: 12px;"><input type="number" class="edit-v2-inst-percent" style="width: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${percent}"></td>
        <td style="padding: 12px;"><input type="number" class="edit-v2-inst-amount" style="width: 120px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;" readonly value="${amount}"></td>
        <td style="padding: 12px;"><input type="date" class="edit-v2-inst-date" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${date}"></td>
        <td style="padding: 12px;"><button type="button" class="edit-v2-btn-del-inst" style="background: none; border: none; color: #dc3545; cursor: pointer;"><i class="fas fa-trash"></i></button></td>
    `;
    
    row.querySelector('.edit-v2-inst-percent').oninput = () => {
        updateV2InstallmentAmountsEdit();
        updateV2PaymentSummaryEdit();
    };
    row.querySelector('.edit-v2-btn-del-inst').onclick = () => {
        row.remove();
        updateV2PaymentSummaryEdit();
    };
    
    tbody.appendChild(row);
}

function initEditDiplomaFormLogic() {
    const form = document.getElementById('form-edit-diploma-v2');
    
    document.getElementById('edit-v2-btn-cancel').onclick = () => showView('diplomas-list-view');
    document.getElementById('edit-v2-input-total-price').oninput = () => updateV2InstallmentAmountsEdit();
    
    document.getElementById('edit-v2-btn-add-inst').onclick = () => {
        const count = document.getElementById('edit-v2-installments-tbody').children.length;
        if (count < 4) addV2InstallmentRowEdit(count + 1);
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-v2-id').value;
        const totalPercent = calculateTotalV2PercentEdit();
        
        if (totalPercent !== 100) {
            alert('Total percentage must equal 100%');
            return;
        }

        const payload = {
            roundId: document.getElementById('edit-v2-input-round-id').value,
            diplomaName: document.getElementById('edit-v2-input-diploma-name').value,
            instructorId: document.getElementById('edit-v2-input-instructor-id').value,
            totalPrice: parseFloat(document.getElementById('edit-v2-input-total-price').value),
            startDate: document.getElementById('edit-v2-input-start-date').value,
            endDate: document.getElementById('edit-v2-input-end-date').value,
            totalStudents: parseInt(document.getElementById('edit-v2-input-total-students').value),
            installment1Percent: getV2InstPercentEdit(0),
            installment2Percent: getV2InstPercentEdit(1),
            installment3Percent: getV2InstPercentEdit(2),
            installment4Percent: getV2InstPercentEdit(3),
            installment1Amount: getV2InstAmountEdit(0),
            installment2Amount: getV2InstAmountEdit(1),
            installment3Amount: getV2InstAmountEdit(2),
            installment4Amount: getV2InstAmountEdit(3),
            installment1Date: getV2InstDateEdit(0),
            installment2Date: getV2InstDateEdit(1),
            installment3Date: getV2InstDateEdit(2),
            installment4Date: getV2InstDateEdit(3)
        };

        try {
            const response = await fetch(`http://localhost:8080/api/v2/round-diplomas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Changes saved successfully', 'success');
                showView('diplomas-list-view');
                loadDiplomasV2();
            } else {
                showToast('Failed to save changes', 'error');
            }
        } catch (error) {
            console.error('Error updating diploma:', error);
            showToast('Error connecting to server', 'error');
        }
    };
}

function updateV2InstallmentAmountsEdit() {
    const total = parseFloat(document.getElementById('edit-v2-input-total-price').value) || 0;
    const rows = document.querySelectorAll('#edit-v2-installments-tbody tr');
    rows.forEach(row => {
        const percent = parseFloat(row.querySelector('.edit-v2-inst-percent').value) || 0;
        const amountInput = row.querySelector('.edit-v2-inst-amount');
        amountInput.value = ((percent / 100) * total).toFixed(2);
    });
}

function calculateTotalV2PercentEdit() {
    let total = 0;
    document.querySelectorAll('.edit-v2-inst-percent').forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    return total;
}

function updateV2PaymentSummaryEdit() {
    const totalPercent = calculateTotalV2PercentEdit();
    const totalPrice = parseFloat(document.getElementById('edit-v2-input-total-price').value) || 0;
    const totalAmount = (totalPercent / 100) * totalPrice;

    const percentSpan = document.getElementById('edit-v2-total-percent');
    const amountSpan = document.getElementById('edit-v2-total-amount-summary');

    percentSpan.textContent = `${totalPercent}%`;
    amountSpan.textContent = `${totalAmount.toFixed(2)} EGP`;

    if (totalPercent === 100) {
        percentSpan.style.color = '#28a745';
        amountSpan.style.color = '#28a745';
        document.getElementById('edit-v2-payment-summary').style.borderColor = '#28a745';
        document.getElementById('edit-v2-payment-summary').style.backgroundColor = '#f4fff4';
    } else {
        percentSpan.style.color = '#dc3545';
        amountSpan.style.color = '#dc3545';
        document.getElementById('edit-v2-payment-summary').style.borderColor = '#ddd';
        document.getElementById('edit-v2-payment-summary').style.backgroundColor = '#fff';
    }
}

function getV2InstPercentEdit(index) {
    const inputs = document.querySelectorAll('.edit-v2-inst-percent');
    return index < inputs.length ? parseInt(inputs[index].value) : null;
}

function getV2InstAmountEdit(index) {
    const inputs = document.querySelectorAll('.edit-v2-inst-amount');
    return index < inputs.length ? parseFloat(inputs[index].value) : null;
}

function getV2InstDateEdit(index) {
    const inputs = document.querySelectorAll('.edit-v2-inst-date');
    return index < inputs.length ? inputs[index].value || null : null;
}

// ===============================
// Notifications & Modals
// ===============================

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check' : 'fa-times'}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <div class="toast-close"><i class="fas fa-times"></i></div>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    const timer = setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
    
    toast.querySelector('.toast-close').onclick = () => {
        clearTimeout(timer);
        toast.remove();
    };
}

function showDeleteModal(title, onConfirm) {
    const modal = document.getElementById('delete-modal');
    document.getElementById('delete-modal-title').textContent = title;
    modal.style.display = 'flex';
    
    document.getElementById('btn-confirm-delete').onclick = () => {
        onConfirm();
        modal.style.display = 'none';
    };
    
    document.getElementById('btn-cancel-delete').onclick = () => {
        modal.style.display = 'none';
    };
}

let currentDetailsRoundDiplomaId = null;

async function viewDiplomaDetailsV2(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/v2/round-diplomas/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const d = await response.json();
            currentDetailsRoundDiplomaId = id;
            
            showView('diploma-details-view');
            
            // Update UI
            document.getElementById('details-diploma-name-breadcrumb').textContent = d.diplomaName;
            document.getElementById('details-diploma-title').textContent = `${d.diplomaName} – ${d.roundName}`;
            
            // Initialize Tabs
            initDetailsTabs(id);
            
            // Load students
            loadDiplomaStudentsV2(id);
            
            // Search logic
            document.getElementById('search-details-students').oninput = (e) => {
                loadDiplomaStudentsV2(id, e.target.value);
            };

            // Postpone Target Round Lookup
            loadPostponeRounds();

            // Fix Add Student button
            document.getElementById('btn-add-student-to-diploma').onclick = () => {
                showView('add-student-view');
                initAddStudentForm(d.roundId, d.diplomaId);
            };
        }
    } catch (error) {
        console.error('Error loading diploma details:', error);
    }
}

function initDetailsTabs(roundDiplomaId) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const target = tab.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            document.getElementById(target).style.display = 'block';

            if (target === 'attendance-tab') {
                initAttendanceTab(roundDiplomaId);
            }
        };
    });
}

async function loadDiplomaStudentsV2(id, search = '') {
    try {
        const url = new URL(`http://localhost:8080/api/v2/students/round-diploma/${id}`);
        if (search) url.searchParams.append('search', search);
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            renderDiplomaStudentsV2(data.content);
        }
    } catch (error) {
        console.error('Error loading diploma students:', error);
    }
}

function renderDiplomaStudentsV2(students) {
    const tbody = document.getElementById('details-students-tbody');
    tbody.innerHTML = '';
    
    students.forEach(s => {
        const statusClass = s.status === 'ACTIVE' ? 'status-active' : s.status === 'CANCELLED' ? 'status-cancelled' : 'status-postponed';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.phone}</td>
            <td><span class="status-badge ${statusClass}">${s.status}</span></td>
            <td><input type="checkbox" ${s.itStatus ? 'checked' : ''} disabled></td>
            <td>${s.email || '-'}</td>
            <td>••••••••</td>
            <td>${s.notes || '-'}</td>
            <td>${formatDate(s.enrollmentDate)}</td>
            <td>${s.totalAmount || '0'}</td>
            <td>${s.paidAmount || '0'}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="postponeStudent(${s.id}, '${s.name}')" title="Postpone"><i class="fas fa-pause"></i></button>
                    <button class="btn-action delete" onclick="cancelStudent(${s.id}, '${s.name}')" title="Cancel"><i class="fas fa-ban"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function cancelStudent(id, name) {
    const modal = document.getElementById('cancel-student-modal');
    modal.style.display = 'flex';
    document.getElementById('cancel-reason-input').value = '';
    
    document.getElementById('btn-confirm-cancel-student').onclick = async () => {
        const reason = document.getElementById('cancel-reason-input').value;
        try {
            const response = await fetch(`http://localhost:8080/api/v2/students/${id}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason })
            });
            if (response.ok) {
                showToast('Student enrollment cancelled', 'success');
                modal.style.display = 'none';
                loadDiplomaStudentsV2(currentDetailsRoundDiplomaId);
            }
        } catch (error) {
            console.error('Error cancelling student:', error);
        }
    };
    
    document.getElementById('btn-abort-cancel-student').onclick = () => {
        modal.style.display = 'none';
    };
}

async function postponeStudent(id, name) {
    const modal = document.getElementById('postpone-student-modal');
    modal.style.display = 'flex';
    
    document.getElementById('btn-confirm-postpone-student').onclick = async () => {
        const targetRoundId = document.getElementById('postpone-target-round-select').value;
        if (!targetRoundId) {
            alert('Please select a target round');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8080/api/v2/students/${id}/postpone`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ targetRoundId })
            });
            if (response.ok) {
                showToast('Student postponed to future round', 'success');
                modal.style.display = 'none';
                loadDiplomaStudentsV2(currentDetailsRoundDiplomaId);
            }
        } catch (error) {
            console.error('Error postponing student:', error);
        }
    };
    
    document.getElementById('btn-abort-postpone-student').onclick = () => {
        modal.style.display = 'none';
    };
}

async function loadPostponeRounds() {
    try {
        const response = await fetch('http://localhost:8080/api/v2/rounds/all', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const rounds = await response.json();
            populateSelect('postpone-target-round-select', rounds, 'name', 'id', 'Select round...');
        }
    } catch (error) {
        console.error('Error loading rounds for postpone:', error);
    }
}

// ===============================
// Attendance & Tasks V2
// ===============================

function initAttendanceTab(roundDiplomaId) {
    const datePicker = document.getElementById('attendance-date-picker');
    if (!datePicker.value) {
        datePicker.value = new Date().toISOString().split('T')[0];
    }
    
    document.getElementById('btn-load-attendance').onclick = () => loadAttendanceData(roundDiplomaId, datePicker.value);
    document.getElementById('btn-save-attendance').onclick = () => saveAttendanceData(roundDiplomaId);
    
    document.getElementById('btn-open-add-task').onclick = () => {
        document.getElementById('add-task-modal').style.display = 'flex';
    };

    document.getElementById('form-add-student-task').onsubmit = (e) => {
        e.preventDefault();
        createTaskData(roundDiplomaId);
    };

    loadAttendanceData(roundDiplomaId, datePicker.value);
    loadTasksData(roundDiplomaId);
}

async function loadAttendanceData(roundDiplomaId, date) {
    try {
        // First get students in this diploma
        const stdResponse = await fetch(`http://localhost:8080/api/v2/students/round-diploma/${roundDiplomaId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const stdData = await stdResponse.json();
        const students = stdData.content;

        // Then get attendance records for this date
        const attResponse = await fetch(`http://localhost:8080/api/v2/attendance/diploma/${roundDiplomaId}?date=${date}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const attendanceRecords = await attResponse.json();

        renderAttendanceTable(students, attendanceRecords);
    } catch (error) {
        console.error('Error loading attendance data:', error);
    }
}

function renderAttendanceTable(students, records) {
    const tbody = document.getElementById('attendance-tbody');
    tbody.innerHTML = '';

    const recordMap = new Map(records.map(r => [r.studentId, r]));

    students.forEach(s => {
        const record = recordMap.get(s.id);
        const currentStatus = record ? record.status : 'PRESENT';
        const currentNotes = record ? record.notes : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.name}</td>
            <td>
                <div class="attendance-status-group" data-student-id="${s.id}">
                    <label class="attendance-radio present ${currentStatus === 'PRESENT' ? 'active' : ''}">
                        <input type="radio" name="att-${s.id}" value="PRESENT" ${currentStatus === 'PRESENT' ? 'checked' : ''}> P
                    </label>
                    <label class="attendance-radio absent ${currentStatus === 'ABSENT' ? 'active' : ''}">
                        <input type="radio" name="att-${s.id}" value="ABSENT" ${currentStatus === 'ABSENT' ? 'checked' : ''}> A
                    </label>
                    <label class="attendance-radio excused ${currentStatus === 'EXCUSED' ? 'active' : ''}">
                        <input type="radio" name="att-${s.id}" value="EXCUSED" ${currentStatus === 'EXCUSED' ? 'checked' : ''}> E
                    </label>
                </div>
            </td>
            <td><input type="text" class="att-notes" value="${currentNotes}" style="width: 100%; border: none; background: transparent;" placeholder="..."></td>
        `;

        // UI helper for radio appearance
        row.querySelectorAll('.attendance-radio').forEach(label => {
            label.onclick = () => {
                row.querySelectorAll('.attendance-radio').forEach(l => l.classList.remove('active'));
                label.classList.add('active');
            };
        });

        tbody.appendChild(row);
    });
}

async function saveAttendanceData(roundDiplomaId) {
    const date = document.getElementById('attendance-date-picker').value;
    const records = [];

    document.querySelectorAll('.attendance-status-group').forEach(group => {
        const studentId = group.getAttribute('data-student-id');
        const status = group.querySelector('input:checked').value;
        const notes = group.closest('tr').querySelector('.att-notes').value;
        records.push({ studentId: parseInt(studentId), status, notes });
    });

    const payload = { roundDiplomaId, date, records };

    try {
        const response = await fetch('http://localhost:8080/api/v2/attendance/bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Attendance saved successfully', 'success');
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
    }
}

async function loadTasksData(roundDiplomaId) {
    try {
        const response = await fetch(`http://localhost:8080/api/v2/tasks/diploma/${roundDiplomaId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const tasks = await response.json();
            renderTasksTable(tasks);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function renderTasksTable(tasks) {
    const tbody = document.getElementById('tasks-tbody');
    tbody.innerHTML = '';
    
    tasks.forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.title}</td>
            <td>${formatDate(t.deadline)}</td>
            <td>0/0</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="viewSubmissions(${t.id})" title="View Submissions"><i class="fas fa-eye"></i></button>
                    <button class="btn-action delete" title="Delete Task"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function createTaskData(roundDiplomaId) {
    // ... existing content ...
}

// ===============================
// Employees (Integrated)
// ===============================

async function loadEmployees() {
    const search = document.getElementById('search-employees').value;
    const role = document.getElementById('filter-employees-role').value;
    
    let url = 'http://localhost:8080/api/v1/users';
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            let employees = await response.json();
            
            if (search) {
                employees = employees.filter(e => e.fullName.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search));
            }
            if (role) {
                employees = employees.filter(e => e.role === role);
            }
            
            renderEmployeesTable(employees);
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

function renderEmployeesTable(employees) {
    const tbody = document.getElementById('employees-list-tbody');
    tbody.innerHTML = '';
    
    employees.forEach(e => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${e.fullName}</td>
            <td>${e.phone || '-'}</td>
            <td>${e.role}</td>
            <td>${e.baseSalary || '0'}</td>
            <td>${e.paymentMethod || '-'}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="editEmployee(${e.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn-action delete" onclick="deleteUser(${e.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function initAddEmployeeForm() {
    const form = document.getElementById('form-add-employee');
    form.reset();
    document.getElementById('employee-edit-id').value = '';
    document.getElementById('employee-form-title').textContent = 'Add New employee';
    document.getElementById('employee-form-breadcrumb').textContent = 'Add new employee';
    
    // Hide password for edit if needed, but for now just leave it
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('employee-edit-id').value;
        const payload = {
            username: document.getElementById('input-employee-username').value,
            fullName: document.getElementById('input-employee-name').value,
            phone: document.getElementById('input-employee-phone').value,
            role: document.getElementById('input-employee-role').value,
            baseSalary: parseFloat(document.getElementById('input-employee-salary').value),
            paymentMethod: document.getElementById('input-employee-pay-method').value,
            password: document.getElementById('input-employee-password').value,
            email: document.getElementById('input-employee-username').value + "@academy.com" // Default email if not provided
        };
        
        try {
            // Using /api/auth/register for new users
            // For update, we might need a separate endpoint. For now let's handle create.
            let url = 'http://localhost:8080/api/auth/register';
            let method = 'POST';
            
            if (id) {
                // Mocking update for now as we don't have a specific update endpoint shown yet
                // In a real app, we'd use PUT /api/v1/users/{id}
                alert('Update functionality using the existing module structure.');
                return;
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                showToast('Employee added successfully', 'success');
                showView('employees-list-view');
                loadEmployees();
            } else {
                const err = await response.json();
                showToast(err.message || 'Error saving employee', 'error');
            }
        } catch (error) {
            console.error('Error saving employee:', error);
        }
    };
    
    document.getElementById('btn-cancel-employee').onclick = () => showView('employees-list-view');
}

async function editEmployee(id) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const users = await response.json();
        const user = users.find(u => u.id === id);
        
        if (user) {
            showView('add-employee-view');
            initAddEmployeeForm();
            
            document.getElementById('employee-edit-id').value = user.id;
            document.getElementById('employee-form-title').textContent = 'Edit Employee';
            document.getElementById('employee-form-breadcrumb').textContent = 'Edit employee';
            
            document.getElementById('input-employee-name').value = user.fullName;
            document.getElementById('input-employee-phone').value = user.phone || '';
            document.getElementById('input-employee-salary').value = user.baseSalary || '';
            document.getElementById('input-employee-pay-method').value = user.paymentMethod || '';
            document.getElementById('input-employee-role').value = user.role;
            document.getElementById('input-employee-username').value = user.username;
            // Password shouldn't be populated for security
        }
    } catch (error) {
        console.error('Error fetching employee details:', error);
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`http://localhost:8080/api/v1/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            showToast('User deleted successfully', 'success');
            loadEmployees();
        } else {
            showToast('Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// ===============================
// Leads (Integrated)
// ===============================

async function loadLeads() {
    const search = document.getElementById('search-leads').value;
    const status = document.getElementById('filter-leads-status').value;
    
    let url = 'http://localhost:8080/api/v1/leads';
    if (status) {
        url = `http://localhost:8080/api/v1/leads/status/${status}`;
    }
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            let leads = data.content || [];
            
            if (search) {
                leads = leads.filter(l => l.fullName.toLowerCase().includes(search.toLowerCase()) || l.phoneNumber.includes(search));
            }
            
            renderLeadsTable(leads);
            loadLeadStats();
        }
    } catch (error) {
        console.error('Error loading leads:', error);
    }
}

async function loadLeadStats() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/leads/statistics', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('stat-total-leads').textContent = stats.total || 0;
            document.getElementById('stat-opened-leads').textContent = stats.pending || 0; // mapping pending to opened
            document.getElementById('stat-closed-leads').textContent = stats.closed || 0;
            document.getElementById('stat-enrolled-leads').textContent = stats.completed || 0; // mapping completed to enrolled
            // Some stats might not be in the basic API, but we'll show what we have
        }
    } catch (error) {
        console.error('Error loading lead stats:', error);
    }
}

function renderLeadsTable(leads) {
    const tbody = document.getElementById('leads-list-tbody');
    tbody.innerHTML = '';
    
    leads.forEach(l => {
        const row = document.createElement('tr');
        
        // Find Response 1 and Response 2 from followUps
        const followUps = l.followUps || [];
        const resp1 = followUps.find(f => f.sequence === 1);
        const resp2 = followUps.find(f => f.sequence === 2);
        
        const resp1Html = resp1 ? `
            <div class="response-cell">
                <span class="response-text">${resp1.message}</span>
                <span class="response-author">By: ${resp1.employeeName || 'Unknown'}</span>
            </div>
        ` : '-';

        const resp2Html = resp2 ? `
            <div class="response-cell">
                <span class="response-text">${resp2.message}</span>
                <span class="response-author">By: ${resp2.employeeName || 'Unknown'}</span>
            </div>
        ` : '-';

        row.innerHTML = `
            <td>${l.phoneNumber}</td>
            <td>${l.diploma ? l.diploma.title : '-'}</td>
            <td>${formatDate(l.createdAt)}</td>
            <td>${l.source || '-'}</td>
            <td>${l.teleSales ? l.teleSales.fullName : '-'}</td>
            <td>${resp1Html}</td>
            <td>${resp2Html}</td>
        `;
        tbody.appendChild(row);
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
