document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Set user info in header
    document.getElementById('display-user-name').textContent = userData.fullName || userData.username || 'User';

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

    // Navigation logic
    const dashboardView = document.getElementById('dashboard-view');
    const addDiplomaView = document.getElementById('add-diploma-view');
    
    document.getElementById('nav-home').addEventListener('click', (e) => {
        e.preventDefault();
        showView('dashboard-view');
        loadRounds();
    });

    document.getElementById('nav-diplomas').addEventListener('click', async (e) => {
        e.preventDefault();
        showView('diplomas-list-view');
        await populateDiplomaInstructorFilter();
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

    // Finance Submenu
    const navFinanceParent = document.getElementById('nav-finance-parent');
    const financeSubmenu = document.getElementById('finance-submenu');
    if (navFinanceParent) {
        navFinanceParent.addEventListener('click', (e) => {
            e.preventDefault();
            financeSubmenu.classList.toggle('show');
            const arrow = navFinanceParent.querySelector('.arrow');
            if (arrow) {
                arrow.classList.toggle('fa-chevron-down');
                arrow.classList.toggle('fa-chevron-right');
            }
        });
    }

    // Sales Submenu
    const navSalesParent = document.getElementById('nav-sales-parent');
    const salesSubmenu = document.getElementById('sales-submenu');
    if (navSalesParent) {
        navSalesParent.addEventListener('click', (e) => {
            e.preventDefault();
            salesSubmenu.classList.toggle('show');
            const arrow = navSalesParent.querySelector('.arrow');
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
    if (document.getElementById('search-invoices')) {
        document.getElementById('search-invoices').oninput = () => loadInvoices();
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

    if (document.getElementById('btn-add-invoice-nav')) {
        document.getElementById('btn-add-invoice-nav').addEventListener('click', () => {
            showView('add-invoice-view');
            initAddInvoiceForm();
        });
    }

    document.getElementById('nav-employees').addEventListener('click', (e) => {
        e.preventDefault();
        showView('employees-list-view');
        loadEmployees();
    });

    document.getElementById('btn-open-add-employee').addEventListener('click', () => {
        showView('add-employee-view');
        initAddEmployeeForm();
    });

    // Sales & Earnings navigation
    document.getElementById('nav-sales-list').addEventListener('click', (e) => {
        e.preventDefault();
        showView('sales-list-view');
        loadSalesUsers();
    });

    document.getElementById('btn-open-add-sales').addEventListener('click', () => {
        showView('add-sales-view');
        initAddSalesForm();
    });

    document.getElementById('nav-sales-earnings').addEventListener('click', (e) => {
        e.preventDefault();
        showView('sales-earnings-view');
        loadSalesEarnings();
    });

    if (document.getElementById('search-sales')) {
        document.getElementById('search-sales').oninput = () => loadSalesUsers();
    }
    if (document.getElementById('filter-sales-role')) {
        document.getElementById('filter-sales-role').onchange = () => loadSalesUsers();
    }
    if (document.getElementById('search-earnings')) {
        document.getElementById('search-earnings').oninput = () => loadSalesEarnings();
    }
    if (document.getElementById('filter-earnings-status')) {
        document.getElementById('filter-earnings-status').onchange = () => loadSalesEarnings();
    }
    if (document.getElementById('btn-recalculate-earnings')) {
        document.getElementById('btn-recalculate-earnings').onclick = () => recalculateEarnings();
    }
    document.getElementById('form-add-sales').onsubmit = (e) => {
        e.preventDefault();
        saveSalesUser();
    };
    document.getElementById('btn-cancel-sales').addEventListener('click', () => {
        showView('sales-list-view');
    });

    document.getElementById('nav-leads').addEventListener('click', (e) => {
        e.preventDefault();
        showView('leads-list-view');
        if (userData.role === 'MODERATOR') {
            loadModeratorLeads();
        } else if (userData.role === 'TELESALES') {
            loadTelesalesLeads();
        } else {
            loadLeads();
        }
    });

    document.getElementById('nav-work-hours').addEventListener('click', (e) => {
        e.preventDefault();
        showView('work-hours-view');
        loadWorkHours();
        loadWeeklyHours();
    });

    document.getElementById('nav-leaderboard').addEventListener('click', (e) => {
        e.preventDefault();
        showView('leaderboard-view');
        loadLeaderboard();
    });

    if (document.getElementById('search-leads')) {
        document.getElementById('search-leads').oninput = () => loadLeads();
    }
    if (document.getElementById('filter-leads-status')) {
        document.getElementById('filter-leads-status').onchange = () => loadLeads();
    }

    if (document.getElementById('mod-search-leads')) {
        document.getElementById('mod-search-leads').oninput = () => loadModeratorLeads();
    }
    if (document.getElementById('mod-filter-diploma')) {
        document.getElementById('mod-filter-diploma').onchange = () => loadModeratorLeads();
    }
    if (document.getElementById('mod-filter-status')) {
        document.getElementById('mod-filter-status').onchange = () => loadModeratorLeads();
    }

    // Finance Navigation
    document.getElementById('nav-finance-overview').addEventListener('click', (e) => {
        e.preventDefault();
        showView('finance-overview-view');
        loadFinanceOverview();
    });

    document.getElementById('nav-finance-salaries').addEventListener('click', (e) => {
        e.preventDefault();
        showView('finance-salaries-view');
        loadSalaries();
    });

    document.getElementById('nav-finance-expenses').addEventListener('click', (e) => {
        e.preventDefault();
        showView('finance-expenses-view');
        loadExpenses();
    });

    document.getElementById('nav-finance-revenue').addEventListener('click', (e) => {
        e.preventDefault();
        showView('finance-revenue-view');
        loadRevenue();
    });

    // Finance Controls
    if (document.getElementById('finance-overview-month')) {
        document.getElementById('finance-overview-month').onchange = () => loadFinanceOverview();
    }
    if (document.getElementById('finance-salaries-month')) {
        document.getElementById('finance-salaries-month').onchange = () => loadSalaries();
    }
    if (document.getElementById('finance-expenses-month')) {
        document.getElementById('finance-expenses-month').onchange = () => loadExpenses();
    }

    document.getElementById('btn-run-payroll').addEventListener('click', () => runPayroll());
    document.getElementById('btn-add-expense').addEventListener('click', () => {
        showView('add-expense-view');
        document.getElementById('expense-page-date').valueAsDate = new Date();
    });
    document.getElementById('btn-add-freelancer').addEventListener('click', () => {
        document.getElementById('add-freelancer-modal').style.display = 'flex';
    });

    document.getElementById('form-add-expense-page').onsubmit = (e) => {
        e.preventDefault();
        addExpenseFromPage();
    };

    // Load Initial Data
    if (userData.role === 'MODERATOR' || userData.role === 'TELESALES') {
        const hideIds = ['li-home', 'li-diplomas', 'li-rounds', 'li-instructors', 'li-students', 'li-invoices', 'li-sales', 'li-finance', 'li-employees'];
        hideIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const showIds = ['li-work-hours', 'li-leaderboard'];
        showIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'block';
        });

        if (userData.role === 'MODERATOR') {
            document.getElementById('leads-moderator-layout').style.display = 'block';
            document.getElementById('leads-admin-layout').style.display = 'none';
            if (document.getElementById('leads-telesales-layout')) {
                document.getElementById('leads-telesales-layout').style.display = 'none';
            }

            showView('leads-list-view');
            loadModeratorLeads();
            loadDiplomasForModeratorForm();
            setupModeratorListeners();
        } else { // TELESALES
            if (document.getElementById('leads-telesales-layout')) {
                document.getElementById('leads-telesales-layout').style.display = 'block';
            }
            document.getElementById('leads-admin-layout').style.display = 'none';
            document.getElementById('leads-moderator-layout').style.display = 'none';

            showView('leads-list-view');
            loadTelesalesLeads();
            loadDiplomasForTelesalesForm();
            setupTelesalesListeners();
        }
    } else {
        showView('dashboard-view');
        loadRounds();
    }

    // Apply custom styling to all existing and future select elements
    applyCustomSelects();
    
    // Apply flatpickr to all date inputs
    applyCustomDatePickers();
});

function showView(viewId) {
    document.querySelectorAll('.page-content').forEach(view => {
        view.style.display = 'none';
    });
    document.getElementById(viewId).style.display = 'block';
    
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.submenu').forEach(s => s.classList.remove('show'));

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
    } else if (viewId === 'sales-list-view' || viewId === 'add-sales-view' || viewId === 'sales-earnings-view') {
        const parent = document.getElementById('nav-sales-parent');
        if (parent) {
            parent.parentElement.classList.add('active');
            const submenu = document.getElementById('sales-submenu');
            if (submenu) submenu.classList.add('show');
        }
        if (viewId === 'sales-list-view' || viewId === 'add-sales-view') {
            const navLink = document.getElementById('nav-sales-list');
            if (navLink) navLink.classList.add('active');
        } else if (viewId === 'sales-earnings-view') {
            const navLink = document.getElementById('nav-sales-earnings');
            if (navLink) navLink.classList.add('active');
        }
    } else if (viewId === 'leads-list-view' || viewId === 'telesales-lead-details-view') {
        document.getElementById('nav-leads').parentElement.classList.add('active');
    } else if (viewId === 'work-hours-view') {
        document.getElementById('nav-work-hours').parentElement.classList.add('active');
    } else if (viewId === 'leaderboard-view') {
        document.getElementById('nav-leaderboard').parentElement.classList.add('active');
    } else if (viewId.startsWith('finance-')) {
        const parent = document.getElementById('nav-finance-parent');
        if (parent) {
            parent.classList.add('active');
            const submenu = parent.querySelector('.submenu');
            if (submenu) submenu.classList.add('show');
        }
        
        // Specific submenu link
        const navId = 'nav-' + viewId.replace('-view', '');
        const navLink = document.getElementById(navId);
        if (navLink) navLink.classList.add('active');
    }
}

async function loadRounds() {
    try {
        // Fetch rounds for grouping
        const roundsResponse = await fetch('http://localhost:8080/api/v2/rounds?size=100', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!roundsResponse.ok) throw new Error('Failed to fetch rounds');
        const roundsData = await roundsResponse.json();
        const rounds = roundsData.content || [];

        // Fetch round-diplomas for detailed installment data
        const diplomasResponse = await fetch('http://localhost:8080/api/v2/round-diplomas?size=200', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        let roundDiplomas = [];
        if (diplomasResponse.ok) {
            const diplomasData = await diplomasResponse.json();
            roundDiplomas = diplomasData.content || [];
        }

        // Group round-diplomas by roundId
        const diplomasByRound = {};
        roundDiplomas.forEach(rd => {
            if (!diplomasByRound[rd.roundId]) {
                diplomasByRound[rd.roundId] = [];
            }
            diplomasByRound[rd.roundId].push(rd);
        });

        // Merge: attach detailed diplomas to each round
        const enrichedRounds = rounds.map(round => ({
            ...round,
            detailedDiplomas: diplomasByRound[round.id] || []
        }));

        // Populate Diploma filter from v2 round-diplomas data
        const filterDiploma = document.getElementById('filter-diploma');
        filterDiploma.innerHTML = '<option value="">Diploma</option>';
        const uniqueDiplomas = {};
        roundDiplomas.forEach(rd => {
            if (rd.diplomaId && !uniqueDiplomas[rd.diplomaId]) {
                uniqueDiplomas[rd.diplomaId] = rd.diplomaName;
            }
        });
        Object.entries(uniqueDiplomas).forEach(([id, name]) => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = name;
            filterDiploma.appendChild(opt);
        });

        // Populate Round filter from v2 rounds data
        const filterRound = document.getElementById('filter-round');
        filterRound.innerHTML = '<option value="">Round</option>';
        rounds.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.name;
            filterRound.appendChild(opt);
        });

        // Also populate Rounds list filter
        const filterList = document.getElementById('filter-round-list-diploma');
        if (filterList) {
            filterList.innerHTML = '<option value="">Diploma</option>';
            Object.entries(uniqueDiplomas).forEach(([id, name]) => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = name;
                filterList.appendChild(opt);
            });
        }

        renderDashboardTable(enrichedRounds);
    } catch (error) {
        console.error('Error loading rounds:', error);
    }
}

async function loadDiplomas() {
    try {
        const response = await fetch('http://localhost:8080/api/v2/diplomas', {
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
        const diplomas = round.detailedDiplomas || [];
        // Round Group Header Row
        const groupRow = document.createElement('tr');
        groupRow.className = 'round-group-row';
        groupRow.style.cursor = 'pointer';
        groupRow.innerHTML = `
            <td>
                <div class="round-info">
                    <i class="fas fa-chevron-down round-toggle"></i>
                    <span>${round.name}</span>
                    <span class="start-date">Starts ${formatDate(round.startDate)}</span>
                    <span class="round-badge">${diplomas.length} diplomas</span>
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

        // Create diploma rows for this round
        const diplomaRows = [];
        if (diplomas.length > 0) {
            diplomas.forEach(d => {
                const diplomaRow = document.createElement('tr');
                diplomaRow.className = 'diploma-detail-row';
                diplomaRow.style.cursor = 'pointer'; // Make it clickable
                diplomaRow.innerHTML = `
                    <td></td>
                    <td>${d.diplomaName || d.name || '-'}</td>
                    <td>${d.currentEnrollment != null ? d.currentEnrollment : (d.totalStudents || '-')}</td>
                    <td>${renderInstallmentCell(d.installment1Date)}</td>
                    <td>${renderInstallmentCell(d.installment2Date)}</td>
                    <td>${renderInstallmentCell(d.installment3Date)}</td>
                    <td>${renderInstallmentCell(d.installment4Date)}</td>
                `;
                // Add click listener to open Delayed Students view
                diplomaRow.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent bubbling if needed
                    openDelayedStudents(d.id, d.diplomaName || d.name, round.name);
                });

                tbody.appendChild(diplomaRow);
                diplomaRows.push(diplomaRow);
            });
        }

        // Toggle collapse/expand on round header click
        groupRow.addEventListener('click', () => {
            const icon = groupRow.querySelector('.round-toggle');
            const isCollapsed = icon.classList.contains('fa-chevron-right');
            if (isCollapsed) {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-down');
                diplomaRows.forEach(row => row.style.display = '');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-right');
                diplomaRows.forEach(row => row.style.display = 'none');
            }
        });
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
        applyCustomDatePickers();
        
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

async function loadStudentsForInvoiceForm() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/students?page=0&size=500', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            const students = data.content || [];
            const select = document.getElementById('select-invoice-student');
            select.innerHTML = '<option value="">-- Choose a student to autofill Name & Phone --</option>';
            
            students.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.setAttribute('data-phone', s.phone || '');
                opt.textContent = `${s.name} (${s.phone || 'No Phone'})`;
                select.appendChild(opt);
            });
            
            select.onchange = () => {
                const selectedOpt = select.options[select.selectedIndex];
                if (selectedOpt && select.value !== '') {
                    const studentName = selectedOpt.textContent.split(' (')[0];
                    const studentPhone = selectedOpt.getAttribute('data-phone');
                    document.getElementById('input-invoice-name').value = studentName;
                    document.getElementById('input-invoice-phone').value = studentPhone;
                }
            };
        }
    } catch (error) {
        console.error('Error loading students for invoice dropdown:', error);
    }
}

function openAddInvoiceView() {
    showView('add-invoice-view');
    initAddInvoiceForm();
}

function initAddInvoiceForm() {
    const form = document.getElementById('form-add-invoice');
    form.reset();
    
    // Reset edit ID and title/breadcrumb to Add Mode
    document.getElementById('invoice-edit-id').value = '';
    document.getElementById('invoice-form-title').textContent = 'Add New Invoice';
    document.getElementById('invoice-form-breadcrumb').textContent = 'Add New invoice';
    
    // Clear student dropdown
    const studentSelect = document.getElementById('select-invoice-student');
    if (studentSelect) {
        studentSelect.innerHTML = '<option value="">-- Choose a student to autofill Name & Phone --</option>';
    }
    loadStudentsForInvoiceForm();
    
    document.getElementById('btn-cancel-invoice').onclick = () => showView('invoices-list-view');

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('invoice-edit-id').value;
        const payload = {
            invoiceDate: document.getElementById('input-invoice-date').value,
            amount: parseFloat(document.getElementById('input-invoice-amount').value),
            customerName: document.getElementById('input-invoice-name').value,
            customerPhone: document.getElementById('input-invoice-phone').value,
            notes: document.getElementById('input-invoice-notes').value
        };

        try {
            const url = id ? `http://localhost:8080/api/v2/invoices/${id}` : 'http://localhost:8080/api/v2/invoices';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast(id ? 'Invoice updated successfully!' : 'Invoice saved successfully!', 'success');
                showView('invoices-list-view');
                loadInvoices();
            } else {
                const err = await response.json();
                showToast('Error: ' + (err.message || 'Failed to save invoice'), 'error');
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            showToast('Error connecting to server', 'error');
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
                showToast('Invoice deleted successfully', 'success');
                loadInvoices();
            } else {
                showToast('Failed to delete invoice', 'error');
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            showToast('Error connecting to server', 'error');
        }
    }
}

async function editInvoice(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/v2/invoices/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const inv = await response.json();
            
            showView('add-invoice-view');
            
            document.getElementById('invoice-edit-id').value = inv.id;
            document.getElementById('invoice-form-title').textContent = 'Edit Invoice';
            document.getElementById('invoice-form-breadcrumb').textContent = 'Edit invoice';
            
            // Clear and load student options
            const studentSelect = document.getElementById('select-invoice-student');
            if (studentSelect) {
                studentSelect.innerHTML = '<option value="">-- Choose a student to autofill Name & Phone --</option>';
            }
            await loadStudentsForInvoiceForm();
            
            document.getElementById('input-invoice-date').value = inv.invoiceDate;
            document.getElementById('input-invoice-amount').value = inv.amount;
            document.getElementById('input-invoice-name').value = inv.customerName;
            document.getElementById('input-invoice-phone').value = inv.customerPhone;
            document.getElementById('input-invoice-notes').value = inv.notes || '';
            
            // Reapply flatpickr to ensure it's correctly updated if flatpickr is active
            applyCustomDatePickers();
        } else {
            showToast('Failed to load invoice details', 'error');
        }
    } catch (error) {
        console.error('Error loading invoice for edit:', error);
        showToast('Error connecting to server', 'error');
    }
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

async function populateDiplomaInstructorFilter() {
    try {
        const response = await fetch('http://localhost:8080/api/v2/instructors/all', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const instructors = await response.json();
            const select = document.getElementById('filter-diploma-instructor');
            // Store current value to re-select it if possible
            const currentVal = select.value;
            populateSelect('filter-diploma-instructor', instructors, 'name', 'id', 'Instructor');
            if (currentVal) select.value = currentVal;
        }
    } catch (error) {
        console.error('Error fetching instructors for filter:', error);
    }
}

async function loadDiplomasV2(page = 0) {
    const search = document.getElementById('search-diplomas-v2').value;
    const instructorId = document.getElementById('filter-diploma-instructor').value;
    
    let url = `http://localhost:8080/api/v2/round-diplomas?page=${page}&size=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (instructorId) url += `&instructorId=${instructorId}`;
    
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
        applyCustomDatePickers();
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
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[labelKey];
        select.appendChild(option);
    });
    
    // Notify custom select wrappers if they exist
    select.dispatchEvent(new Event('optionsChanged'));
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
        const saveBtn = document.querySelector('#form-add-diploma-v2 .btn-save');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.style.backgroundColor = '#ebb700';
            saveBtn.style.cursor = 'pointer';
        }
    } else {
        percentSpan.style.color = '#dc3545';
        amountSpan.style.color = '#dc3545';
        document.getElementById('v2-payment-summary').style.borderColor = '#dc3545';
        document.getElementById('v2-payment-summary').style.backgroundColor = '#fae3e5';
        const saveBtn = document.querySelector('#form-add-diploma-v2 .btn-save');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.style.backgroundColor = '#e0e0e0';
            saveBtn.style.cursor = 'not-allowed';
        }
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
    applyCustomDatePickers();
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
        const saveBtn = document.querySelector('#form-edit-diploma-v2 .btn-save');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.style.backgroundColor = '#ebb700';
            saveBtn.style.cursor = 'pointer';
        }
    } else {
        percentSpan.style.color = '#dc3545';
        amountSpan.style.color = '#dc3545';
        document.getElementById('edit-v2-payment-summary').style.borderColor = '#dc3545';
        document.getElementById('edit-v2-payment-summary').style.backgroundColor = '#fae3e5';
        const saveBtn = document.querySelector('#form-edit-diploma-v2 .btn-save');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.style.backgroundColor = '#e0e0e0';
            saveBtn.style.cursor = 'not-allowed';
        }
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
                applyDetailsFilters();
            };
            
            document.getElementById('filter-details-it-status').onchange = () => applyDetailsFilters();
            document.getElementById('filter-details-student-status').onchange = () => applyDetailsFilters();

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
            window.currentDiplomaStudentsV2 = data.content;
            applyDetailsFilters();
        }
    } catch (error) {
        console.error('Error loading diploma students:', error);
    }
}

function applyDetailsFilters() {
    let filtered = window.currentDiplomaStudentsV2 || [];
    const search = document.getElementById('search-details-students').value.toLowerCase();
    const itStatus = document.getElementById('filter-details-it-status').value;
    const studentStatus = document.getElementById('filter-details-student-status').value;

    if (search) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(search) || s.phone.includes(search));
    }
    if (itStatus !== '') {
        const hasIt = itStatus === 'true';
        filtered = filtered.filter(s => s.itStatus === hasIt);
    }
    if (studentStatus !== '') {
        filtered = filtered.filter(s => s.status === studentStatus);
    }
    
    renderDiplomaStudentsV2(filtered);
}

function renderDiplomaStudentsV2(students) {
    const tbody = document.getElementById('details-students-tbody');
    tbody.innerHTML = '';
    
    students.forEach(s => {
        const statusClass = s.status === 'ACTIVE' ? 'status-active' : s.status === 'CANCELLED' ? 'status-cancelled' : 'status-postponed';
        const formattedStatus = s.status ? s.status.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()) : '-';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.phone}</td>
            <td>
                <select class="inline-edit-select status-badge ${statusClass}" onchange="handleInlineStatusChange(this, ${s.id}, '${s.name}', '${s.status}')">
                    <option value="ACTIVE" ${s.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
                    <option value="POSTPONED" ${s.status === 'POSTPONED' ? 'selected' : ''}>Postponed</option>
                    <option value="CANCELLED" ${s.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                    <option value="FUTURE_ENROLLMENT" ${s.status === 'FUTURE_ENROLLMENT' ? 'selected' : ''}>Future Enrollment</option>
                </select>
            </td>
            <td><input type="checkbox" class="inline-checkbox" ${s.itStatus ? 'checked' : ''} onchange="handleInlineAccountChange(${s.id}, null, this.checked)"></td>
            <td>${s.email || '-'}</td>
            <td><input type="text" class="inline-edit-input" value="${s.password || ''}" placeholder="••••••••" onchange="handleInlineAccountChange(${s.id}, this.value, null)"></td>
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

async function handleInlineAccountChange(id, password, itStatus, status) {
    try {
        const student = window.currentDiplomaStudentsV2.find(s => s.id === id);
        if (!student) return;

        const body = {};
        if (password !== null) body.password = password;
        if (itStatus !== null) body.itStatus = itStatus;
        if (status !== null && status !== undefined) body.status = status;

        const response = await fetch(`http://localhost:8080/api/v2/students/${id}/account-info`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            showToast('Student info updated', 'success');
            if (password !== null) student.password = password;
            if (itStatus !== null) student.itStatus = itStatus;
            if (status !== null && status !== undefined) student.status = status;
            
            // If status changed, refresh table to show correct badges
            if (status !== null && status !== undefined) {
                renderDiplomaStudentsV2(window.currentDiplomaStudentsV2);
            }
        } else {
            showToast('Failed to update account info', 'error');
            // Revert UI by re-rendering
            renderDiplomaStudentsV2(window.currentDiplomaStudentsV2);
        }
    } catch (error) {
        console.error('Error updating account info:', error);
        showToast('Error connecting to server', 'error');
        renderDiplomaStudentsV2(window.currentDiplomaStudentsV2);
    }
}

function handleInlineStatusChange(selectElement, id, name, oldStatus) {
    const newStatus = selectElement.value;
    
    // Reset immediately to old status in the UI, wait for the actual operation to succeed before showing new status
    selectElement.value = oldStatus;

    if (newStatus === oldStatus) return;

    if (newStatus === 'CANCELLED') {
        cancelStudent(id, name);
    } else if (newStatus === 'POSTPONED') {
        postponeStudent(id, name);
    } else if (newStatus === 'ACTIVE' || newStatus === 'FUTURE_ENROLLMENT') {
        // Change status directly using the new endpoint
        handleInlineAccountChange(id, null, null, newStatus);
    }
}

async function restoreStudent(id) {
    if (!confirm('Are you sure you want to mark this student as Active?')) return;
    try {
        const response = await fetch(`http://localhost:8080/api/v2/students/${id}/restore`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            showToast('Student activated successfully', 'success');
            loadDiplomaStudentsV2(currentDetailsRoundDiplomaId);
        } else {
            showToast('Failed to activate student', 'error');
        }
    } catch (error) {
        console.error('Error restoring student:', error);
    }
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

let currentSessionDate = null;
let currentRoundDiplomaId = null;

function initAttendanceTab(roundDiplomaId) {
    roundDiplomaId = parseInt(roundDiplomaId);
    currentRoundDiplomaId = roundDiplomaId;
    console.log('[Attendance] initAttendanceTab called with roundDiplomaId:', roundDiplomaId, typeof roundDiplomaId);
    document.getElementById('sessions-list-container').style.display = 'block';
    document.getElementById('session-details-container').style.display = 'none';
    
    // Add New Session
    document.getElementById('btn-open-add-session').onclick = () => {
        document.getElementById('add-session-modal').style.display = 'flex';
    };
    document.getElementById('close-add-session-btn').onclick = () => {
        document.getElementById('add-session-modal').style.display = 'none';
    };
    document.getElementById('btn-cancel-add-session').onclick = () => {
        document.getElementById('add-session-modal').style.display = 'none';
    };
    
    document.getElementById('form-add-session').onsubmit = async (e) => {
        e.preventDefault();
        const date = document.getElementById('add-session-date').value;
        if (!date) return;
        
        // Save empty attendance for this date to create the session
        await createEmptySession(roundDiplomaId, date);
        document.getElementById('add-session-modal').style.display = 'none';
        document.getElementById('form-add-session').reset();
        
        // Reload sessions
        loadSessionsSummary(roundDiplomaId);
    };

    // Save Session Details
    document.getElementById('btn-save-session-details').onclick = () => {
        console.log('[Attendance] Save Changes clicked, currentSessionDate:', currentSessionDate);
        if (currentSessionDate) {
            saveSessionDetails(roundDiplomaId, currentSessionDate);
        }
    };
    
    loadSessionsSummary(roundDiplomaId);
}

async function createEmptySession(roundDiplomaId, date) {
    try {
        roundDiplomaId = parseInt(roundDiplomaId);
        console.log('[Attendance] createEmptySession called:', { roundDiplomaId, date });
        
        // We get students and send a bulk update with default values
        const stdResponse = await fetch(`http://localhost:8080/api/v2/students/round-diploma/${roundDiplomaId}?size=200`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const stdData = await stdResponse.json();
        const students = stdData.content;
        console.log('[Attendance] Found students:', students ? students.length : 0);
        
        if (!students || students.length === 0) {
            showToast('No students found for this diploma', 'error');
            return;
        }
        
        const records = students.map(s => ({
            studentId: s.id,
            status: 'PRESENT',
            taskSubmitted: false,
            notes: ''
        }));
        
        const payload = { roundDiplomaId: roundDiplomaId, date: date, records: records };
        console.log('[Attendance] Sending bulk POST payload:', JSON.stringify(payload));
        
        const response = await fetch('http://localhost:8080/api/v2/attendance/bulk', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('[Attendance] createEmptySession response status:', response.status);
        if (response.ok) {
            showToast('Session created successfully', 'success');
        } else {
            const errText = await response.text();
            console.error('[Attendance] createEmptySession failed:', response.status, errText);
            showToast('Failed to create session: ' + response.status, 'error');
        }
    } catch (e) {
        console.error('[Attendance] Failed to create empty session', e);
        showToast('Error creating session', 'error');
    }
}

async function loadSessionsSummary(roundDiplomaId) {
    try {
        const response = await fetch(`http://localhost:8080/api/v2/attendance/diploma/${roundDiplomaId}/sessions`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const summaries = await response.json();
            renderSessionsTable(summaries);
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

function renderSessionsTable(summaries) {
    const tbody = document.getElementById('sessions-tbody');
    tbody.innerHTML = '';
    
    summaries.forEach(s => {
        const attPercent = s.totalStudentsCount > 0 ? Math.round((s.attendedCount / s.totalStudentsCount) * 100) : 0;
        const taskPercent = s.totalStudentsCount > 0 ? Math.round((s.tasksSubmittedCount / s.totalStudentsCount) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(s.sessionDate)}</td>
            <td>${s.dayOfWeek.charAt(0) + s.dayOfWeek.slice(1).toLowerCase()}</td>
            <td class="session-stat">${s.attendedCount}/${s.totalStudentsCount} <span>(${attPercent}%)</span></td>
            <td class="session-stat">${s.tasksSubmittedCount}/${s.totalStudentsCount} <span>(${taskPercent}%)</span></td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="openSessionDetails('${s.sessionDate}')" title="View Details"><i class="fas fa-eye"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openSessionDetails(date) {
    currentSessionDate = date;
    document.getElementById('sessions-list-container').style.display = 'none';
    document.getElementById('session-details-container').style.display = 'block';
    
    // Update breadcrumb
    const diplomaName = document.getElementById('details-diploma-name-breadcrumb').textContent;
    document.querySelector('.breadcrumb').innerHTML = `
        <a href="#" onclick="showView('diplomas-list-view'); return false;">Diplomas</a> <i class="fas fa-chevron-right"></i> 
        <a href="#" onclick="showDiplomaDetails(${currentRoundDiplomaId}); return false;">${diplomaName}</a> <i class="fas fa-chevron-right"></i> 
        <span class="active">${formatDate(date)}</span>
    `;
    
    loadSessionDetails(currentRoundDiplomaId, date);
}

async function loadSessionDetails(roundDiplomaId, date) {
    try {
        const stdResponse = await fetch(`http://localhost:8080/api/v2/students/round-diploma/${roundDiplomaId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const stdData = await stdResponse.json();
        const students = stdData.content;

        const attResponse = await fetch(`http://localhost:8080/api/v2/attendance/diploma/${roundDiplomaId}?date=${date}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const attendanceRecords = await attResponse.json();

        renderSessionDetailsTable(students, attendanceRecords);
    } catch (error) {
        console.error('Error loading session details:', error);
    }
}

function renderSessionDetailsTable(students, records) {
    const tbody = document.getElementById('session-details-tbody');
    tbody.innerHTML = '';
    
    const recordMap = new Map(records.map(r => [r.studentId, r]));

    students.forEach(s => {
        const record = recordMap.get(s.id);
        const isPresent = record ? record.status === 'PRESENT' : false;
        const taskSubmitted = record ? record.taskSubmitted : false;
        const notes = record ? record.notes : '';

        const row = document.createElement('tr');
        row.dataset.studentId = s.id;
        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.phone}</td>
            <td class="clickable-cell" style="cursor: pointer; text-align: center;">
                <div class="custom-checkbox ${isPresent ? 'checked' : ''}" data-type="attendance"></div>
            </td>
            <td class="clickable-cell" style="cursor: pointer; text-align: center;">
                <div class="custom-checkbox ${taskSubmitted ? 'checked' : ''}" data-type="task"></div>
            </td>
            <td>
                <input type="text" class="note-input" value="${notes || ''}">
            </td>
        `;
        
        row.querySelectorAll('.clickable-cell').forEach(cell => {
            cell.onclick = (e) => {
                // If they clicked the input directly, it will also toggle it which is fine
                const cb = cell.querySelector('.custom-checkbox');
                if (cb) {
                    cb.classList.toggle('checked');
                }
            };
        });

        tbody.appendChild(row);
    });
}

async function saveSessionDetails(roundDiplomaId, date) {
    roundDiplomaId = parseInt(roundDiplomaId);
    const records = [];
    const rows = document.querySelectorAll('#session-details-tbody tr');
    
    rows.forEach(row => {
        const studentId = row.dataset.studentId;
        const isPresent = row.querySelector('.custom-checkbox[data-type="attendance"]').classList.contains('checked');
        const taskSubmitted = row.querySelector('.custom-checkbox[data-type="task"]').classList.contains('checked');
        const notes = row.querySelector('.note-input').value;
        
        records.push({
            studentId: parseInt(studentId),
            status: isPresent ? 'PRESENT' : 'ABSENT',
            taskSubmitted: taskSubmitted,
            notes: notes
        });
    });

    const payload = { roundDiplomaId: roundDiplomaId, date: date, records: records };
    console.log('[Attendance] saveSessionDetails payload:', JSON.stringify(payload));

    try {
        const response = await fetch('http://localhost:8080/api/v2/attendance/bulk', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('[Attendance] saveSessionDetails response status:', response.status);
        if (response.ok) {
            showToast('Session details saved successfully', 'success');
            // Background reload the session summary so it's fresh when user goes back
            loadSessionsSummary(roundDiplomaId);
        } else {
            const errText = await response.text();
            console.error('[Attendance] saveSessionDetails failed:', response.status, errText);
            showToast('Failed to save: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('[Attendance] Error saving session details:', error);
        showToast('Error saving session details', 'error');
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
            document.getElementById('stat-opened-leads').textContent = stats.opened !== undefined ? stats.opened : (stats.pending || 0);
            document.getElementById('stat-closed-leads').textContent = stats.closed || 0;
            document.getElementById('stat-enrolled-leads').textContent = stats.enrolled !== undefined ? stats.enrolled : (stats.completed || 0);
            document.getElementById('stat-countries-leads').textContent = stats.countries || 0;
            document.getElementById('stat-no-responses-leads').textContent = stats.noResponses || 0;
        }
    } catch (error) {
        console.error('Error loading lead stats:', error);
    }
}

// ==========================================
// Telesales Leads & Call Attempts Logic
// ==========================================

async function loadDiplomasForTelesalesForm() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/diplomas', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const diplomas = await response.json();
            const filterSelect = document.getElementById('tele-filter-diploma');
            if (filterSelect) {
                filterSelect.innerHTML = '<option value="">Diploma</option>';
                diplomas.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.id;
                    opt.textContent = d.name;
                    filterSelect.appendChild(opt);
                });
            }
        }
    } catch (e) {
        console.error("Error loading diplomas for telesales form:", e);
    }
}

async function loadTelesalesLeads(page = 0) {
    const search = document.getElementById('tele-search-leads').value;
    const diplomaId = document.getElementById('tele-filter-diploma').value;
    const status = document.getElementById('tele-filter-status').value;
    const attempts = document.getElementById('tele-filter-attempts').value;

    let url = `http://localhost:8080/api/v1/leads?page=${page}&size=50`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            let leads = data.content || [];

            // Filter ONLY those leads assigned to current Tele Sales user!
            leads = leads.filter(l => l.teleSales && l.teleSales.username === userData.username);

            // Client-side filtering
            if (search) {
                leads = leads.filter(l => l.phoneNumber.includes(search) || (l.moderatorNotes && l.moderatorNotes.toLowerCase().includes(search.toLowerCase())));
            }
            if (diplomaId) {
                leads = leads.filter(l => l.diploma && l.diploma.id == diplomaId);
            }
            if (status) {
                leads = leads.filter(l => l.status === status);
            }
            if (attempts !== "") {
                leads = leads.filter(l => {
                    const count = l.followUps ? l.followUps.length : 0;
                    return count == parseInt(attempts);
                });
            }

            renderTelesalesLeadsTable(leads);
            renderTelesalesLeadsPagination(data, page);
        }
    } catch (e) {
        console.error("Error loading telesales leads:", e);
    }
}

function renderTelesalesLeadsTable(leads) {
    const tbody = document.getElementById('tele-leads-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 25px; color: #888;">No leads assigned to you.</td></tr>';
        return;
    }

    leads.forEach(l => {
        const row = document.createElement('tr');
        const count = l.followUps ? l.followUps.length : 0;
        
        // Status Badges
        let statusBadge = '';
        if (l.status === 'OPEN') statusBadge = '<span class="status-pill open" style="background: #e8f5e9; color: #4caf50; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">Open</span>';
        else if (l.status === 'CLOSED') statusBadge = '<span class="status-pill closed" style="background: #ffebee; color: #f44336; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">Closed</span>';
        else if (l.status === 'ENROLLED') statusBadge = '<span class="status-pill enrolled" style="background: #e3f2fd; color: #2196f3; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">Enrolled</span>';
        else statusBadge = `<span class="status-pill other" style="background: #f5f5f5; color: #666; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">${l.status}</span>`;

        // Format Inquiry Date
        let dateStr = '-';
        if (l.createdAt) {
            const date = new Date(l.createdAt);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        }

        row.innerHTML = `
            <td style="padding: 15px; font-weight: 600; color: #333;">${l.phoneNumber}</td>
            <td style="padding: 15px; color: #555;">${l.diploma ? l.diploma.name : '-'}</td>
            <td style="padding: 15px; color: #666;">${dateStr}</td>
            <td style="padding: 15px; text-align: left;">${statusBadge}</td>
            <td style="padding: 15px; color: #777; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${l.moderatorNotes || '-'}</td>
            <td style="padding: 15px; text-align: center; font-weight: 600; color: #444;">${count}/3</td>
            <td style="padding: 15px; text-align: center;">
                <button onclick="viewTelesalesLead(${l.id})" style="background: #f5f5f5; border: 1px solid #ddd; width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #555; cursor: pointer; transition: all 0.2s;">
                    <i class="far fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderTelesalesLeadsPagination(data, currentPage) {
    const container = document.getElementById('tele-leads-pagination');
    if (!container) return;
    container.innerHTML = '';
    
    if (!data.totalPages || data.totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => loadTelesalesLeads(currentPage - 1);
    container.appendChild(prevBtn);

    // Page Numbers
    for (let i = 0; i < data.totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i + 1;
        pageBtn.onclick = () => loadTelesalesLeads(i);
        container.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === data.totalPages - 1;
    nextBtn.onclick = () => loadTelesalesLeads(currentPage + 1);
    container.appendChild(nextBtn);
}

function setupTelesalesListeners() {
    const search = document.getElementById('tele-search-leads');
    const dip = document.getElementById('tele-filter-diploma');
    const status = document.getElementById('tele-filter-status');
    const att = document.getElementById('tele-filter-attempts');

    if (search) search.oninput = () => loadTelesalesLeads();
    if (dip) dip.onchange = () => loadTelesalesLeads();
    if (status) status.onchange = () => loadTelesalesLeads();
    if (att) att.onchange = () => loadTelesalesLeads();

    const form = document.getElementById('form-add-call-attempt');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            submitTelesalesCallAttempt();
        };
    }

    const cancelBtn = document.getElementById('btn-cancel-call');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            showView('leads-list-view');
            loadTelesalesLeads();
        };
    }
}

async function viewTelesalesLead(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/leads/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const lead = await response.json();
            
            // Show details view
            showView('telesales-lead-details-view');

            // Populate lead info block
            document.getElementById('det-lead-phone').textContent = lead.phoneNumber || '-';
            document.getElementById('det-lead-diploma').textContent = lead.diploma ? lead.diploma.name : '-';
            document.getElementById('det-lead-notes').textContent = lead.moderatorNotes || '-';

            // Format Inquiry Date
            let dateStr = '-';
            if (lead.createdAt) {
                const date = new Date(lead.createdAt);
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
            }
            document.getElementById('det-lead-date').textContent = dateStr;

            // Status Badge
            let statusBadge = '';
            if (lead.status === 'OPEN') statusBadge = '<span class="status-pill open" style="background: #e8f5e9; color: #4caf50; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">Open</span>';
            else if (lead.status === 'CLOSED') statusBadge = '<span class="status-pill closed" style="background: #ffebee; color: #f44336; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">Closed</span>';
            else if (lead.status === 'ENROLLED') statusBadge = '<span class="status-pill enrolled" style="background: #e3f2fd; color: #2196f3; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">Enrolled</span>';
            else statusBadge = `<span class="status-pill other" style="background: #f5f5f5; color: #666; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">${lead.status}</span>`;
            
            document.getElementById('det-lead-status').innerHTML = statusBadge;

            // Follow-ups attempts count
            const followUps = lead.followUps || [];
            const count = followUps.length;
            document.getElementById('det-lead-attempts').textContent = `${count}/3`;

            // Set Call Attempt Form values
            document.getElementById('call-lead-id').value = lead.id;
            document.getElementById('call-date-input').valueAsDate = new Date();
            document.getElementById('call-response-input').value = '';
            document.getElementById('call-status-input').value = lead.status;

            // Manage attempts layout & banners
            const formFields = document.querySelectorAll('#form-add-call-attempt input, #form-add-call-attempt textarea, #form-add-call-attempt select, #form-add-call-attempt button');
            const saveBtn = document.getElementById('btn-save-call');
            if (count >= 3) {
                document.getElementById('call-attempts-info-banner').style.display = 'none';
                document.getElementById('call-attempts-max-banner').style.display = 'block';
                // Disable form fields
                formFields.forEach(f => {
                    if (f.id !== 'btn-cancel-call') f.disabled = true;
                });
                if (saveBtn) {
                    saveBtn.style.opacity = '0.5';
                    saveBtn.style.cursor = 'not-allowed';
                    saveBtn.disabled = true;
                }
            } else {
                document.getElementById('call-attempts-info-banner').style.display = 'block';
                document.getElementById('call-attempts-max-banner').style.display = 'none';
                // Enable form fields
                formFields.forEach(f => f.disabled = false);
                if (saveBtn) {
                    saveBtn.style.opacity = '1';
                    saveBtn.style.cursor = 'pointer';
                    saveBtn.disabled = false;
                }
            }

            // Populate Call History
            const tbody = document.getElementById('call-history-tbody');
            if (tbody) {
                tbody.innerHTML = '';

                if (followUps.length === 0) {
                    document.getElementById('no-calls-placeholder').style.display = 'flex';
                    document.getElementById('call-history-table-container').style.display = 'none';
                } else {
                    document.getElementById('no-calls-placeholder').style.display = 'none';
                    document.getElementById('call-history-table-container').style.display = 'block';

                    followUps.forEach(f => {
                        const row = document.createElement('tr');
                        
                        let fDateStr = '-';
                        if (f.createdAt) {
                            const date = new Date(f.createdAt);
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            fDateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
                        }

                        let fStatusBadge = '-';
                        if (f.status) {
                            if (f.status === 'OPEN') fStatusBadge = '<span class="status-pill open" style="background: #e8f5e9; color: #4caf50; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-block;">Open</span>';
                            else if (f.status === 'CLOSED') fStatusBadge = '<span class="status-pill closed" style="background: #ffebee; color: #f44336; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-block;">Closed</span>';
                            else if (f.status === 'ENROLLED') fStatusBadge = '<span class="status-pill enrolled" style="background: #e3f2fd; color: #2196f3; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-block;">Enrolled</span>';
                            else fStatusBadge = `<span class="status-pill other" style="background: #f5f5f5; color: #666; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-block;">${f.status}</span>`;
                        }

                        row.innerHTML = `
                            <td style="padding: 10px 15px; color: #555;">${fDateStr}</td>
                            <td style="padding: 10px 15px; color: #333;">${f.message}</td>
                            <td style="padding: 10px 15px;">${fStatusBadge}</td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            }
        }
    } catch (e) {
        console.error("Error loading lead details:", e);
    }
}

async function submitTelesalesCallAttempt() {
    const leadId = document.getElementById('call-lead-id').value;
    const callDate = document.getElementById('call-date-input').value;
    const responseText = document.getElementById('call-response-input').value;
    const status = document.getElementById('call-status-input').value;

    let customDate = null;
    if (callDate) {
        customDate = new Date(callDate).toISOString().split('.')[0];
    }

    const payload = {
        message: responseText,
        status: status,
        createdAt: customDate
    };

    try {
        const response = await fetch(`http://localhost:8080/api/v1/leads/${leadId}/follow-ups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Call attempt added successfully', 'success');
            viewTelesalesLead(leadId);
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to save call attempt', 'error');
        }
    } catch (e) {
        console.error("Error submitting call attempt:", e);
        showToast('Connection error, failed to save call attempt', 'error');
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

// ===============================
// Finance (Integrated)
// ===============================

let breakdownChart = null;
let revenueChart = null;

async function loadFinanceOverview() {
    const month = document.getElementById('finance-overview-month').value;
    try {
        const response = await fetch(`http://localhost:8080/api/v1/finance/overview?month=${month}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            const totalRevenue = data.totalRevenue || 0;
            const collectedRevenue = data.collectedRevenue || 0;
            const pendingRevenue = data.pendingRevenue || 0;
            const netProfit = data.netProfit || 0;

            document.getElementById('finance-total-revenue').textContent = totalRevenue.toLocaleString();
            document.getElementById('finance-collected-revenue').textContent = collectedRevenue.toLocaleString();
            document.getElementById('finance-pending-revenue').textContent = pendingRevenue.toLocaleString();
            document.getElementById('finance-net-profit').textContent = netProfit.toLocaleString();
            
            document.getElementById('breakdown-total-val').textContent = totalRevenue.toLocaleString();
            
            renderFinanceCharts(data);
            renderTopRevenueTable(data.topRevenueDiplomas || [
                { diploma: 'Graphic Design Diploma', revenue: 125000, percentage: 45 },
                { diploma: 'Full Stack Web Development', revenue: 95000, percentage: 32 },
                { diploma: 'Digital Marketing', revenue: 55000, percentage: 23 }
            ]);
        }
    } catch (error) {
        console.error('Error loading finance overview:', error);
    }
}

function renderFinanceCharts(data) {
    const breakdownCtx = document.getElementById('financial-breakdown-chart').getContext('2d');
    if (breakdownChart) breakdownChart.destroy();
    
    const breakdownData = data.financialBreakdown || {};
    const labels = Object.keys(breakdownData);
    const values = Object.values(breakdownData);
    
    breakdownChart = new Chart(breakdownCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#ebb700', '#222222', '#444444', '#888888', '#aaaaaa'],
                borderWidth: 5,
                borderColor: '#ffffff',
                hoverOffset: 10
            }]
        },
        options: { 
            cutout: '75%', 
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: { 
                    backgroundColor: '#000',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    displayColors: false
                }
            } 
        }
    });

    // Update legend
    const legend = document.getElementById('breakdown-legend');
    legend.innerHTML = '';
    const total = values.reduce((a, b) => a + b, 0);
    labels.forEach((l, i) => {
        const perc = total > 0 ? Math.round((values[i] / total) * 100) : 0;
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.justifyContent = 'space-between';
        item.style.fontSize = '0.85rem';
        item.style.padding = '4px 0';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${breakdownChart.data.datasets[0].backgroundColor[i]}"></span>
                <span style="color: #666;">${l}</span>
            </div>
            <div style="display: flex; gap: 15px;">
                <strong style="color: #333;">${values[i].toLocaleString()}</strong>
                <span style="color: #999; min-width: 30px; text-align: right;">${perc}%</span>
            </div>
        `;
        legend.appendChild(item);
    });

    const revenueCtx = document.getElementById('revenue-expenses-chart').getContext('2d');
    if (revenueChart) revenueChart.destroy();
    
    const chartPoints = data.revenueVsExpenses || [];
    revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: chartPoints.length > 0 ? chartPoints.map(p => p.label) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                { 
                    label: 'Revenue', 
                    data: chartPoints.length > 0 ? chartPoints.map(p => p.revenue) : [130000, 145000, 110000, 215000, 205000, 230000, 245000], 
                    borderColor: '#ebb700', 
                    backgroundColor: '#ebb700',
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#ebb700'
                },
                { 
                    label: 'Expenses', 
                    data: chartPoints.length > 0 ? chartPoints.map(p => p.expenses) : [95000, 75000, 68000, 48000, 38000, 95000, 35000], 
                    borderColor: '#666', 
                    backgroundColor: '#666',
                    tension: 0.4, 
                    borderDash: [5, 5],
                    pointRadius: 4,
                    pointBackgroundColor: '#666'
                }
            ]
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f5f5f5', drawBorder: false },
                    ticks: { 
                        color: '#999',
                        font: { size: 10, weight: '600' },
                        callback: value => value >= 1000 ? (value / 1000) + 'K' : value
                    },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: '#999',
                        font: { size: 10, weight: '600' }
                    },
                    border: { display: false }
                }
            }
        }
    });
}

function renderTopRevenueTable(diplomas) {
    const tbody = document.getElementById('top-revenue-tbody');
    tbody.innerHTML = '';
    diplomas.forEach(d => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #f8f9fa';
        row.innerHTML = `
            <td style="padding: 15px 12px; font-size: 0.9rem; color: #555;">${d.diploma}</td>
            <td style="padding: 15px 12px; font-size: 0.9rem; font-weight: 600; color: #333;">${d.revenue.toLocaleString()}</td>
            <td style="padding: 15px 12px; text-align: right; font-size: 0.9rem; color: #666;">${d.percentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

async function loadSalaries() {
    const month = document.getElementById('finance-salaries-month').value;
    try {
        const response = await fetch(`http://localhost:8080/api/v1/finance/salaries?month=${month}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const salaries = await response.json();
            renderSalariesTable(salaries);
            
            const total = salaries.reduce((acc, s) => acc + s.total, 0);
            const paid = salaries.reduce((acc, s) => acc + s.payed, 0);
            document.getElementById('salaries-total-payroll').textContent = total.toLocaleString();
            document.getElementById('salaries-paid-amount').textContent = paid.toLocaleString();
            document.getElementById('salaries-remaining-amount').textContent = (total - paid).toLocaleString();
        }
    } catch (error) {
        console.error('Error loading salaries:', error);
    }
}

function renderSalariesTable(salaries) {
    const tbody = document.getElementById('salaries-tbody');
    tbody.innerHTML = '';
    salaries.forEach(s => {
        const typeClass = (s.employmentType || '').toLowerCase().includes('freelance') ? 'freelance' : 'full-time';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="font-weight: 600; color: #333;">${s.employeeName}</span></td>
            <td>${s.role}</td>
            <td><span class='badge ${typeClass}'>${s.employmentType || 'Full time'}</span></td>
            <td>${(s.salary || 0).toLocaleString()}</td>
            <td>${(s.bonus || 0).toLocaleString()}</td>
            <td>${(s.overtime || 0).toLocaleString()}</td>
            <td><span style="font-weight: 700;">${(s.total || 0).toLocaleString()}</span></td>
            <td>${s.phone || '-'}</td>
            <td>${s.payMethod || '-'}</td>
            <td style='color: #2e7d32; font-weight: 700;'>${(s.payed || 0).toLocaleString()}</td>
            <td style='color: #d32f2f; font-weight: 700;'>${(s.remaining || 0).toLocaleString()}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class='action-btn edit' style='background: #e3f2fd; color: #1976d2; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;'><i class='fas fa-pencil-alt'></i></button>
                    ${typeClass === 'freelance' ? `<button class='action-btn delete' style='background: #ffebee; color: #d32f2f; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;'><i class='fas fa-trash-alt'></i></button>` : ''}
                </div>
            </td>` ;
        tbody.appendChild(row);
    });
}

async function runPayroll() {
    const month = document.getElementById('finance-salaries-month').value;
    try {
        const response = await fetch(`http://localhost:8080/api/v1/finance/salaries/run-payroll?month=${month}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            showToast('Payroll generated successfully', 'success');
            loadSalaries();
        } else {
            const err = await response.json();
            if (err.error === 'ALREADY_EXISTS') {
                document.getElementById('payroll-exists-modal').style.display = 'flex';
            } else {
                showToast('Failed to run payroll', 'error');
            }
        }
    } catch (error) {
        console.error('Error running payroll:', error);
    }
}

async function loadExpenses() {
    const month = document.getElementById('finance-expenses-month').value;
    try {
        const response = await fetch(`http://localhost:8080/api/v1/finance/expenses?month=${month}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const expenses = await response.json();
            renderExpensesTable(expenses);
            
            const total = expenses.reduce((acc, e) => acc + e.amount, 0);
            const paid = expenses.reduce((acc, e) => acc + e.payed, 0);
            document.getElementById('expenses-total-amount').textContent = total.toLocaleString();
            document.getElementById('expenses-paid-amount').textContent = paid.toLocaleString();
            document.getElementById('expenses-remaining-amount').textContent = (total - paid).toLocaleString();
        }
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}

function renderExpensesTable(expenses) {
    const tbody = document.getElementById('expenses-tbody');
    tbody.innerHTML = '';
    expenses.forEach(e => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${e.title}</td>
            <td>${(e.amount || 0).toLocaleString()}</td>
            <td style='color: #4caf50;'>${(e.payed || 0).toLocaleString()}</td>
            <td style='color: #f44336;'>${(e.remaining || 0).toLocaleString()}</td>
            <td>${e.payMethod || '-'}</td>
            <td>${formatDate(e.date)}</td>
            <td>${e.note || '-'}</td>
            <td>
                <button class='btn-save' style='padding: 5px 10px; background: #e3f2fd; color: #2196f3;'><i class='fas fa-edit'></i></button>
            </td>`;
        tbody.appendChild(row);
    });
}

async function addExpense() {
    const expense = {
        title: document.getElementById('expense-title').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
        paidAmount: parseFloat(document.getElementById('expense-paid').value),
        paymentMethod: document.getElementById('expense-pay-method').value,
        expenseDate: document.getElementById('expense-date').value,
        note: document.getElementById('expense-note').value
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/finance/expenses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expense)
        });
        if (response.ok) {
            showToast('Expense added successfully', 'success');
            document.getElementById('add-expense-modal').style.display = 'none';
            loadExpenses();
        }
    } catch (error) {
        console.error('Error adding expense:', error);
    }
}

async function addExpenseFromPage() {
    const expense = {
        title: document.getElementById('expense-page-title').value,
        amount: parseFloat(document.getElementById('expense-page-amount').value),
        paidAmount: 0,
        paymentMethod: document.getElementById('expense-page-pay-method').value,
        expenseDate: document.getElementById('expense-page-date').value,
        note: document.getElementById('expense-page-note').value
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/finance/expenses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expense)
        });
        if (response.ok) {
            showToast('Expense added successfully', 'success');
            showView('finance-expenses-view');
            loadExpenses();
        }
    } catch (error) {
        console.error('Error adding expense from page:', error);
    }
}

async function loadRevenue() {
    const month = document.getElementById('finance-revenue-month').value;
    try {
        const response = await fetch(`http://localhost:8080/api/v1/finance/overview?month=${month}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            const total = data.totalRevenue || 0;
            const collected = data.collectedRevenue || 0;
            const pending = data.pendingRevenue || 0;

            document.getElementById('revenue-total-amount').textContent = total.toLocaleString();
            document.getElementById('revenue-collected-amount').textContent = collected.toLocaleString();
            document.getElementById('revenue-pending-amount').textContent = pending.toLocaleString();
            
            renderRevenueTable([
                { total: 55000, diploma: 'Interior Design & Decoration - Offline', payed: 30000, remaining: 25000 },
                { total: 55000, diploma: 'Interior Design & Decoration - Offline', payed: 55000, remaining: 0 },
                { total: 55000, diploma: 'Interior Design & Decoration - Offline', payed: 30000, remaining: 25000 },
                { total: 55000, diploma: 'Interior Design & Decoration - Offline', payed: 30000, remaining: 25000 }
            ]);
        }
    } catch (error) {
        console.error('Error loading revenue:', error);
    }
}

function renderRevenueTable(records) {
    const tbody = document.getElementById('revenue-tbody');
    tbody.innerHTML = '';
    records.forEach(r => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 15px;">${(r.total || 0).toLocaleString()}</td>
            <td style="padding: 15px;">${r.diploma || '-'}</td>
            <td style="padding: 15px; color: #4caf50; font-weight: 600;">${(r.payed || 0).toLocaleString()}</td>
            <td style="padding: 15px; color: #ebb700; font-weight: 600;">${(r.remaining || 0).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// ==========================================
// Moderator Logic & Dynamic Bindings
// ==========================================
function setupModeratorListeners() {
    const leadForm = document.getElementById('form-moderator-add-lead');
    if (leadForm) {
        leadForm.onsubmit = async (e) => {
            e.preventDefault();
            await submitModeratorAddLead();
        };
    }

    const hoursForm = document.getElementById('form-work-hours-entry');
    if (hoursForm) {
        hoursForm.onsubmit = async (e) => {
            e.preventDefault();
            await submitAttendanceEntry();
        };
    }
    
    // Set default date to today in forms
    const leadDate = document.getElementById('mod-lead-date');
    if (leadDate) leadDate.valueAsDate = new Date();
    
    const hoursDate = document.getElementById('attendance-entry-date');
    if (hoursDate) hoursDate.valueAsDate = new Date();
}

async function loadDiplomasForModeratorForm() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/diplomas', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const diplomas = await response.json();
            const formSelect = document.getElementById('mod-lead-diploma');
            const filterSelect = document.getElementById('mod-filter-diploma');
            
            formSelect.innerHTML = '<option value="" disabled selected>Select diploma</option>';
            filterSelect.innerHTML = '<option value="">Diploma</option>';
            
            diplomas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.name;
                formSelect.appendChild(opt.cloneNode(true));
                filterSelect.appendChild(opt.cloneNode(true));
            });
        }
    } catch (e) {
        console.error("Error loading diplomas for moderator form:", e);
    }
}

async function loadModeratorLeads(page = 0) {
    const search = document.getElementById('mod-search-leads').value;
    const diplomaId = document.getElementById('mod-filter-diploma').value;
    const status = document.getElementById('mod-filter-status').value;

    let url = `http://localhost:8080/api/v1/leads?page=${page}&size=10`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            let leads = data.content || [];

            // Client-side filtering
            if (search) {
                leads = leads.filter(l => l.phoneNumber.includes(search) || (l.moderatorNotes && l.moderatorNotes.toLowerCase().includes(search.toLowerCase())));
            }
            if (diplomaId) {
                leads = leads.filter(l => l.diploma && l.diploma.id == diplomaId);
            }
            if (status) {
                leads = leads.filter(l => l.status === status);
            }

            renderModeratorLeadsTable(leads);
            renderModeratorLeadsPagination(data, page);
        }
    } catch (e) {
        console.error("Error loading moderator leads:", e);
    }
}

function renderModeratorLeadsTable(leads) {
    const tbody = document.getElementById('mod-leads-tbody');
    tbody.innerHTML = '';

    if (leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: #888;">No leads found.</td></tr>';
        return;
    }

    leads.forEach(l => {
        const row = document.createElement('tr');
        const statusClass = (l.status || 'OPEN').toLowerCase();
        
        row.innerHTML = `
            <td style="padding: 12px; font-weight: 600;">${l.phoneNumber}</td>
            <td style="padding: 12px;">${l.diploma ? l.diploma.name : '-'}</td>
            <td style="padding: 12px;">${formatDate(l.createdAt)}</td>
            <td style="padding: 12px; text-align: center;">
                <span class="status-pill ${statusClass}">${l.status || 'OPEN'}</span>
            </td>
            <td style="padding: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${l.moderatorNotes || '-'}</td>
            <td style="padding: 12px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="btn-action edit" onclick="editModeratorLead(${l.id})" style="background: #e3f2fd; border-radius: 50%; width: 32px; height: 32px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1976d2;"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn-action delete" onclick="deleteModeratorLead(${l.id})" style="background: #ffebee; border-radius: 50%; width: 32px; height: 32px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #dc3545;"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function submitModeratorAddLead() {
    const phone = document.getElementById('mod-lead-phone').value;
    const date = document.getElementById('mod-lead-date').value;
    const diplomaId = document.getElementById('mod-lead-diploma').value;
    const status = document.getElementById('mod-lead-status').value;
    const notes = document.getElementById('mod-lead-notes').value;

    const payload = {
        fullName: "Lead (" + phone + ")",
        phoneNumber: phone,
        diplomaId: parseInt(diplomaId),
        status: status,
        moderatorNotes: notes,
        source: 'MODERATOR_ENTRY'
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/leads/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Lead added successfully', 'success');
            document.getElementById('form-moderator-add-lead').reset();
            document.getElementById('mod-lead-date').valueAsDate = new Date();
            loadModeratorLeads();
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to add lead', 'error');
        }
    } catch (e) {
        console.error("Error submitting lead:", e);
        showToast('An error occurred while saving lead', 'error');
    }
}

async function editModeratorLead(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/leads/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const l = await response.json();
            document.getElementById('mod-lead-phone').value = l.phoneNumber;
            document.getElementById('mod-lead-diploma').value = l.diploma ? l.diploma.id : '';
            document.getElementById('mod-lead-status').value = l.status || 'OPEN';
            document.getElementById('mod-lead-notes').value = l.moderatorNotes || '';
            document.getElementById('form-moderator-add-lead').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (e) {
        console.error("Error loading lead edit:", e);
    }
}

async function deleteModeratorLead(id) {
    if (!confirm('Are you sure you want to delete this lead? Only Admins can execute deletes.')) return;
    try {
        const response = await fetch(`http://localhost:8080/api/v1/leads/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            showToast('Lead deleted successfully', 'success');
            loadModeratorLeads();
        } else {
            showToast('Only admins have delete permissions', 'error');
        }
    } catch (e) {
        console.error("Error deleting lead:", e);
        showToast('Unauthorized operation', 'error');
    }
}

function renderModeratorLeadsPagination(data, currentPage) {
    const container = document.getElementById('mod-leads-pagination');
    container.innerHTML = '';
    if (!data || data.totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => loadModeratorLeads(currentPage - 1);
    container.appendChild(prevBtn);

    for (let i = 0; i < data.totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
        btn.textContent = i + 1;
        btn.onclick = () => loadModeratorLeads(i);
        container.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === data.totalPages - 1;
    nextBtn.onclick = () => loadModeratorLeads(currentPage + 1);
    container.appendChild(nextBtn);
}

// Work Hours
async function loadWorkHours(page = 0) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/attendance/my-attendance?page=${page}&size=10`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            renderWorkHoursTable(data.content || []);
            renderWorkHoursPagination(data, page);
        }
    } catch (e) {
        console.error("Error loading work hours:", e);
    }
}

function renderWorkHoursTable(entries) {
    const tbody = document.getElementById('work-hours-tbody');
    tbody.innerHTML = '';

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px; color: #888;">No work hours entry logged yet.</td></tr>';
        return;
    }

    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 15px;">${formatDate(entry.date)}</td>
            <td style="padding: 15px; font-weight: 600;">${entry.totalHours} hrs</td>
            <td style="padding: 15px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="btn-action edit" onclick="editAttendance(${entry.id})" style="background: #e3f2fd; border-radius: 50%; width: 32px; height: 32px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1976d2;"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn-action delete" onclick="deleteAttendance(${entry.id})" style="background: #ffebee; border-radius: 50%; width: 32px; height: 32px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #dc3545;"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function loadWeeklyHours() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/attendance/weekly-hours', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            document.getElementById('weekly-hours-val').textContent = (data.weeklyHours || 0) + " hrs";
        }
    } catch (e) {
        console.error("Error loading weekly hours:", e);
    }
}

async function submitAttendanceEntry() {
    const id = document.getElementById('attendance-edit-id').value;
    const date = document.getElementById('attendance-entry-date').value;
    const hours = document.getElementById('attendance-entry-hours').value;

    const payload = {
        date: date,
        totalHours: parseFloat(hours)
    };

    let url = 'http://localhost:8080/api/v1/attendance';
    let method = 'POST';

    if (id) {
        url = `http://localhost:8080/api/v1/attendance/${id}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast(id ? 'Work hour entry updated' : 'Work hour entry added', 'success');
            document.getElementById('form-work-hours-entry').reset();
            document.getElementById('attendance-edit-id').value = '';
            document.getElementById('attendance-entry-date').valueAsDate = new Date();
            document.getElementById('btn-submit-attendance-text').textContent = 'Add Entry';
            loadWorkHours();
            loadWeeklyHours();
        } else {
            showToast('Failed to save entry', 'error');
        }
    } catch (e) {
        console.error("Error saving attendance entry:", e);
        showToast('An error occurred', 'error');
    }
}

async function editAttendance(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/attendance/my-attendance?size=100`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            const record = data.content.find(r => r.id === id);
            if (record) {
                document.getElementById('attendance-edit-id').value = record.id;
                document.getElementById('attendance-entry-date').value = record.date;
                document.getElementById('attendance-entry-hours').value = record.totalHours;
                document.getElementById('btn-submit-attendance-text').textContent = 'Save changes';
                document.getElementById('form-work-hours-entry').scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (e) {
        console.error("Error setting up edit form:", e);
    }
}

async function deleteAttendance(id) {
    if (!confirm('Are you sure you want to delete this work hours log?')) return;

    try {
        const response = await fetch(`http://localhost:8080/api/v1/attendance/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            showToast('Hours entry deleted', 'success');
            loadWorkHours();
            loadWeeklyHours();
        } else {
            showToast('Failed to delete entry', 'error');
        }
    } catch (e) {
        console.error("Error deleting attendance:", e);
    }
}

function renderWorkHoursPagination(data, currentPage) {
    const container = document.getElementById('work-hours-pagination');
    container.innerHTML = '';
    if (!data || data.totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => loadWorkHours(currentPage - 1);
    container.appendChild(prevBtn);

    for (let i = 0; i < data.totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
        btn.textContent = i + 1;
        btn.onclick = () => loadWorkHours(i);
        container.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === data.totalPages - 1;
    nextBtn.onclick = () => loadWorkHours(currentPage + 1);
    container.appendChild(nextBtn);
}

// Leaderboard
async function loadLeaderboard() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/leads/leaderboard', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const list = await response.json();
            
            const first = list[0] || { fullName: 'No moderator', leadCount: 0 };
            const second = list[1] || { fullName: 'No moderator', leadCount: 0 };
            const third = list[2] || { fullName: 'No moderator', leadCount: 0 };

            document.getElementById('podium-1-name').textContent = first.fullName;
            document.getElementById('podium-1-count').textContent = first.leadCount + " leads";
            document.getElementById('podium-1-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(first.fullName)}&background=ebb700&color=fff&size=100`;

            document.getElementById('podium-2-name').textContent = second.fullName;
            document.getElementById('podium-2-count').textContent = second.leadCount + " leads";
            document.getElementById('podium-2-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(second.fullName)}&background=0088cc&color=fff&size=80`;

            document.getElementById('podium-3-name').textContent = third.fullName;
            document.getElementById('podium-3-count').textContent = third.leadCount + " leads";
            document.getElementById('podium-3-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(third.fullName)}&background=f4511e&color=fff&size=80`;

            const tbody = document.getElementById('leaderboard-tbody');
            tbody.innerHTML = '';

            const remaining = list.slice(3);
            if (remaining.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px; color: #888;">No other rankings.</td></tr>';
                return;
            }

            remaining.forEach((m, idx) => {
                const rank = idx + 4;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 15px; font-weight: 700;">#${rank}</td>
                    <td style="padding: 15px;">${m.fullName}</td>
                    <td style="padding: 15px; text-align: right; font-weight: 600;">${m.leadCount}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (e) {
        console.error("Error loading leaderboard:", e);
    }
}

// Function to convert standard selects into custom styled dropdowns globally
function applyCustomSelects() {
    document.querySelectorAll('.control-item.select').forEach(wrapper => {
        if (wrapper.dataset.customized) return;
        wrapper.dataset.customized = "true";

        const select = wrapper.querySelector('select');
        if (!select) return;

        select.style.display = 'none';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'custom-select-text';
        textSpan.textContent = select.options[select.selectedIndex]?.text || '';
        
        // Insert textSpan before the chevron
        const chevron = wrapper.querySelector('.chevron');
        if (chevron) {
            wrapper.insertBefore(textSpan, chevron);
        } else {
            wrapper.appendChild(textSpan);
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'custom-select-dropdown';
        wrapper.appendChild(dropdown);

        const updateDropdown = () => {
            dropdown.innerHTML = '';
            Array.from(select.options).forEach(opt => {
                const item = document.createElement('div');
                item.className = 'custom-select-item';
                item.textContent = opt.text;
                if (opt.selected) item.classList.add('selected');
                
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    select.value = opt.value;
                    textSpan.textContent = opt.text;
                    dropdown.classList.remove('show');
                    wrapper.classList.remove('active');
                    select.dispatchEvent(new Event('change'));
                });
                dropdown.appendChild(item);
            });
        };

        updateDropdown();

        // Listen for dynamic option updates
        select.addEventListener('optionsChanged', () => {
            updateDropdown();
            textSpan.textContent = select.options[select.selectedIndex]?.text || '';
        });

        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasActive = wrapper.classList.contains('active');
            
            // Close all other custom selects
            document.querySelectorAll('.control-item.select.active').forEach(w => {
                w.classList.remove('active');
                w.querySelector('.custom-select-dropdown')?.classList.remove('show');
            });

            if (!wasActive) {
                updateDropdown();
                dropdown.classList.add('show');
                wrapper.classList.add('active');
            }
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
            wrapper.classList.remove('active');
        });

        // Sync text when options change via code (e.g. loadRounds filling the filter)
        const observer = new MutationObserver(() => {
            textSpan.textContent = select.options[select.selectedIndex]?.text || '';
            updateDropdown();
        });
        observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['value'] });
    });
}

// --------------------------------------------------------------------------------------
// Delayed Students / Diploma Details View Logic
// --------------------------------------------------------------------------------------

async function openDelayedStudents(roundDiplomaId, diplomaName, roundName) {
    showView('delayed-students-view');
    
    // Optional: update the title to reflect the specific diploma
    // const titleEl = document.getElementById('delayed-students-title');
    // if (titleEl) titleEl.textContent = `Students: ${diplomaName} - ${roundName}`;
    
    try {
        const response = await fetch(`http://localhost:8080/api/v2/students/round-diploma/${roundDiplomaId}?size=100`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch students for diploma');

        const data = await response.json();
        renderDelayedStudentsTable(data.content || []);
    } catch (error) {
        console.error('Error loading diploma students:', error);
        renderDelayedStudentsTable([]);
    }
}

function renderDelayedStudentsTable(students) {
    const tbody = document.getElementById('delayed-students-tbody');
    tbody.innerHTML = '';

    if (!students || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">No students found for this diploma.</td></tr>';
        return;
    }

    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        tr.style.fontSize = '14px';

        // Placeholder logic for IT checkbox and Password since they are not in the response
        const dummyPassword = 'Xdk1!01F3-8V\\paKh';
        const notes = student.notes || 'No notes';

        tr.innerHTML = `
            <td style="padding: 15px; color: #333; font-weight: 500;">${student.name || '-'}</td>
            <td style="padding: 15px; color: #555;">${student.phone || '-'}</td>
            <td style="padding: 15px; text-align: center;"><input type="checkbox" style="width:16px; height:16px; accent-color: var(--primary-color);"></td>
            <td style="padding: 15px; color: #555;">${student.email || '-'}</td>
            <td style="padding: 15px; color: #555;">${dummyPassword}</td>
            <td style="padding: 15px; color: #777;">${notes}</td>
            <td style="padding: 15px; color: #333;">${student.roundName || '-'}</td>
            <td style="padding: 15px; color: #333;">${student.diplomaName || '-'}</td>
        `;

        tbody.appendChild(tr);
    });
}

// Function to initialize flatpickr on all date inputs
function applyCustomDatePickers() {
    if (typeof flatpickr !== 'undefined') {
        flatpickr('input[type="date"]', {
            dateFormat: 'Y-m-d',
            disableMobile: true
        });
    }
}

// ==========================================
// Sales & Earnings Management Logic
// ==========================================

let cachedSalesUsers = [];

async function loadSalesUsers() {
    const search = document.getElementById('search-sales').value.toLowerCase();
    const role = document.getElementById('filter-sales-role').value;
    
    try {
        const response = await fetch('http://localhost:8080/api/v1/users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const allUsers = await response.json();
            
            // Filter to include TELESALES and MODERATOR roles
            let salesUsers = allUsers.filter(u => u.role === 'TELESALES' || u.role === 'MODERATOR');
            
            // Apply search filter
            if (search) {
                salesUsers = salesUsers.filter(u => 
                    u.fullName.toLowerCase().includes(search) || 
                    (u.phone && u.phone.includes(search))
                );
            }
            
            // Apply role filter
            if (role) {
                salesUsers = salesUsers.filter(u => u.role === role);
            }
            
            cachedSalesUsers = salesUsers;
            renderSalesTable(salesUsers);
        } else {
            showToast('Failed to load sales users', 'error');
        }
    } catch (error) {
        console.error('Error loading sales users:', error);
        showToast('Error loading sales users', 'error');
    }
}

function renderSalesTable(users) {
    const tbody = document.getElementById('sales-list-tbody');
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color: #888;">No sales users found.</td></tr>';
        return;
    }
    
    users.forEach(u => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${u.fullName}</td>
            <td>${u.phone || '-'}</td>
            <td>${u.role === 'TELESALES' ? 'Tele sales' : 'Moderator'}</td>
            <td>${u.baseSalary || '0'} EGP</td>
            <td>${u.commission || '0'}%</td>
            <td>${u.paymentMethod || '-'}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="editSalesUser(${u.id})" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="btn-action delete" onclick="deleteSalesUser(${u.id})" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function initAddSalesForm() {
    const form = document.getElementById('form-add-sales');
    form.reset();
    document.getElementById('sales-edit-id').value = '';
    document.getElementById('sales-form-title').textContent = 'Add New Sales';
    document.getElementById('sales-form-breadcrumb').textContent = 'Add new sales';
    
    const passwordInput = document.getElementById('input-sales-password');
    passwordInput.required = true;
    document.getElementById('sales-password-help').textContent = '';
}

async function editSalesUser(id) {
    const user = cachedSalesUsers.find(u => u.id === id);
    if (!user) return;
    
    showView('add-sales-view');
    document.getElementById('sales-edit-id').value = user.id;
    document.getElementById('sales-form-title').textContent = `Edit "${user.fullName}"`;
    document.getElementById('sales-form-breadcrumb').textContent = 'Edit sales';
    
    document.getElementById('input-sales-name').value = user.fullName;
    document.getElementById('input-sales-phone').value = user.phone || '';
    document.getElementById('input-sales-salary').value = user.baseSalary || '';
    document.getElementById('input-sales-commission').value = user.commission || '';
    document.getElementById('input-sales-pay-method').value = user.paymentMethod || '';
    document.getElementById('input-sales-role').value = user.role;
    document.getElementById('input-sales-username').value = user.username;
    
    const passwordInput = document.getElementById('input-sales-password');
    passwordInput.value = '';
    passwordInput.required = false;
    document.getElementById('sales-password-help').textContent = 'Leave blank to keep current password';
}

async function saveSalesUser() {
    const id = document.getElementById('sales-edit-id').value;
    const username = document.getElementById('input-sales-username').value;
    
    const payload = {
        username: username,
        fullName: document.getElementById('input-sales-name').value,
        phone: document.getElementById('input-sales-phone').value,
        role: document.getElementById('input-sales-role').value,
        baseSalary: parseFloat(document.getElementById('input-sales-salary').value),
        commission: parseFloat(document.getElementById('input-sales-commission').value),
        paymentMethod: document.getElementById('input-sales-pay-method').value,
        password: document.getElementById('input-sales-password').value,
        email: username + "@direction.academy" // Autogenerated unique email
    };
    
    try {
        let url = 'http://localhost:8080/api/auth/register';
        let method = 'POST';
        
        if (id) {
            url = `http://localhost:8080/api/v1/users/${id}`;
            method = 'PUT';
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
            showToast(id ? 'Sales user updated successfully' : 'Sales user registered successfully', 'success');
            showView('sales-list-view');
            loadSalesUsers();
        } else {
            const err = await response.json();
            showToast(err.message || 'Error saving sales user', 'error');
        }
    } catch (error) {
        console.error('Error saving sales user:', error);
        showToast('Error saving sales user', 'error');
    }
}

async function deleteSalesUser(id) {
    if (!confirm('Are you sure you want to delete this sales user?')) return;
    
    try {
        const response = await fetch(`http://localhost:8080/api/v1/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            showToast('Sales user deleted successfully', 'success');
            loadSalesUsers();
        } else {
            showToast('Failed to delete sales user', 'error');
        }
    } catch (error) {
        console.error('Error deleting sales user:', error);
        showToast('Error deleting sales user', 'error');
    }
}

// Earnings Logic

async function loadSalesEarnings() {
    const search = document.getElementById('search-earnings').value.toLowerCase();
    const status = document.getElementById('filter-earnings-status').value;
    
    try {
        let url = 'http://localhost:8080/api/v1/earnings';
        const params = [];
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (status) params.push(`status=${encodeURIComponent(status)}`);
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            const earnings = await response.json();
            renderSalesEarningsTable(earnings);
        } else {
            showToast('Failed to load earnings', 'error');
        }
    } catch (error) {
        console.error('Error loading earnings:', error);
        showToast('Error loading earnings', 'error');
    }
}

function renderSalesEarningsTable(earnings) {
    const tbody = document.getElementById('sales-earnings-tbody');
    tbody.innerHTML = '';
    
    if (earnings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color: #888;">No earnings records found.</td></tr>';
        return;
    }
    
    earnings.forEach(e => {
        const row = document.createElement('tr');
        
        const isPaid = e.status === 'PAID';
        const statusBadge = isPaid
            ? '<span style="background: #e8f5e9; color: #4caf50; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">Paid</span>'
            : '<span style="background: #fff8e1; color: #ebb700; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block;">Pending</span>';
            
        const paymentDateStr = e.paymentDate ? e.paymentDate : '-';
        
        const actionButton = isPaid
            ? `<button class="btn-action edit" onclick="toggleEarningStatus(${e.id}, 'PENDING')" title="Revert to Pending" style="background-color: #f5f5f5; color: #666; border: 1px solid #ddd; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 500;"><i class="fas fa-undo"></i> Revert</button>`
            : `<button class="btn-action save" onclick="toggleEarningStatus(${e.id}, 'PAID')" title="Mark as Paid" style="background-color: #ebb700; color: #000; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;"><i class="fas fa-check"></i> Mark Paid</button>`;
            
        row.innerHTML = `
            <td>${e.telesalesName}</td>
            <td>${e.telesalesPhone || '-'}</td>
            <td>${e.totalClients || 0}</td>
            <td>${e.commissionAmount || 0} EGP</td>
            <td>${statusBadge}</td>
            <td>${paymentDateStr}</td>
            <td>${actionButton}</td>
        `;
        tbody.appendChild(row);
    });
}

async function toggleEarningStatus(id, newStatus) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/earnings/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showToast(newStatus === 'PAID' ? 'Commission marked as paid' : 'Earning reverted to pending', 'success');
            loadSalesEarnings();
        } else {
            showToast('Failed to update payment status', 'error');
        }
    } catch (error) {
        console.error('Error toggling earning status:', error);
        showToast('Error updating payment status', 'error');
    }
}

async function recalculateEarnings() {
    try {
        const btn = document.getElementById('btn-recalculate-earnings');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        }
        
        const response = await fetch('http://localhost:8080/api/v1/earnings/calculate', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            showToast('Earnings recalculated successfully', 'success');
            loadSalesEarnings();
        } else {
            showToast('Failed to calculate earnings', 'error');
        }
    } catch (error) {
        console.error('Error recalculating earnings:', error);
        showToast('Error calculating earnings', 'error');
    } finally {
        const btn = document.getElementById('btn-recalculate-earnings');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync"></i> Calculate Earnings';
        }
    }
}

