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

    // Invoices Navigation
    document.getElementById('nav-invoices').addEventListener('click', (e) => {
        e.preventDefault();
        showView('invoices-list-view');
        loadInvoices();
    });

    document.getElementById('btn-add-invoice-nav').addEventListener('click', () => {
        showView('add-invoice-view');
        initAddInvoiceForm();
    });

    if (document.getElementById('search-invoices')) {
        document.getElementById('search-invoices').oninput = () => loadInvoices();
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

async function initAddStudentForm() {
    const form = document.getElementById('form-add-student');
    form.reset();
    
    document.getElementById('btn-cancel-student').onclick = () => showView('future-enrollments-view');

    // Load Rounds, Diplomas, and Sales
    await loadOptionsForStudentForm();

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
                alert('Student enrolled successfully!');
                showView('future-enrollments-view');
                loadFutureEnrollments();
            }
        } catch (error) {
            console.error('Error enrolling student:', error);
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
