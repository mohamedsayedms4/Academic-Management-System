const PAGE_SIZE = 5; // Global pagination size

// Monkey-patch fetch to prevent aggressive caching on GET requests
const originalFetch = window.fetch;
window.fetch = function () {
    let [resource, config] = arguments;
    if (typeof resource === 'string' && resource.includes('/api/') && (!config || !config.method || config.method.toUpperCase() === 'GET')) {
        config = config || {};
        config.cache = 'no-store';
        arguments[1] = config;
    }
    return originalFetch.apply(this, arguments);
};
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
        loadRounds(0);
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
        });
    }

    // Finance Submenu
    const navFinanceParent = document.getElementById('nav-finance-parent');
    const financeSubmenu = document.getElementById('finance-submenu');
    if (navFinanceParent) {
        navFinanceParent.addEventListener('click', (e) => {
            e.preventDefault();
            financeSubmenu.classList.toggle('show');
        });
    }

    // Sales Submenu
    const navSalesParent = document.getElementById('nav-sales-parent');
    const salesSubmenu = document.getElementById('sales-submenu');
    if (navSalesParent) {
        navSalesParent.addEventListener('click', (e) => {
            e.preventDefault();
            salesSubmenu.classList.toggle('show');
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

        // Show correct layout per role
        const adminLayout = document.getElementById('leads-admin-layout');
        const modLayout = document.getElementById('leads-moderator-layout');
        const teleLayout = document.getElementById('leads-telesales-layout');

        if (userData.role === 'MODERATOR') {
            if (adminLayout) adminLayout.style.display = 'none';
            if (modLayout) modLayout.style.display = 'block';
            if (teleLayout) teleLayout.style.display = 'none';
            setupModeratorListeners();
            loadDiplomasForModeratorForm();
            loadModeratorLeads();
        } else if (userData.role === 'TELESALES') {
            if (adminLayout) adminLayout.style.display = 'none';
            if (modLayout) modLayout.style.display = 'none';
            if (teleLayout) teleLayout.style.display = 'block';
            loadDiplomasForTelesalesForm();
            setupTelesalesListeners();
            loadTelesalesLeads();
        } else {
            // ADMIN or default
            if (adminLayout) adminLayout.style.display = 'block';
            if (modLayout) modLayout.style.display = 'none';
            if (teleLayout) teleLayout.style.display = 'none';
            loadLeads();
        }
    });

    // Admin "Add Lead" button
    const btnAddLeadAdmin = document.getElementById('btn-open-add-lead-admin');
    if (btnAddLeadAdmin) btnAddLeadAdmin.onclick = () => openAddLeadModal('admin');

    // Initialize modal listeners
    initAddLeadModalListeners();
    initLeadDetailModalListeners();

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
        setInputDate('expense-page-date');
    });
    document.getElementById('btn-add-freelancer').addEventListener('click', () => {
        document.getElementById('add-freelancer-modal').style.display = 'flex';
    });

    // Payroll Modal Listeners
    const payrollModal = document.getElementById('payroll-exists-modal');
    if (payrollModal) {
        const closeModalBtn = payrollModal.querySelector('.close-modal');
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => payrollModal.style.display = 'none');
        const viewBtn = document.getElementById('btn-view-payroll');
        if (viewBtn) viewBtn.addEventListener('click', () => payrollModal.style.display = 'none');
        const regenBtn = document.getElementById('btn-regenerate-payroll');
        if (regenBtn) regenBtn.addEventListener('click', () => payrollModal.style.display = 'none');
    }

    // Add Freelancer Submit
    const formAddFreelancer = document.getElementById('form-add-freelancer');
    if (formAddFreelancer) {
        formAddFreelancer.onsubmit = async (e) => {
            e.preventDefault();
            const payload = {
                fullName: document.getElementById('freelancer-name').value,
                phone: document.getElementById('freelancer-phone').value,
                baseSalary: parseFloat(document.getElementById('freelancer-salary').value),
                paymentMethod: document.getElementById('freelancer-pay-method').value,
                role: document.getElementById('freelancer-role').value.trim() || 'FREELANCER',
                employmentType: 'Freelance',
                targetMonth: document.getElementById('finance-salaries-month') ? document.getElementById('finance-salaries-month').value : null,
                active: true,
                username: document.getElementById('freelancer-name').value.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
                email: document.getElementById('freelancer-name').value.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000) + '@freelance.local',
                password: 'password123'
            };

            try {
                const response = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    showToast('Freelancer added successfully', 'success');
                    document.getElementById('add-freelancer-modal').style.display = 'none';
                    formAddFreelancer.reset();
                    loadSalaries(); // Refresh table
                } else {
                    const err = await response.json();
                    showToast(err.message || 'Failed to add freelancer', 'error');
                }
            } catch (error) {
                console.error('Error adding freelancer:', error);
                showToast('An error occurred', 'error');
            }
        };
    }

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
        loadRounds(0);
    }

    // Homepage Filters
    const searchDashboard = document.getElementById('search-dashboard');
    const filterDiploma = document.getElementById('filter-diploma');
    const filterRound = document.getElementById('filter-round');

    if (searchDashboard) {
        searchDashboard.addEventListener('input', () => {
            loadRounds(0);
        });
    }
    if (filterDiploma) {
        filterDiploma.addEventListener('change', () => {
            loadRounds(0);
        });
    }
    if (filterRound) {
        filterRound.addEventListener('change', () => {
            loadRounds(0);
        });
    }

    // Apply custom styling to all existing and future select elements
    applyCustomSelects();

    // Apply flatpickr to all date inputs
    applyCustomDatePickers();

    // Setup export to excel buttons
    document.querySelectorAll('.btn-export').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const view = btn.closest('.page-content');
            if (view) {
                const table = view.querySelector('table');
                if (table) {
                    const title = view.querySelector('h1')?.textContent || 'Export';
                    exportTableToCSV(table, `${title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`);
                } else {
                    showToast('No data to export', 'error');
                }
            }
        });
    });
});

// ==========================================
// Export to CSV Functionality
// ==========================================
function exportTableToCSV(table, filename) {
    let csv = [];
    const rows = table.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll('td, th');

        // Skip rows that are hidden
        if (rows[i].style.display === 'none') continue;

        for (let j = 0; j < cols.length; j++) {
            // Skip the action column typically containing buttons
            if (cols[j].innerText.trim() === 'Actions' || cols[j].innerText.trim() === 'Action' || cols[j].querySelector('.btn-action') || cols[j].querySelector('button')) {
                // If it's header, skip it and remember index to skip data? Let's just skip by checking content.
                // However, a data cell might not have a button. 
                // A simpler way: if the header says 'Actions', we should skip that index.
                // For now, let's just extract innerText and clean it up.
            }

            // Clean up the text by replacing double quotes with double-double quotes
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, ' ').replace(/"/g, '""');
            row.push('"' + data.trim() + '"');
        }
        csv.push(row.join(','));
    }

    downloadCSV(csv.join('\n'), filename);
}

function downloadCSV(csv, filename) {
    let csvFile;
    let downloadLink;

    // CSV file with BOM for UTF-8 (Arabic support)
    const BOM = '\uFEFF';
    csvFile = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

    downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

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

    // Apply data-label attributes for mobile card tables
    setTimeout(applyTableDataLabels, 100);
}

/**
 * Scans all .modern-table and .dashboard-table elements and sets
 * data-label on every <td> matching the corresponding <th> text.
 * This powers the CSS ::before label in mobile card view.
 */
function applyTableDataLabels() {
    document.querySelectorAll('.modern-table, .dashboard-table').forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        if (!headers.length) return;
        table.querySelectorAll('tbody tr').forEach(row => {
            Array.from(row.querySelectorAll('td')).forEach((td, i) => {
                if (headers[i]) td.setAttribute('data-label', headers[i]);
            });
        });
    });
}

// Watch for dynamic table changes and re-apply labels automatically
(function setupTableLabelObserver() {
    const observer = new MutationObserver(() => applyTableDataLabels());
    observer.observe(document.body, { childList: true, subtree: true });
}());

async function loadRounds(page = 0) {
    try {
        // Fetch rounds (fetch a larger size e.g. 150 to do reliable client-side search & filtering)
        const roundsResponse = await fetch(`${API_BASE}/api/v2/rounds?size=150`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!roundsResponse.ok) throw new Error('Failed to fetch rounds');
        const roundsData = await roundsResponse.json();
        const rounds = roundsData.content || [];

        // Fetch round-diplomas (fetch a larger size e.g. 500)
        const diplomasResponse = await fetch(`${API_BASE}/api/v2/round-diplomas?size=500`, {
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
        let enrichedRounds = rounds.map(round => ({
            ...round,
            detailedDiplomas: diplomasByRound[round.id] || []
        }));

        // Populate Diploma filter from v2 round-diplomas data only once
        const filterDiploma = document.getElementById('filter-diploma');
        if (filterDiploma && filterDiploma.options.length <= 1) {
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
        }

        // Populate Round filter from v2 rounds data only once
        const filterRound = document.getElementById('filter-round');
        if (filterRound && filterRound.options.length <= 1) {
            filterRound.innerHTML = '<option value="">Round</option>';
            rounds.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = r.name;
                filterRound.appendChild(opt);
            });
        }

        // Also populate Rounds list filter if present and empty
        const filterList = document.getElementById('filter-round-list-diploma');
        if (filterList && filterList.options.length <= 1) {
            filterList.innerHTML = '<option value="">Diploma</option>';
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
                filterList.appendChild(opt);
            });
        }

        // Get filter inputs
        const searchTerm = (document.getElementById('search-dashboard')?.value || '').toLowerCase().trim();
        const selectedDiplomaId = document.getElementById('filter-diploma')?.value || '';
        const selectedRoundId = document.getElementById('filter-round')?.value || '';

        // Apply filters
        enrichedRounds = enrichedRounds.filter(round => {
            // Round filter
            if (selectedRoundId && round.id.toString() !== selectedRoundId) {
                return false;
            }

            // Diploma filter
            if (selectedDiplomaId) {
                const hasMatchingDiploma = round.detailedDiplomas.some(rd => rd.diplomaId && rd.diplomaId.toString() === selectedDiplomaId);
                if (!hasMatchingDiploma) return false;
                // Keep only matching diplomas inside the round
                round.detailedDiplomas = round.detailedDiplomas.filter(rd => rd.diplomaId && rd.diplomaId.toString() === selectedDiplomaId);
            }

            // Search filter
            if (searchTerm) {
                const matchesRoundName = round.name.toLowerCase().includes(searchTerm);
                const matchingDiplomas = round.detailedDiplomas.filter(d =>
                    (d.diplomaName || d.name || '').toLowerCase().includes(searchTerm)
                );

                if (matchesRoundName || matchingDiplomas.length > 0) {
                    if (!matchesRoundName) {
                        round.detailedDiplomas = matchingDiplomas;
                    }
                    return true;
                }
                return false;
            }

            return true;
        });

        // Paginate the filtered results on client-side
        const totalItems = enrichedRounds.length;
        const totalPages = Math.ceil(totalItems / PAGE_SIZE);
        const pagedRounds = enrichedRounds.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

        renderDashboardTable(pagedRounds);

        // Render dynamic pagination
        const paginationContainer = document.getElementById('dashboard-pagination');
        if (paginationContainer) {
            if (totalItems <= PAGE_SIZE) {
                paginationContainer.innerHTML = '';
            } else {
                const paginationData = {
                    number: page,
                    totalPages: totalPages,
                    first: page === 0,
                    last: page === totalPages - 1 || totalPages === 0
                };
                renderPagination('dashboard-pagination', paginationData, (newPage) => loadRounds(newPage));
            }
        }
    } catch (error) {
        console.error('Error loading rounds:', error);
    }
}

async function loadDiplomas() {
    try {
        const response = await fetch(`${API_BASE}/api/v2/diplomas`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const diplomas = await response.json();

            // Populate Home filter
            const filterHome = document.getElementById('filter-diploma');
            if (filterHome) filterHome.innerHTML = '<option value="">Diploma</option>';

            // Populate Rounds list filter
            const filterList = document.getElementById('filter-round-list-diploma');
            if (filterList) filterList.innerHTML = '<option value="">Diploma</option>';

            diplomas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.name;

                if (filterHome) filterHome.appendChild(opt.cloneNode(true));
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
            <td colspan="7">
                <div class="round-info">
                    <i class="fas fa-chevron-down round-toggle"></i>
                    <span>${round.name}</span>
                    <span class="start-date">Starts ${formatDate(round.startDate)}</span>
                    <span class="round-badge">${diplomas.length} diplomas</span>
                </div>
            </td>
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
    let statusLabelText = 'Upcoming';
    let badgeHtml = '';

    if (date < today) {
        // Mocking some delayed and some paid for visual variety
        const random = Math.random();
        if (random > 0.7) {
            statusClass = 'delayed';
            statusIcon = 'fas fa-triangle-exclamation';
            const count = Math.floor(Math.random() * 5) + 1;
            statusLabelText = `${count} delayed`;
            badgeHtml = `<span class="delayed-count">${count}</span>`;
        } else {
            statusClass = 'paid';
            statusIcon = 'fas fa-check';
            statusLabelText = 'All payed';
        }
    }

    return `
        <div class="status-cell">
            <span class="status-date">${formatDate(dateStr)}</span>
            <span class="status-label ${statusClass}">
                <i class="${statusIcon}"></i>
                <span>${statusLabelText}</span>
                ${badgeHtml}
            </span>
        </div>
    `;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function setInputDate(elementOrId, date = new Date()) {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;
    try {
        if (el.type === 'date') {
            el.valueAsDate = date;
        } else {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            el.value = `${year}-${month}-${day}`;
        }
    } catch (e) {
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            el.value = `${year}-${month}-${day}`;
        } catch (err) {
            console.error('Failed to set date value:', err);
        }
    }
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
            const roundResp = await fetch(`${API_BASE}/api/v1/rounds/${roundId}`, {
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

            const response = await fetch(`${API_BASE}/api/v1/rounds/${roundId}`, {
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
    const response = await fetch(`${API_BASE}/api/v1/diplomas`, {
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
    const response = await fetch(`${API_BASE}/api/v1/rounds?size=${PAGE_SIZE}`, {
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
    const response = await fetch(`${API_BASE}/api/v1/users/role/EMPLOYEE`, {
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

async function loadRoundsList(page = 0) {
    try {
        const response = await fetch(`${API_BASE}/api/v2/rounds?page=${page}&size=${PAGE_SIZE}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch rounds');
        const data = await response.json();
        renderRoundsListTable(data.content || []);
        renderPagination('rounds-list-pagination', data, loadRoundsList);
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
    // Load diplomas for the dropdown
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
            const response = await fetch(`${API_BASE}/api/v2/rounds`, {
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

    // Close dropdown when clicking outside — remove old listener first to prevent stacking
    if (window._roundDropdownClickHandler) {
        document.removeEventListener('click', window._roundDropdownClickHandler);
    }
    window._roundDropdownClickHandler = () => {
        dropdown.classList.remove('show');
        trigger.classList.remove('active');
    };
    document.addEventListener('click', window._roundDropdownClickHandler);

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
        const response = await fetch(`${API_BASE}/api/v2/diplomas`, {
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
    if (!await showDeleteModal('Delete this round?')) return;

    try {
        const response = await fetch(`${API_BASE}/api/v2/rounds/${id}`, {
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

async function editRound(id) {
    try {
        const response = await fetch(`${API_BASE}/api/v2/rounds/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch round details');
        const round = await response.json();

        // Show the view first
        showView('add-round-view');
        document.querySelector('#add-round-view h1').textContent = 'Edit Round';
        const submitBtn = document.querySelector('#form-add-round button[type="submit"]');
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Round';

        // Wire up dropdown toggle, search, and load diplomas list
        initAddRoundForm();

        // Populate the form fields after loading
        document.getElementById('input-round-name').value = round.name;
        document.getElementById('input-round-start-date').value = round.startDate || '';
        document.getElementById('input-round-end-date').value = round.endDate || '';
        // Get diploma IDs from the round response
        let diplomaIds = [];
        if (round.diplomas && round.diplomas.length > 0) {
            diplomaIds = round.diplomas.map(d => d.id);
        }

        // Fallback: fetch from round-diplomas API if round.diplomas is empty
        if (diplomaIds.length === 0) {
            try {
                const rdRes = await fetch(`${API_BASE}/api/v2/round-diplomas?size=500`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (rdRes.ok) {
                    const rdData = await rdRes.json();
                    diplomaIds = (rdData.content || [])
                        .filter(rd => rd.roundId === round.id)
                        .map(rd => rd.diplomaId);
                }
            } catch (e) {
                console.warn('Could not fetch round-diplomas for pre-selection:', e);
            }
        }

        // Pre-select diplomas that belong to this round
        document.querySelectorAll('.diploma-checkbox').forEach(cb => {
            cb.checked = diplomaIds.includes(parseInt(cb.value)) || diplomaIds.includes(cb.value.toString());
        });
        updateSelectedDiplomasText();

        // Override form submission to use PUT (after initAddRoundForm set it to POST)
        const form = document.getElementById('form-add-round');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const selectedDiplomaIds = Array.from(document.querySelectorAll('.diploma-checkbox:checked'))
                .map(cb => parseInt(cb.value));

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
                const putRes = await fetch(`${API_BASE}/api/v2/rounds/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(payload)
                });

                if (putRes.ok) {
                    alert('Round updated successfully!');
                    showView('rounds-list-view');
                    loadRoundsList();
                    document.querySelector('#add-round-view h1').textContent = 'Add New Round';
                    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Round';
                    initAddRoundForm();
                    form.reset();
                } else {
                    const err = await putRes.json();
                    alert('Error: ' + (err.message || 'Failed to update round'));
                }
            } catch (error) {
                console.error('Error updating round:', error);
                alert('An error occurred.');
            }
        };

        // Cancel button resets to add mode
        document.getElementById('btn-cancel-round').onclick = () => {
            showView('rounds-list-view');
            document.querySelector('#add-round-view h1').textContent = 'Add New Round';
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Round';
            initAddRoundForm();
            form.reset();
        };

    } catch (error) {
        console.error('Error fetching round:', error);
        alert('Failed to load round data for editing.');
    }
}


async function loadDiplomasList() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/diplomas`, {
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

async function editDiploma(id) {
    alert('For full editing capabilities, please use the modern Diplomas V2 view.');
}

async function deleteDiploma(id) {
    if (await showDeleteModal('Delete this diploma?')) {
        try {
            const response = await fetch(`${API_BASE}/api/v1/diplomas/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                alert('Diploma deleted successfully');
                loadDiplomasList();
            } else {
                alert('Failed to delete diploma');
            }
        } catch (error) {
            console.error('Error deleting diploma:', error);
            alert('An error occurred.');
        }
    }
}

// ===============================
// Instructors (V2)
// ===============================

async function loadInstructors(page = 0) {
    const search = document.getElementById('search-instructors').value;
    const diplomaId = document.getElementById('filter-instructor-diploma').value;

    let url = `${API_BASE}/api/v2/instructors?page=${page}&size=${PAGE_SIZE}`;
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
            const response = await fetch(`${API_BASE}/api/v2/instructors`, {
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
        const response = await fetch(`${API_BASE}/api/v2/diplomas`, {
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
        const response = await fetch(`${API_BASE}/api/v2/diplomas`, {
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
    if (await showDeleteModal('Delete this instructor?')) {
        try {
            const response = await fetch(`${API_BASE}/api/v2/instructors/${id}`, {
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

async function editInstructor(id) {
    try {
        const response = await fetch(`${API_BASE}/api/v2/instructors/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch instructor details');
        const instructor = await response.json();

        // Populate form
        document.getElementById('input-instructor-name').value = instructor.name;
        document.getElementById('input-instructor-phone').value = instructor.phoneNumber || '';
        document.getElementById('input-instructor-salary').value = instructor.salary || 0;
        document.getElementById('input-instructor-pay-method').value = instructor.paymentMethod || 'Per hour';

        showView('add-instructor-view');
        document.querySelector('#add-instructor-view h1').textContent = 'Edit Instructor';
        const submitBtn = document.querySelector('#form-add-instructor button[type="submit"]');
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Instructor';

        // Load diplomas
        await loadDiplomasForInstructorForm();
        setTimeout(() => {
            const diplomaIds = instructor.assignedDiplomaIds || (instructor.assignedDiplomas ? instructor.assignedDiplomas.map(d => d.id || d.diplomaId) : []);
            document.querySelectorAll('.inst-diploma-checkbox').forEach(cb => {
                if (diplomaIds.includes(parseInt(cb.value)) || diplomaIds.includes(cb.value.toString())) {
                    cb.checked = true;
                } else {
                    cb.checked = false;
                }
            });
            updateInstSelectedDiplomasText();
        }, 300);

        const form = document.getElementById('form-add-instructor');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const selectedDiplomaIds = Array.from(document.querySelectorAll('.inst-diploma-checkbox:checked'))
                .map(cb => parseInt(cb.value));

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
                const putRes = await fetch(`${API_BASE}/api/v2/instructors/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(payload)
                });

                if (putRes.ok) {
                    alert('Instructor updated successfully!');
                    showView('instructors-list-view');
                    loadInstructors();
                    document.querySelector('#add-instructor-view h1').textContent = 'Add New Instructor';
                    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Instructor';
                    initAddInstructorForm();
                    form.reset();
                } else {
                    const err = await putRes.json();
                    alert('Error: ' + (err.message || 'Failed to update instructor'));
                }
            } catch (error) {
                console.error('Error updating instructor:', error);
                alert('An error occurred.');
            }
        };

        document.getElementById('btn-cancel-instructor').onclick = () => {
            showView('instructors-list-view');
            document.querySelector('#add-instructor-view h1').textContent = 'Add New Instructor';
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Instructor';
            initAddInstructorForm();
            form.reset();
        };

    } catch (error) {
        console.error('Error fetching instructor:', error);
        alert('Failed to load instructor data.');
    }
}

// ===============================
// Students (V2)
// ===============================

async function loadCancelledStudents(page = 0) {
    const search = document.getElementById('search-cancelled-students').value;
    let url = `${API_BASE}/api/v2/students/cancelled?page=${page}&size=${PAGE_SIZE}`;
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
    let url = `${API_BASE}/api/v2/students/future?page=${page}&size=${PAGE_SIZE}`;
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

async function initAddStudentForm(preRoundId = null, preDiplomaId = null, studentId = null) {
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

    if (studentId) {
        try {
            const res = await fetch(`${API_BASE}/api/v2/students/${studentId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            if (res.ok) {
                const s = await res.json();
                document.getElementById('input-student-name').value = s.name || '';
                document.getElementById('input-student-email').value = s.email || '';
                document.getElementById('input-student-phone').value = s.phone || '';
                document.getElementById('input-student-notes').value = s.notes || '';
                document.getElementById('input-student-deposit').value = s.depositAmount || 0;
                document.getElementById('input-student-discount').value = s.discount || 0;

                // Set round/diploma if they were not already preset
                if (!preRoundId && s.roundId) {
                    const rs = document.getElementById('input-student-round');
                    rs.value = s.roundId;
                    if (rs.onchange) await rs.onchange();
                }
                if (!preDiplomaId && s.diplomaId) document.getElementById('input-student-diploma').value = s.diplomaId;
                // Set sales person
                if (s.salesPersonId) document.getElementById('input-student-sales').value = s.salesPersonId;
            }
        } catch (e) {
            console.error(e);
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
            let url = `${API_BASE}/api/v2/students/enroll`;
            let method = 'POST';
            if (studentId) {
                url = `${API_BASE}/api/v2/students/${studentId}`;
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
                showToast(studentId ? 'Student updated successfully' : 'Student enrolled successfully', 'success');
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
            fetch(`${API_BASE}/api/v2/rounds/all`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch(`${API_BASE}/api/v1/users`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
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
                const res = await fetch(`${API_BASE}/api/v2/rounds/${roundId}`, {
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
            const response = await fetch(`${API_BASE}/api/v2/students/${id}/restore`, {
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
        const response = await fetch(`${API_BASE}/api/v2/students/${id}/cancel`, {
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
    let url = `${API_BASE}/api/v2/invoices?page=${page}&size=${PAGE_SIZE}`;
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
        const response = await fetch(`${API_BASE}/api/v1/students?page=0&size=${PAGE_SIZE}`, {
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
            const url = id ? `${API_BASE}/api/v2/invoices/${id}` : `${API_BASE}/api/v2/invoices`;
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
    if (await showDeleteModal('Delete this invoice?')) {
        try {
            const response = await fetch(`${API_BASE}/api/v2/invoices/${id}`, {
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
        const response = await fetch(`${API_BASE}/api/v2/invoices/${id}`, {
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

    if (!data || data.totalPages <= 1) return;

    const current = data.number;
    const total = data.totalPages;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = data.first;
    prevBtn.onclick = () => loadFn(current - 1);
    container.appendChild(prevBtn);

    // Build page numbers with ellipsis
    const pages = new Set();
    pages.add(0);
    pages.add(total - 1);
    for (let i = Math.max(0, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.add(i);
    }
    const sortedPages = [...pages].sort((a, b) => a - b);

    let lastAdded = -1;
    sortedPages.forEach(i => {
        if (lastAdded !== -1 && i - lastAdded > 1) {
            const dots = document.createElement('span');
            dots.className = 'dots';
            dots.textContent = '...';
            container.appendChild(dots);
        }
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === current ? 'active' : ''}`;
        pageBtn.textContent = i + 1;
        pageBtn.onclick = () => loadFn(i);
        container.appendChild(pageBtn);
        lastAdded = i;
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = data.last;
    nextBtn.onclick = () => loadFn(current + 1);
    container.appendChild(nextBtn);
}
// ===============================
// Diplomas (V2)
// ===============================

async function populateDiplomaInstructorFilter() {
    try {
        const response = await fetch(`${API_BASE}/api/v2/instructors/all`, {
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

    let url = `${API_BASE}/api/v2/round-diplomas?page=${page}&size=${PAGE_SIZE}`;
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
            const response = await fetch(`${API_BASE}/api/v2/round-diplomas`, {
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
            fetch(`${API_BASE}/api/v2/rounds/all`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch(`${API_BASE}/api/v2/diplomas/all`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch(`${API_BASE}/api/v2/instructors/all`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
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
    if (!await showDeleteModal(`Delete "${name}"?`)) return;
    try {
        const response = await fetch(`${API_BASE}/api/v2/round-diplomas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            showToast('Diploma Deleted successfully', 'success');
            loadDiplomasV2();
        } else {
            let errMsg = 'Failed to delete diploma';
            try {
                const errBody = await response.json();
                if (errBody.message) errMsg = errBody.message;
            } catch (e) { }
            showToast(errMsg, 'error');
        }
    } catch (error) {
        console.error('Error deleting diploma:', error);
        showToast('Error connecting to server', 'error');
    }
}

async function editDiplomaV2(id) {
    try {
        const response = await fetch(`${API_BASE}/api/v2/round-diplomas/${id}`, {
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
            fetch(`${API_BASE}/api/v2/rounds/all`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch(`${API_BASE}/api/v2/instructors/all`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
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
            const response = await fetch(`${API_BASE}/api/v2/round-diplomas/${id}`, {
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

    if (onConfirm) {
        document.getElementById('btn-confirm-delete').onclick = () => {
            onConfirm();
            modal.style.display = 'none';
        };
        document.getElementById('btn-cancel-delete').onclick = () => {
            modal.style.display = 'none';
        };
    } else {
        return new Promise(resolve => {
            document.getElementById('btn-confirm-delete').onclick = () => {
                modal.style.display = 'none';
                resolve(true);
            };
            document.getElementById('btn-cancel-delete').onclick = () => {
                modal.style.display = 'none';
                resolve(false);
            };
        });
    }
}

let currentDetailsRoundDiplomaId = null;

async function viewDiplomaDetailsV2(id) {
    try {
        const response = await fetch(`${API_BASE}/api/v2/round-diplomas/${id}`, {
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
        const url = new URL(`${API_BASE}/api/v2/students/round-diploma/${id}`);
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
        const statusClass = s.status ? 'status-' + s.status.toLowerCase() : 'status-postponed';
        const formattedStatus = s.status ? s.status.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()) : '-';
        const row = document.createElement('tr');

        // Check password and notes
        const passwordValue = s.password || '';
        const notesValue = s.notes || '-';

        // Format dates
        const startDateStr = s.enrollmentDate ? formatDate(s.enrollmentDate) : '-'; // Start Date
        const endDateStr = s.endDate ? formatDate(s.endDate) : '-'; // End Date

        // Financials
        const coursePrice = s.totalAmount || 0;
        const deposit = s.depositAmount || 0;
        const totalPaid = s.paidAmount || 0;
        const remaining = s.remainingAmount !== undefined ? s.remainingAmount : 0;

        // Installment helper function
        const renderInstallmentCols = (instDate, requiredAmt, paidAmt, instNotes) => {
            const dateVal = instDate ? formatDate(instDate) : '-';
            const reqVal = requiredAmt || '-';
            const paidVal = paidAmt !== null && paidAmt !== undefined ? paidAmt : '-';
            const noteVal = instNotes || '-';
            return `
                <td>${dateVal}</td>
                <td>${reqVal}</td>
                <td>${paidVal}</td>
                <td>${noteVal}</td>
            `;
        };

        // Actions
        let actionsHtml = '';
        if (s.status === 'CANCELLED' || s.status === 'POSTPONED') {
            actionsHtml = `
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="restoreStudent(${s.id})" title="Restore"><i class="fas fa-undo"></i></button>
                </div>
            `;
        } else {
            actionsHtml = `
                <div class="actions-cell">
                    <button class="btn-action edit" onclick="postponeStudent(${s.id}, '${s.name}')" title="Postpone"><i class="fas fa-pause" style="color: #ebb700;"></i></button>
                    <button class="btn-action delete" onclick="cancelStudent(${s.id}, '${s.name}')" title="Cancel"><i class="fas fa-ban" style="color: #fd7e14;"></i></button>
                    <button class="btn-action edit" onclick="editStudentV2(${s.id}, currentDetailsRoundId, currentDetailsDiplomaId)" title="Edit" style="color: #3b82f6;"><i class="fas fa-pen"></i></button>
                    <button class="btn-action delete" onclick="deleteStudentV2(${s.id})" title="Delete" style="color: #dc3545;"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }

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
            <td><input type="text" class="inline-edit-input" value="${passwordValue}" placeholder="••••••••" onchange="handleInlineAccountChange(${s.id}, this.value, null)"></td>
            <td>${notesValue}</td>
            <td>${startDateStr}</td>
            <td>${endDateStr}</td>
            <td>${coursePrice}</td>
            <td>${deposit}</td>
            <td>${totalPaid}</td>
            <td>${remaining}</td>
            ${renderInstallmentCols(s.installment1Date, s.installment1Amount, s.installment1Paid, s.installment1Notes)}
            ${renderInstallmentCols(s.installment2Date, s.installment2Amount, s.installment2Paid, s.installment2Notes)}
            ${renderInstallmentCols(s.installment3Date, s.installment3Amount, s.installment3Paid, s.installment3Notes)}
            ${renderInstallmentCols(s.installment4Date, s.installment4Amount, s.installment4Paid, s.installment4Notes)}
            <td>${actionsHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

function editStudentPrompt(id) {
    showToast('Student editing can be performed inline by editing the status, password, or IT access checkbox directly.', 'info');
}

function editStudentV2(id, roundId, diplomaId) {
    showView('add-student-view');
    initAddStudentForm(roundId, diplomaId, id);
}

async function deleteStudentV2(id) {
    if (!await showDeleteModal('Delete this student permanently?')) return;
    try {
        const response = await fetch(`${API_BASE}/api/v2/students/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.ok) {
            showToast('Student deleted successfully', 'success');
            if (currentDetailsRoundDiplomaId) {
                loadDiplomaStudentsV2(currentDetailsRoundDiplomaId);
            } else {
                loadFutureEnrollments();
            }
        } else {
            showToast('Failed to delete student', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Error connecting to server', 'error');
    }
}

async function handleInlineAccountChange(id, password, itStatus, status) {
    try {
        const student = window.currentDiplomaStudentsV2.find(s => s.id === id);
        if (!student) return;

        const body = {};
        if (password !== null) body.password = password;
        if (itStatus !== null) body.itStatus = itStatus;
        if (status !== null && status !== undefined) body.status = status;

        const response = await fetch(`${API_BASE}/api/v2/students/${id}/account-info`, {
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
        const response = await fetch(`${API_BASE}/api/v2/students/${id}/restore`, {
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
            const response = await fetch(`${API_BASE}/api/v2/students/${id}/cancel`, {
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
            const response = await fetch(`${API_BASE}/api/v2/students/${id}/postpone`, {
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
        const response = await fetch(`${API_BASE}/api/v2/rounds/all`, {
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
        const stdResponse = await fetch(`${API_BASE}/api/v2/students/round-diploma/${roundDiplomaId}?size=${PAGE_SIZE}`, {
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

        const response = await fetch(`${API_BASE}/api/v2/attendance/bulk`, {
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
        const response = await fetch(`${API_BASE}/api/v2/attendance/diploma/${roundDiplomaId}/sessions`, {
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
        const stdResponse = await fetch(`${API_BASE}/api/v2/students/round-diploma/${roundDiplomaId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const stdData = await stdResponse.json();
        const students = stdData.content;

        const attResponse = await fetch(`${API_BASE}/api/v2/attendance/diploma/${roundDiplomaId}?date=${date}`, {
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
        const response = await fetch(`${API_BASE}/api/v2/attendance/bulk`, {
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
        const response = await fetch(`${API_BASE}/api/v2/tasks/diploma/${roundDiplomaId}`, {
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

    let url = `${API_BASE}/api/v1/users`;

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
            let url = `${API_BASE}/api/auth/register`;
            let method = 'POST';

            if (id) {
                url = `${API_BASE}/api/v1/users/${id}`;
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
                showToast(id ? 'Employee updated successfully' : 'Employee added successfully', 'success');
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
        const response = await fetch(`${API_BASE}/api/v1/users`, {
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
    if (!await showDeleteModal('Delete this user?')) return;

    try {
        const response = await fetch(`${API_BASE}/api/v1/users/${id}`, {
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

async function loadLeads(page = 0) {
    const search = document.getElementById('search-leads') ? document.getElementById('search-leads').value : '';
    const status = document.getElementById('filter-leads-status') ? document.getElementById('filter-leads-status').value : '';

    let url = `${API_BASE}/api/v1/leads?page=${page}&size=${PAGE_SIZE}&sortBy=id&sortDirection=DESC`;
    if (status) {
        url = `${API_BASE}/api/v1/leads/status/${status}?page=${page}&size=${PAGE_SIZE}`;
    }

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            let leads = data.content || [];

            if (search) {
                leads = leads.filter(l =>
                    (l.fullName && l.fullName.toLowerCase().includes(search.toLowerCase())) ||
                    (l.phoneNumber && l.phoneNumber.includes(search))
                );
            }

            renderLeadsTable(leads);
            renderPagination('admin-leads-pagination', data, loadLeads);
            loadLeadStats();
        }
    } catch (error) {
        console.error('Error loading leads:', error);
    }
}

async function loadLeadStats() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/leads/statistics`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const stats = await response.json();
            const totalEl = document.getElementById('stat-total-leads');
            const openedEl = document.getElementById('stat-opened-leads');
            const closedEl = document.getElementById('stat-closed-leads');
            const enrolledEl = document.getElementById('stat-enrolled-leads');
            const countriesEl = document.getElementById('stat-countries-leads');
            const noRespEl = document.getElementById('stat-no-responses-leads');
            if (totalEl) totalEl.textContent = stats.total || 0;
            if (openedEl) openedEl.textContent = stats.opened !== undefined ? stats.opened : (stats.pending || 0);
            if (closedEl) closedEl.textContent = stats.closed || 0;
            if (enrolledEl) enrolledEl.textContent = stats.enrolled !== undefined ? stats.enrolled : (stats.completed || 0);
            if (countriesEl) countriesEl.textContent = stats.countries || 0;
            if (noRespEl) noRespEl.textContent = stats.noResponses || 0;
        }
    } catch (error) {
        console.error('Error loading lead stats:', error);
    }
}

function getLeadStatusBadge(status, small = false) {
    const pad = small ? '3px 9px' : '5px 12px';
    const fs = small ? '0.75rem' : '0.8rem';
    const map = {
        OPEN: { bg: '#fff8e1', color: '#f59e0b', label: 'Open' },
        INTERESTED: { bg: '#e3f2fd', color: '#2196f3', label: 'Interested' },
        FOLLOW_UP: { bg: '#f3e5f5', color: '#9c27b0', label: 'Follow Up' },
        ENROLLED: { bg: '#e8f5e9', color: '#4caf50', label: 'Enrolled ✅' },
        REJECTED: { bg: '#ffebee', color: '#f44336', label: 'Rejected ❌' },
        CLOSED: { bg: '#f5f5f5', color: '#888', label: 'Closed' },
    };
    const s = map[status] || { bg: '#f5f5f5', color: '#666', label: status };
    return `<span style="background:${s.bg};color:${s.color};padding:${pad};border-radius:20px;font-size:${fs};font-weight:600;display:inline-block;">${s.label}</span>`;
}

function renderLeadsTable(leads) {
    const tbody = document.getElementById('leads-list-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#888;">No leads found.</td></tr>';
        return;
    }

    leads.forEach(l => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => openLeadDetailModal(l.id);

        const dateStr = l.createdAt ? formatDate(l.createdAt) : '-';

        let resp1 = '-';
        let resp2 = '-';
        if (l.followUps && l.followUps.length > 0) {
            // Usually follow-ups are ordered newest first or oldest first. 
            // We'll just grab the first two available.
            resp1 = l.followUps[0].message || '-';
            if (l.followUps.length > 1) {
                resp2 = l.followUps[1].message || '-';
            }
        }

        if (resp1.length > 25) resp1 = resp1.substring(0, 25) + '...';
        if (resp2.length > 25) resp2 = resp2.substring(0, 25) + '...';

        row.innerHTML = `
            <td style="padding:15px;">${l.phoneNumber || '-'}</td>
            <td style="padding:15px;color:#555;">${l.diploma ? l.diploma.name : '-'}</td>
            <td style="padding:15px;color:#777;">${dateStr}</td>
            <td style="padding:15px;color:#333;">${l.fullName || '-'}</td>
            <td style="padding:15px;color:#555;">${l.teleSales ? l.teleSales.fullName : '-'}</td>
            <td style="padding:15px;color:#666;font-size:0.9rem;">${resp1}</td>
            <td style="padding:15px;color:#666;font-size:0.9rem;">${resp2}</td>
        `;
        tbody.appendChild(row);
    });
}

// ===================================================
// Moderator Leads Logic
// ===================================================

async function loadDiplomasForModeratorForm() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/diplomas`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const diplomas = await response.json();
            ['mod-lead-diploma', 'add-lead-diploma'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const currentVal = el.value;
                    el.innerHTML = '<option value="">Select diploma</option>';
                    diplomas.forEach(d => {
                        const opt = document.createElement('option');
                        opt.value = d.id;
                        opt.textContent = d.name;
                        el.appendChild(opt);
                    });
                    if (currentVal) el.value = currentVal;
                }
            });
            // Also populate moderator filter
            const filterEl = document.getElementById('mod-filter-diploma');
            if (filterEl) {
                filterEl.innerHTML = '<option value="">Diploma</option>';
                diplomas.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.id;
                    opt.textContent = d.name;
                    filterEl.appendChild(opt);
                });
            }
        }
    } catch (e) {
        console.error('Error loading diplomas for moderator:', e);
    }
}

async function loadModeratorLeads(page = 0) {
    const search = document.getElementById('mod-search-leads') ? document.getElementById('mod-search-leads').value.toLowerCase() : '';
    const diplomaId = document.getElementById('mod-filter-diploma') ? document.getElementById('mod-filter-diploma').value : '';
    const status = document.getElementById('mod-filter-status') ? document.getElementById('mod-filter-status').value : '';

    let url = `${API_BASE}/api/v1/leads?page=${page}&size=${PAGE_SIZE}&sortBy=id&sortDirection=DESC`;
    if (status) {
        url = `${API_BASE}/api/v1/leads/status/${status}?page=${page}&size=${PAGE_SIZE}`;
    }

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            let leads = data.content || [];

            if (search) leads = leads.filter(l => (l.phoneNumber && l.phoneNumber.includes(search)) || (l.moderatorNotes && l.moderatorNotes.toLowerCase().includes(search)));
            if (diplomaId) leads = leads.filter(l => l.diploma && l.diploma.id == diplomaId);

            renderModeratorLeadsTable(leads);
            renderPagination('mod-leads-pagination', data, loadModeratorLeads);
        }
    } catch (e) {
        console.error('Error loading moderator leads:', e);
    }
}

function renderModeratorLeadsTable(leads) {
    const tbody = document.getElementById('mod-leads-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:25px;color:#888;">No leads found.</td></tr>';
        return;
    }

    leads.forEach(l => {
        const row = document.createElement('tr');
        const dateStr = l.createdAt ? formatDate(l.createdAt) : '-';
        row.innerHTML = `
            <td style="padding:15px;font-weight:600;">${l.phoneNumber}</td>
            <td style="padding:15px;color:#555;">${l.diploma ? l.diploma.name : '-'}</td>
            <td style="padding:15px;color:#777;">${dateStr}</td>
            <td style="padding:15px;">${getLeadStatusBadge(l.status)}</td>
            <td style="padding:15px;color:#666;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${l.moderatorNotes || '-'}</td>
            <td style="padding:15px;text-align:center;">
                <button onclick="openLeadDetailModal(${l.id})" title="View details & add follow-up"
                    style="background:#1a1a1a;color:#ebb700;border:none;width:34px;height:34px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;">
                    <i class="fas fa-comments"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Removed duplicated setupModeratorListeners

// ===================================================
// Add Lead Modal Logic
// ===================================================

async function loadDiplomasForLeadForm() {
    await loadDiplomasForModeratorForm();
}

async function loadTelesalesUsersForLeadForm() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/users`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const users = await response.json();
            const el = document.getElementById('add-lead-telesales');
            if (el) {
                el.innerHTML = '<option value="">Select telesales (optional)</option>';
                users.filter(u => u.role === 'TELESALES').forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.id;
                    opt.textContent = u.fullName || u.username;
                    el.appendChild(opt);
                });
            }
        }
    } catch (e) { console.error('Error loading telesales users:', e); }
}

function openAddLeadModal(mode = 'admin') {
    document.getElementById('add-lead-modal').style.display = 'flex';
    document.getElementById('form-add-lead').reset();
    // mode 'admin'/'moderator' determines endpoint
    document.getElementById('form-add-lead').dataset.mode = mode;

    const telesalesGroup = document.getElementById('add-lead-telesales-group');
    if (telesalesGroup) telesalesGroup.style.display = mode === 'admin' ? 'block' : 'none';

    loadDiplomasForLeadForm();
    if (mode === 'admin') loadTelesalesUsersForLeadForm();
}

function initAddLeadModalListeners() {
    const modal = document.getElementById('add-lead-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('close-add-lead-modal');
    const cancelBtn = document.getElementById('btn-cancel-add-lead');
    const form = document.getElementById('form-add-lead');

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    if (cancelBtn) cancelBtn.onclick = () => modal.style.display = 'none';
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await saveNewLead(form.dataset.mode || 'admin');
        };
    }
}

async function saveNewLead(mode = 'admin') {
    const fullName = document.getElementById('add-lead-fullname').value.trim();
    const phone = document.getElementById('add-lead-phone').value.trim();
    const source = document.getElementById('add-lead-source').value;
    const diplomaId = document.getElementById('add-lead-diploma').value;
    const status = document.getElementById('add-lead-status').value;
    const notes = document.getElementById('add-lead-notes').value.trim();
    const teleSalesId = document.getElementById('add-lead-telesales') ? document.getElementById('add-lead-telesales').value : '';

    if (!fullName || !phone) { showToast('Name and phone are required', 'error'); return; }

    const endpoint = mode === 'telesales' ? '/api/v1/leads/telesales' : '/api/v1/leads/admin';
    const payload = {
        fullName, phoneNumber: phone, source: source || null,
        diplomaId: diplomaId || null, status, moderatorNotes: notes || null,
    };
    if (mode !== 'telesales' && teleSalesId) payload.teleSalesId = parseInt(teleSalesId);

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Lead added successfully! 🎉', 'success');
            document.getElementById('add-lead-modal').style.display = 'none';
            document.getElementById('form-add-lead').reset();
            // Reload the relevant leads list
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            if (userData.role === 'MODERATOR') loadModeratorLeads();
            else if (userData.role === 'TELESALES') loadTelesalesLeads();
            else loadLeads();
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to add lead', 'error');
        }
    } catch (err) {
        console.error('Error saving lead:', err);
        showToast('Connection error', 'error');
    }
}

// ===================================================
// Lead Detail Modal & Follow-up Logic
// ===================================================

function initLeadDetailModalListeners() {
    const modal = document.getElementById('lead-detail-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('close-lead-detail-modal');
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    const form = document.getElementById('form-add-followup');
    if (form) form.onsubmit = async (e) => { e.preventDefault(); await submitFollowUp(); };

    const closeDealBtn = document.getElementById('btn-close-deal');
    if (closeDealBtn) closeDealBtn.onclick = () => {
        document.getElementById('close-deal-modal').style.display = 'flex';
    };

    const closeDealModal = document.getElementById('close-deal-modal');
    const cancelDealBtn = document.getElementById('btn-cancel-close-deal');
    if (cancelDealBtn) cancelDealBtn.onclick = () => closeDealModal.style.display = 'none';
    if (closeDealModal) closeDealModal.addEventListener('click', (e) => { if (e.target === closeDealModal) closeDealModal.style.display = 'none'; });

    const enrolledBtn = document.getElementById('btn-close-enrolled');
    if (enrolledBtn) enrolledBtn.onclick = async () => {
        await closeDeal('ENROLLED');
        closeDealModal.style.display = 'none';
    };
    const rejectedBtn = document.getElementById('btn-close-rejected');
    if (rejectedBtn) rejectedBtn.onclick = async () => {
        await closeDeal('REJECTED');
        closeDealModal.style.display = 'none';
    };
}

async function openLeadDetailModal(leadId) {
    const modal = document.getElementById('lead-detail-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    if (!leadId) {
        showToast('Invalid lead ID', 'error');
        return;
    }

    // Set today's date as default
    const dateInput = document.getElementById('followup-date');
    if (dateInput) setInputDate(dateInput);

    document.getElementById('followup-lead-id').value = leadId;
    document.getElementById('modal-lead-name').textContent = 'Loading...';
    document.getElementById('followup-timeline').innerHTML = '';
    document.getElementById('no-followups-placeholder').style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/api/v1/leads/${leadId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const lead = await response.json();
            populateLeadDetailModal(lead);
        } else {
            showToast('Failed to load lead details', 'error');
        }
    } catch (e) {
        console.error('Error loading lead detail:', e);
        showToast('Connection error', 'error');
    }
}

function populateLeadDetailModal(lead) {
    document.getElementById('modal-lead-name').textContent = lead.fullName || lead.phoneNumber || 'Lead';
    document.getElementById('modal-lead-phone').innerHTML = `<i class="fas fa-phone" style="font-size:0.75rem;margin-right:4px;"></i>${lead.phoneNumber || '-'}`;
    document.getElementById('modal-lead-diploma').textContent = lead.diploma ? lead.diploma.name : '-';
    document.getElementById('modal-lead-source').textContent = lead.source || '-';
    document.getElementById('modal-lead-telesales').textContent = lead.teleSales ? lead.teleSales.fullName : '-';

    // Status badge
    document.getElementById('modal-lead-status-badge').outerHTML; // noop – update innerHTML
    const badgeEl = document.getElementById('modal-lead-status-badge');
    if (badgeEl) {
        const statusMap = {
            OPEN: { bg: '#fff8e1', color: '#f59e0b', label: 'Open' },
            INTERESTED: { bg: '#e3f2fd', color: '#2196f3', label: 'Interested' },
            FOLLOW_UP: { bg: '#f3e5f5', color: '#9c27b0', label: 'Follow Up' },
            ENROLLED: { bg: '#e8f5e9', color: '#4caf50', label: 'Enrolled ✅' },
            REJECTED: { bg: '#ffebee', color: '#f44336', label: 'Rejected ❌' },
            CLOSED: { bg: '#f5f5f5', color: '#888', label: 'Closed' },
        };
        const s = statusMap[lead.status] || { bg: '#f5f5f5', color: '#666', label: lead.status };
        badgeEl.style.background = s.bg;
        badgeEl.style.color = s.color;
        badgeEl.textContent = s.label;
    }

    // Set current status as default in followup status selector
    const statusSel = document.getElementById('followup-status');
    if (statusSel) statusSel.value = lead.status || 'OPEN';

    // Render follow-ups timeline
    const followUps = lead.followUps || [];
    const timeline = document.getElementById('followup-timeline');
    const placeholder = document.getElementById('no-followups-placeholder');
    timeline.innerHTML = '';

    if (followUps.length === 0) {
        placeholder.style.display = 'block';
    } else {
        placeholder.style.display = 'none';
        const sorted = [...followUps].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        sorted.forEach((fu, i) => {
            const dateStr = fu.createdAt ? formatDate(fu.createdAt) : '-';
            const statusBadge = getLeadStatusBadge(fu.status, true);
            const item = document.createElement('div');
            item.style.cssText = 'display:flex;gap:12px;align-items:flex-start;';
            item.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
                    <div style="width:32px;height:32px;border-radius:50%;background:#ebb700;color:#000;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">${i + 1}</div>
                    ${i < sorted.length - 1 ? '<div style="width:2px;flex:1;min-height:20px;background:#e0e0e0;margin-top:4px;"></div>' : ''}
                </div>
                <div style="background:#fff;border:1px solid #eee;border-radius:10px;padding:14px 16px;flex:1;margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <span style="font-size:0.78rem;color:#999;">${dateStr}</span>
                        ${statusBadge}
                    </div>
                    <p style="margin:0;font-size:0.9rem;color:#333;line-height:1.5;">${fu.message || '-'}</p>
                </div>
            `;
            timeline.appendChild(item);
        });
    }
}

async function submitFollowUp() {
    const leadId = document.getElementById('followup-lead-id').value;
    if (!leadId) { showToast('Invalid lead ID', 'error'); return; }
    const message = document.getElementById('followup-message').value.trim();
    const status = document.getElementById('followup-status').value;
    const dateVal = document.getElementById('followup-date').value;

    if (!message) { showToast('Please enter a response message', 'error'); return; }
    if (!status) { showToast('Please select a status', 'error'); return; }

    let createdAt = null;
    if (dateVal) createdAt = new Date(dateVal).toISOString().split('.')[0];

    const payload = { message, status, createdAt };

    try {
        const response = await fetch(`${API_BASE}/api/v1/leads/${leadId}/follow-ups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Follow-up recorded successfully! 💬', 'success');
            document.getElementById('followup-message').value = '';
            // Reload the modal with fresh data
            await openLeadDetailModal(leadId);
            // Also refresh the leads table in background
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            if (userData.role === 'MODERATOR') loadModeratorLeads();
            else if (userData.role === 'TELESALES') loadTelesalesLeads();
            else loadLeads();
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to save follow-up', 'error');
        }
    } catch (e) {
        console.error('Error saving follow-up:', e);
        showToast('Connection error', 'error');
    }
}

async function closeDeal(finalStatus) {
    const leadId = document.getElementById('followup-lead-id').value;
    if (!leadId) { showToast('No lead selected', 'error'); return; }

    try {
        const response = await fetch(`${API_BASE}/api/v1/leads/${leadId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ status: finalStatus, closureReason: finalStatus === 'ENROLLED' ? 'Deal closed - Enrolled' : 'Deal closed - Rejected' })
        });

        if (response.ok) {
            const msg = finalStatus === 'ENROLLED' ? '🎉 Deal closed! Lead enrolled successfully.' : '❌ Lead marked as rejected.';
            showToast(msg, 'success');
            document.getElementById('lead-detail-modal').style.display = 'none';
            // Reload leads
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            if (userData.role === 'MODERATOR') loadModeratorLeads();
            else if (userData.role === 'TELESALES') loadTelesalesLeads();
            else loadLeads();
        } else {
            const err = await response.json();
            showToast(err.message || 'Failed to close deal', 'error');
        }
    } catch (e) {
        console.error('Error closing deal:', e);
        showToast('Connection error', 'error');
    }
}



// ==========================================
// Telesales Leads & Call Attempts Logic
// ==========================================

async function loadDiplomasForTelesalesForm() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/diplomas`, {
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
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const search = document.getElementById('tele-search-leads').value;
    const diplomaId = document.getElementById('tele-filter-diploma').value;
    const status = document.getElementById('tele-filter-status').value;
    const attempts = document.getElementById('tele-filter-attempts').value;

    let url = `${API_BASE}/api/v1/leads?page=${page}&size=${PAGE_SIZE}`;
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
            renderPagination('tele-leads-pagination', data, loadTelesalesLeads);
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



function setupTelesalesListeners() {
    const search = document.getElementById('tele-search-leads');
    const dip = document.getElementById('tele-filter-diploma');
    const status = document.getElementById('tele-filter-status');
    const att = document.getElementById('tele-filter-attempts');

    if (search) search.oninput = () => loadTelesalesLeads();
    if (dip) dip.onchange = () => loadTelesalesLeads();
    if (status) status.onchange = () => loadTelesalesLeads();
    if (att) att.onchange = () => loadTelesalesLeads();

    // Telesales "Add Lead" button
    const teleAddBtn = document.getElementById('btn-open-add-lead-telesales');
    if (teleAddBtn) teleAddBtn.onclick = () => openAddLeadModal('telesales');

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
    if (!id) { showToast('Invalid lead ID', 'error'); return; }
    try {
        const response = await fetch(`${API_BASE}/api/v1/leads/${id}`, {
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
            setInputDate('call-date-input');
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
    if (!leadId) { showToast('Invalid lead ID', 'error'); return; }
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
        const response = await fetch(`${API_BASE}/api/v1/leads/${leadId}/follow-ups`, {
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
        const response = await fetch(`${API_BASE}/api/v1/finance/overview?month=${month}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            const totalRevenue = data.totalRevenue || 0;
            const collectedRevenue = data.collectedRevenue || 0;
            const pendingRevenue = data.pendingRevenue || 0;
            const netProfit = data.netProfit || 0;

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
        const response = await fetch(`${API_BASE}/api/v1/finance/salaries?month=${month}`, {
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
                    <button class='action-btn edit' onclick="openEditSalaryModal(${s.id}, ${s.bonus || 0}, ${s.deductions || 0}, ${s.overtime || 0}, ${s.payed || 0}, '${s.status}')" style='background: #e3f2fd; color: #1976d2; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;'><i class='fas fa-pencil-alt'></i></button>
                    ${typeClass === 'freelance' ? `<button class='action-btn delete' onclick="deleteUser(${s.employeeId})" style='background: #ffebee; color: #d32f2f; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;'><i class='fas fa-trash-alt'></i></button>` : ''}
                </div>
            </td>` ;
        tbody.appendChild(row);
    });
}

function openEditSalaryModal(id, bonus, deductions, overtime, paid, status) {
    document.getElementById('edit-salary-id').value = id;
    document.getElementById('edit-salary-bonus').value = bonus;
    document.getElementById('edit-salary-deductions').value = deductions;
    document.getElementById('edit-salary-overtime').value = overtime;
    document.getElementById('edit-salary-paid').value = paid;
    document.getElementById('edit-salary-status').value = status;
    document.getElementById('edit-salary-modal').style.display = 'flex';
}

const formEditSalary = document.getElementById('form-edit-salary');
if (formEditSalary) {
    formEditSalary.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-salary-id').value;
        const payload = {
            bonuses: parseFloat(document.getElementById('edit-salary-bonus').value || 0),
            deductions: parseFloat(document.getElementById('edit-salary-deductions').value || 0),
            overtime: parseFloat(document.getElementById('edit-salary-overtime').value || 0),
            paidAmount: parseFloat(document.getElementById('edit-salary-paid').value || 0),
            status: document.getElementById('edit-salary-status').value
        };

        try {
            const response = await fetch(`${API_BASE}/api/v1/finance/salaries/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Salary updated successfully', 'success');
                document.getElementById('edit-salary-modal').style.display = 'none';
                loadSalaries(); // Reload the table
            } else {
                showToast('Failed to update salary', 'error');
            }
        } catch (error) {
            console.error('Error updating salary:', error);
            showToast('Connection error', 'error');
        }
    };
}

async function runPayroll() {
    const month = document.getElementById('finance-salaries-month').value;
    try {
        const response = await fetch(`${API_BASE}/api/v1/finance/salaries/run-payroll?month=${month}`, {
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
        const response = await fetch(`${API_BASE}/api/v1/finance/expenses?month=${month}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const expenses = await response.json();
            window.currentExpensesData = expenses;
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
                <button class='btn-save' onclick="openEditExpenseModal(${e.id})" style='padding: 5px 10px; background: #e3f2fd; color: #2196f3; border: none; cursor: pointer; border-radius: 6px;'><i class='fas fa-edit'></i></button>
            </td>`;
        tbody.appendChild(row);
    });
}

function openEditExpenseModal(id) {
    const expense = window.currentExpensesData.find(e => e.id === id);
    if (!expense) return;
    
    document.getElementById('edit-expense-id').value = expense.id;
    document.getElementById('edit-expense-title').value = expense.title || '';
    document.getElementById('edit-expense-amount').value = expense.amount || 0;
    
    let dateStr = '';
    if (expense.date) {
        if (Array.isArray(expense.date)) {
            dateStr = `${expense.date[0]}-${String(expense.date[1]).padStart(2, '0')}-${String(expense.date[2]).padStart(2, '0')}`;
        } else {
            dateStr = new Date(expense.date).toISOString().split('T')[0];
        }
    }
    document.getElementById('edit-expense-date').value = dateStr;
    
    document.getElementById('edit-expense-pay-method').value = expense.payMethod || '';
    document.getElementById('edit-expense-paid').value = expense.payed || 0;
    document.getElementById('edit-expense-note').value = expense.note || '';
    
    document.getElementById('edit-expense-modal').style.display = 'flex';
}

const formEditExpense = document.getElementById('form-edit-expense');
if (formEditExpense) {
    formEditExpense.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-expense-id').value;
        const payload = {
            title: document.getElementById('edit-expense-title').value,
            amount: parseFloat(document.getElementById('edit-expense-amount').value || 0),
            expenseDate: document.getElementById('edit-expense-date').value,
            paymentMethod: document.getElementById('edit-expense-pay-method').value,
            paidAmount: parseFloat(document.getElementById('edit-expense-paid').value || 0),
            note: document.getElementById('edit-expense-note').value
        };

        try {
            const response = await fetch(`${API_BASE}/api/v1/finance/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Expense updated successfully', 'success');
                document.getElementById('edit-expense-modal').style.display = 'none';
                loadExpenses(); // Reload the table
            } else {
                showToast('Failed to update expense', 'error');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            showToast('Connection error', 'error');
        }
    };
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
        const response = await fetch(`${API_BASE}/api/v1/finance/expenses`, {
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
    const amount = parseFloat(document.getElementById('expense-page-amount').value) || 0;
    const expense = {
        title: document.getElementById('expense-page-title').value,
        amount: amount,
        paidAmount: amount, // Defaults to fully paid for now, or you could add a paid input field on the page
        paymentMethod: document.getElementById('expense-page-pay-method').value,
        expenseDate: document.getElementById('expense-page-date').value,
        note: document.getElementById('expense-page-note').value
    };

    try {
        const response = await fetch(`${API_BASE}/api/v1/finance/expenses`, {
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
        const response = await fetch(`${API_BASE}/api/v1/finance/overview?month=${month}`, {
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
// Removed duplicated setupModeratorListeners

async function loadDiplomasForModeratorForm() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/diplomas`, {
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

    let url = `${API_BASE}/api/v1/leads?page=${page}&size=${PAGE_SIZE}`;
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
            renderPagination('mod-leads-pagination', data, loadModeratorLeads);
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
    const id = document.getElementById('mod-lead-id').value;
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
        let url = `${API_BASE}/api/v1/leads/admin`;
        let method = 'POST';

        if (id) {
            url = `${API_BASE}/api/v1/leads/${id}`;
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
            showToast(id ? 'Lead updated successfully' : 'Lead added successfully', 'success');
            document.getElementById('form-moderator-add-lead').reset();
            setInputDate('mod-lead-date');
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
        const response = await fetch(`${API_BASE}/api/v1/leads/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const l = await response.json();
            document.getElementById('mod-lead-id').value = l.id;
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
    if (!await showDeleteModal('Delete this lead? Only Admins can execute deletes.')) return;
    try {
        const response = await fetch(`${API_BASE}/api/v1/leads/${id}`, {
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



// Work Hours
async function loadWorkHours(page = 0) {
    try {
        const response = await fetch(`${API_BASE}/api/v1/attendance/my-attendance?page=${page}&size=${PAGE_SIZE}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            renderWorkHoursTable(data.content || []);
            renderPagination('work-hours-pagination', data, loadWorkHours);
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
        const response = await fetch(`${API_BASE}/api/v1/attendance/weekly-hours`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            const el = document.getElementById('weekly-hours-val');
            if (el) {
                el.textContent = (data.weeklyHours || 0) + " hrs";
            }
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

    let url = `${API_BASE}/api/v1/attendance`;
    let method = 'POST';

    if (id) {
        url = `${API_BASE}/api/v1/attendance/${id}`;
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
            setInputDate('attendance-entry-date');
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
        const response = await fetch(`${API_BASE}/api/v1/attendance/my-attendance?size=${PAGE_SIZE}`, {
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
    if (!await showDeleteModal('Delete this work hours log?')) return;

    try {
        const response = await fetch(`${API_BASE}/api/v1/attendance/${id}`, {
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



// Leaderboard
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/leads/leaderboard`, {
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
        const response = await fetch(`${API_BASE}/api/v2/students/round-diploma/${roundDiplomaId}?size=${PAGE_SIZE}`, {
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
        const response = await fetch(`${API_BASE}/api/v1/users`, {
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
        let url = `${API_BASE}/api/auth/register`;
        let method = 'POST';

        if (id) {
            url = `${API_BASE}/api/v1/users/${id}`;
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
    if (!await showDeleteModal('Delete this sales user?')) return;

    try {
        const response = await fetch(`${API_BASE}/api/v1/users/${id}`, {
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
        let url = `${API_BASE}/api/v1/earnings`;
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
        const response = await fetch(`${API_BASE}/api/v1/earnings/${id}/status`, {
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

        const response = await fetch(`${API_BASE}/api/v1/earnings/calculate`, {
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

// ==========================================
// Drag to Scroll functionality for tables
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.table-container');
    let isDown = false;
    let startX;
    let scrollLeft;
    let startY;
    let scrollTop;

    sliders.forEach(slider => {
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('grabbing');
            startX = e.pageX - slider.offsetLeft;
            startY = e.pageY - slider.offsetTop;
            scrollLeft = slider.scrollLeft;
            scrollTop = slider.scrollTop;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('grabbing');
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('grabbing');
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const y = e.pageY - slider.offsetTop;
            const walkX = (x - startX) * 1.5; // Scroll-fast factor
            const walkY = (y - startY) * 1.5;
            slider.scrollLeft = scrollLeft - walkX;
            slider.scrollTop = scrollTop - walkY;
        });
    });
});

// ==========================================
// Lead Management – Shared Helpers
// ==========================================

const API_BASE = 'http://localhost:8085';

function renderLeadStatus(status) {
    const map = {
        OPEN: { label: 'Open', cls: 'badge-info' },
        INTERESTED: { label: 'Interested', cls: 'badge-warning' },
        FOLLOW_UP: { label: 'Follow Up', cls: 'badge-primary' },
        ENROLLED: { label: 'Enrolled', cls: 'badge-success' },
        REJECTED: { label: 'Rejected', cls: 'badge-danger' },
        CLOSED: { label: 'Closed', cls: 'badge-secondary' },
    };
    const s = map[status] || { label: status, cls: 'badge-secondary' };
    return `<span class="badge ${s.cls}" style="
        padding:4px 10px; border-radius:20px; font-size:0.78rem; font-weight:600; display:inline-block;
        background:${s.cls === 'badge-info' ? '#e3f2fd' : s.cls === 'badge-warning' ? '#fff8e1' : s.cls === 'badge-primary' ? '#ede7f6' : s.cls === 'badge-success' ? '#e8f5e9' : s.cls === 'badge-danger' ? '#ffebee' : '#f5f5f5'};
        color:${s.cls === 'badge-info' ? '#1976d2' : s.cls === 'badge-warning' ? '#f57f17' : s.cls === 'badge-primary' ? '#6200ea' : s.cls === 'badge-success' ? '#388e3c' : s.cls === 'badge-danger' ? '#d32f2f' : '#616161'};
    ">${s.label}</span>`;
}

function renderAttemptDots(count) {
    const max = 3;
    let html = '<div style="display:flex;gap:5px;align-items:center;">';
    for (let i = 1; i <= max; i++) {
        const filled = i <= count;
        html += `<span title="Attempt ${i}" style="
            width:12px;height:12px;border-radius:50%;display:inline-block;
            background:${filled ? '#e53935' : '#e0e0e0'};
            border:2px solid ${filled ? '#b71c1c' : '#bdbdbd'};
        "></span>`;
    }
    html += `<span style="font-size:0.78rem;color:#666;margin-left:4px;">${count}/3</span>`;
    html += '</div>';
    return html;
}

// ==========================================
// ADMIN – loadLeads (all leads)
// ==========================================

let _leadsPage = 0;

async function loadLeads() {
    const search = (document.getElementById('search-leads')?.value || '').toLowerCase();
    const status = document.getElementById('filter-leads-status')?.value || '';

    try {
        let url = `${API_BASE}/api/v1/leads?size=50&sortBy=id&sortDirection=DESC`;
        if (status) url = `${API_BASE}/api/v1/leads/status/${status}?size=50`;

        const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (!resp.ok) throw new Error('Failed');
        const data = await resp.json();
        let leads = (data.content || []);

        if (search) {
            leads = leads.filter(l =>
                (l.fullName || '').toLowerCase().includes(search) ||
                (l.phoneNumber || '').includes(search)
            );
        }

        renderAdminLeadsTable(leads);
        renderPagination('admin-leads-pagination', data, (p) => { _leadsPage = p; loadLeads(); });
        loadLeadStats();
    } catch (e) {
        console.error('loadLeads error:', e);
        showToast('Failed to load leads', 'error');
    }
}

function renderAdminLeadsTable(leads) {
    const tbody = document.getElementById('leads-list-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!leads.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#888;">No leads found.</td></tr>';
        return;
    }
    leads.forEach(l => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="font-weight:600">${l.fullName || '-'}</span></td>
            <td>${l.phoneNumber || '-'}</td>
            <td>${l.diploma?.name || '-'}</td>
            <td>${renderLeadStatus(l.status)}</td>
            <td>${renderAttemptDots((l.followUps || []).length)}</td>
            <td>${l.teleSales?.fullName || '<span style="color:#bbb">Unassigned</span>'}</td>
            <td>
                <button class="btn-action edit" onclick="openLeadDetail(${l.id})" style="background:#e3f2fd;color:#1565c0;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>`;
        tbody.appendChild(row);
    });
}

function openAddLeadModal(mode) {
    const modal = document.getElementById('add-lead-modal');
    if (modal) modal.style.display = 'flex';
}



function initLeadDetailModalListeners() {
    const closeBtn = document.getElementById('close-lead-detail-modal');
    if (closeBtn) closeBtn.onclick = () => {
        const m = document.getElementById('lead-detail-modal');
        if (m) m.style.display = 'none';
    };
}

async function openLeadDetail(id) {
    try {
        const resp = await fetch(`${API_BASE}/api/v1/leads/${id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (!resp.ok) throw new Error();
        const lead = await resp.json();
        const modal = document.getElementById('lead-detail-modal');
        const body = document.getElementById('lead-detail-body');
        if (!modal || !body) return;

        const followUps = lead.followUps || [];
        body.innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                <div><label style="color:#888;font-size:0.8rem;">Name</label><p style="font-weight:600;margin:4px 0">${lead.fullName}</p></div>
                <div><label style="color:#888;font-size:0.8rem;">Phone</label><p style="font-weight:600;margin:4px 0">${lead.phoneNumber}</p></div>
                <div><label style="color:#888;font-size:0.8rem;">Status</label><p style="margin:4px 0">${renderLeadStatus(lead.status)}</p></div>
                <div><label style="color:#888;font-size:0.8rem;">Diploma</label><p style="margin:4px 0">${lead.diploma?.name || '-'}</p></div>
                <div><label style="color:#888;font-size:0.8rem;">Assigned To</label><p style="margin:4px 0">${lead.teleSales?.fullName || 'Unassigned'}</p></div>
                <div><label style="color:#888;font-size:0.8rem;">Source</label><p style="margin:4px 0">${lead.source || '-'}</p></div>
            </div>
            ${lead.moderatorNotes ? `<div style="background:#f9f9f9;padding:12px;border-radius:8px;margin-bottom:16px;"><label style="color:#888;font-size:0.8rem;">Moderator Notes</label><p style="margin:4px 0">${lead.moderatorNotes}</p></div>` : ''}
            <div>
                <label style="color:#888;font-size:0.8rem;font-weight:600;">Call Attempts (${followUps.length}/3)</label>
                ${followUps.map(f => `
                    <div style="background:#f5f5f5;border-radius:8px;padding:12px;margin-top:8px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-weight:600;color:#333;">Attempt ${f.sequence}</span>
                            ${renderLeadStatus(f.status)}
                        </div>
                        <p style="margin:6px 0 0;color:#555;">${f.message}</p>
                        <small style="color:#aaa;">${f.createdAt ? new Date(f.createdAt).toLocaleString() : ''}</small>
                    </div>`).join('')}
                ${followUps.length === 0 ? '<p style="color:#bbb;margin-top:8px;">No attempts yet</p>' : ''}
            </div>`;
        modal.style.display = 'flex';
    } catch (e) {
        showToast('Failed to load lead details', 'error');
    }
}

// ==========================================
// MODERATOR – Leads Management
// ==========================================

let _modLeadsPage = 0;

async function loadDiplomasForModeratorForm() {
    try {
        const resp = await fetch(`${API_BASE}/api/v2/diplomas`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (!resp.ok) return;
        const diplomas = await resp.json();
        const selects = document.querySelectorAll('#mod-lead-diploma, #mod-filter-diploma, #add-lead-diploma, #filter-diploma');
        selects.forEach(sel => {
            if (!sel) return;
            sel.innerHTML = '<option value="">All Diplomas</option>';
            diplomas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.name;
                sel.appendChild(opt);
            });
        });
    } catch (e) { console.error('loadDiplomasForModeratorForm error:', e); }
}

async function loadModeratorLeads(page = 0) {
    const status = document.getElementById('mod-filter-status')?.value || '';
    const search = (document.getElementById('mod-search-leads')?.value || '').toLowerCase();

    try {
        let url = `${API_BASE}/api/v1/leads?size=10&page=${page}&sortBy=id&sortDirection=DESC`;
        if (status) url = `${API_BASE}/api/v1/leads/status/${status}?size=10&page=${page}`;

        const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (!resp.ok) throw new Error('Failed');
        const data = await resp.json();
        let leads = data.content || [];

        if (search) leads = leads.filter(l => (l.fullName || '').toLowerCase().includes(search) || (l.phoneNumber || '').includes(search));

        renderModeratorLeadsTable(leads);
        renderPagination('mod-leads-pagination', data, (p) => loadModeratorLeads(p));

        // Also load stats & performance
        loadTelesalesPerformance();
        loadUnassignedCount();
    } catch (e) {
        showToast('Failed to load leads', 'error');
    }
}

function renderModeratorLeadsTable(leads) {
    const tbody = document.getElementById('mod-leads-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!leads.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#888;">No leads found.</td></tr>';
        return;
    }
    leads.forEach(l => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="font-weight:600">${l.fullName || '-'}</span></td>
            <td>${l.phoneNumber || '-'}</td>
            <td>${l.diploma?.name || '-'}</td>
            <td>${renderLeadStatus(l.status)}</td>
            <td>${renderAttemptDots((l.followUps || []).length)}</td>
            <td>${l.teleSales?.fullName || '<span style="color:#f57c00;font-weight:600;">⚠ Unassigned</span>'}</td>
            <td>
                <button onclick="openLeadDetail(${l.id})" style="background:#e8f5e9;color:#2e7d32;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-eye"></i>
                </button>
            </td>`;
        tbody.appendChild(row);
    });
}

async function loadUnassignedCount() {
    try {
        const resp = await fetch(`${API_BASE}/api/v1/leads/unassigned?size=1`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (!resp.ok) return;
        const data = await resp.json();
        const el = document.getElementById('mod-unassigned-count');
        if (el) el.textContent = data.totalElements || 0;
    } catch (e) { /* silent */ }
}

async function loadTelesalesPerformance() {
    try {
        const resp = await fetch(`${API_BASE}/api/v1/leads/telesales-performance`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (!resp.ok) return;
        const agents = await resp.json();
        const tbody = document.getElementById('telesales-performance-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!agents.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#888;padding:12px;">No telesales agents found.</td></tr>';
            return;
        }
        agents.forEach(a => {
            const convRate = a.total > 0 ? Math.round((a.enrolled / a.total) * 100) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight:600">${a.name}</td>
                <td style="font-weight:700;color:#1565c0;">${a.total}</td>
                <td>${a.open}</td>
                <td style="color:#f57f17">${a.interested}</td>
                <td style="color:#6200ea">${a.followUp}</td>
                <td style="color:#388e3c;font-weight:700">${a.enrolled}</td>
                <td style="color:#d32f2f">${a.rejected}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="flex:1;background:#e0e0e0;border-radius:4px;height:8px;min-width:60px;">
                            <div style="width:${convRate}%;background:#43a047;height:100%;border-radius:4px;transition:width 0.5s;"></div>
                        </div>
                        <span style="font-weight:600;color:#388e3c;">${convRate}%</span>
                    </div>
                </td>`;
            tbody.appendChild(row);
        });
    } catch (e) { console.error('loadTelesalesPerformance error:', e); }
}

async function distributeLeads() {
    const perAgent = parseInt(document.getElementById('mod-leads-per-agent')?.value || '30');
    const btn = document.getElementById('btn-distribute-leads');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Distributing...'; }

    try {
        const resp = await fetch(`${API_BASE}/api/v1/leads/distribute?leadsPerAgent=${perAgent}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!resp.ok) throw new Error('Failed');
        const result = await resp.json();

        const total = result.total || 0;
        if (total === 0) {
            showToast(result.message || 'No unassigned leads to distribute', 'warning');
        } else {
            showToast(`✅ Distributed ${total} leads successfully!`, 'success');
        }
        loadModeratorLeads();
    } catch (e) {
        showToast('Distribution failed', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-random"></i> Distribute Now'; }
    }
}

async function bulkImportLeads() {
    const textarea = document.getElementById('mod-bulk-leads-input');
    if (!textarea) return;

    let lines = textarea.value.trim().split('\n').filter(l => l.trim());
    if (!lines.length) { showToast('No leads entered', 'error'); return; }

    // Parse format: "Full Name,Phone,Source,Notes"
    const leads = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
            fullName: parts[0] || 'Unknown',
            phoneNumber: parts[1] || '',
            source: parts[2] || '',
            moderatorNotes: parts[3] || '',
        };
    }).filter(l => l.phoneNumber);

    if (!leads.length) { showToast('No valid leads found. Format: Name,Phone,Source,Notes', 'error'); return; }

    const btn = document.getElementById('btn-bulk-import');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...'; }

    try {
        const resp = await fetch(`${API_BASE}/api/v1/leads/bulk-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(leads)
        });
        if (!resp.ok) throw new Error();
        const saved = await resp.json();
        showToast(`✅ Imported ${saved.length} leads successfully!`, 'success');
        textarea.value = '';
        loadModeratorLeads();
        loadUnassignedCount();
    } catch (e) {
        showToast('Bulk import failed', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload"></i> Import Leads'; }
    }
}

function setupModeratorListeners() {
    const btnDist = document.getElementById('btn-distribute-leads');
    if (btnDist && !btnDist._listenerAdded) {
        btnDist.addEventListener('click', distributeLeads);
        btnDist._listenerAdded = true;
    }
    const btnImport = document.getElementById('btn-bulk-import');
    if (btnImport && !btnImport._listenerAdded) {
        btnImport.addEventListener('click', bulkImportLeads);
        btnImport._listenerAdded = true;
    }
    const modStatus = document.getElementById('mod-filter-status');
    if (modStatus && !modStatus._listenerAdded) {
        modStatus.addEventListener('change', () => loadModeratorLeads(0));
        modStatus._listenerAdded = true;
    }
    const modSearch = document.getElementById('mod-search-leads');
    if (modSearch && !modSearch._listenerAdded) {
        modSearch.addEventListener('input', () => loadModeratorLeads(0));
        modSearch._listenerAdded = true;
    }
    const dip = document.getElementById('mod-filter-diploma');
    if (dip && !dip._listenerAdded) {
        dip.addEventListener('change', () => loadModeratorLeads(0));
        dip._listenerAdded = true;
    }

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
    if (leadDate) setInputDate(leadDate);

    const hoursDate = document.getElementById('attendance-entry-date');
    if (hoursDate) setInputDate(hoursDate);

    // Also setup Add Lead modal button for moderator
    const modBtn = document.getElementById('btn-open-add-lead-moderator');
    if (modBtn) modBtn.onclick = () => openAddLeadModal('admin');
}

// ==========================================
// TELESALES – My Leads
// ==========================================

let _myLeadsPage = 0;
let _currentCallLeadId = null;

async function loadDiplomasForTelesalesForm() {
    // Same as moderator – just populate filters
    await loadDiplomasForModeratorForm();
}

async function loadTelesalesLeads(page = 0) {
    const status = document.getElementById('tele-filter-status')?.value || '';

    try {
        let url = `${API_BASE}/api/v1/leads/my-leads?size=10&page=${page}&sortBy=createdAt&sortDirection=DESC`;
        if (status) url += `&status=${status}`;

        const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (!resp.ok) throw new Error('Failed');
        const data = await resp.json();

        renderTelesalesLeadsTable(data.content || []);
        renderPagination('tele-leads-pagination', data, (p) => loadTelesalesLeads(p));

        // Load stats
        loadMyLeadsStats();
    } catch (e) {
        console.error('loadTelesalesLeads error:', e);
        showToast('Failed to load your leads', 'error');
    }
}

async function loadMyLeadsStats() {
    try {
        const resp = await fetch(`${API_BASE}/api/v1/leads/my-leads/stats`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (!resp.ok) return;
        const stats = await resp.json();

        const map = { total: 'tele-stat-total', open: 'tele-stat-open', interested: 'tele-stat-interested', enrolled: 'tele-stat-enrolled', rejected: 'tele-stat-rejected' };
        Object.entries(map).forEach(([key, id]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = stats[key] || 0;
        });
    } catch (e) { /* silent */ }
}

function renderTelesalesLeadsTable(leads) {
    const tbody = document.getElementById('tele-leads-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!leads.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#aaa;"><i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No leads assigned to you yet.</td></tr>';
        return;
    }

    leads.forEach(l => {
        const attempts = (l.followUps || []).length;
        const canAttempt = attempts < 3;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div style="font-weight:600;color:#333;">${l.fullName || '-'}</div></td>
            <td>
                <a href="tel:${l.phoneNumber}" style="color:#1565c0;font-weight:600;text-decoration:none;">
                    <i class="fas fa-phone" style="margin-right:4px;"></i>${l.phoneNumber || '-'}
                </a>
            </td>
            <td>${l.diploma?.name || '<span style="color:#bbb">—</span>'}</td>
            <td>${renderLeadStatus(l.status)}</td>
            <td>${renderAttemptDots(attempts)}</td>
            <td>
                ${canAttempt
                ? `<button onclick="openCallModal(${l.id}, ${attempts})" style="
                        background:linear-gradient(135deg,#1565c0,#42a5f5);color:#fff;border:none;
                        padding:7px 14px;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.82rem;
                        display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 6px rgba(21,101,192,0.3);">
                        <i class="fas fa-phone-alt"></i> Attempt ${attempts + 1}
                      </button>`
                : `<span style="color:#bbb;font-size:0.8rem;"><i class="fas fa-lock"></i> Max reached</span>`
            }
                <button onclick="openLeadDetail(${l.id})" style="
                    background:#f5f5f5;color:#555;border:none;padding:7px 10px;
                    border-radius:8px;cursor:pointer;margin-left:4px;">
                    <i class="fas fa-eye"></i>
                </button>
            </td>`;
        tbody.appendChild(row);
    });
}

function openCallModal(leadId, currentAttempts) {
    _currentCallLeadId = leadId;
    const modal = document.getElementById('call-attempt-modal');
    if (!modal) return;

    const attemptNum = currentAttempts + 1;
    const modalTitle = modal.querySelector('#call-modal-title');
    const attemptIndicator = modal.querySelector('#call-attempt-indicator');

    if (modalTitle) modalTitle.textContent = `Record Call Attempt ${attemptNum}/3`;
    if (attemptIndicator) attemptIndicator.innerHTML = renderAttemptDots(currentAttempts) + `<span style="margin-left:8px;font-size:0.85rem;color:#666;">This will be attempt <strong>${attemptNum}</strong></span>`;

    // Reset form
    const form = modal.querySelector('#form-call-attempt');
    if (form) form.reset();

    modal.style.display = 'flex';
}

async function saveCallAttempt() {
    if (!_currentCallLeadId) return;

    const status = document.getElementById('call-status')?.value;
    const message = document.getElementById('call-notes')?.value?.trim();

    if (!status) { showToast('Please select a status', 'error'); return; }
    if (!message) { showToast('Please enter call notes', 'error'); return; }

    const btn = document.getElementById('btn-save-call');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    try {
        const resp = await fetch(`${API_BASE}/api/v1/leads/${_currentCallLeadId}/follow-ups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ status, message })
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.message || 'Failed');
        }

        showToast('✅ Call attempt recorded successfully!', 'success');
        document.getElementById('call-attempt-modal').style.display = 'none';
        _currentCallLeadId = null;
        loadTelesalesLeads(_myLeadsPage);
    } catch (e) {
        showToast(e.message || 'Failed to record attempt', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save Attempt'; }
    }
}

function setupTelesalesListeners() {
    const filterStatus = document.getElementById('tele-filter-status');
    if (filterStatus && !filterStatus._listenerAdded) {
        filterStatus.addEventListener('change', () => loadTelesalesLeads(0));
        filterStatus._listenerAdded = true;
    }

    const closeModal = document.getElementById('close-call-modal');
    if (closeModal && !closeModal._listenerAdded) {
        closeModal.addEventListener('click', () => {
            document.getElementById('call-attempt-modal').style.display = 'none';
            _currentCallLeadId = null;
        });
        closeModal._listenerAdded = true;
    }

    const saveBtn = document.getElementById('btn-save-call');
    if (saveBtn && !saveBtn._listenerAdded) {
        saveBtn.addEventListener('click', saveCallAttempt);
        saveBtn._listenerAdded = true;
    }
}

