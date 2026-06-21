document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const baseApiUrl = 'https://dirictiondback.digitalrace.net/api/v1/notifications';
    const pageSize = 5;
    let currentPage = 0;
    let totalPages = 0;

    const bellContainer = document.getElementById('notification-bell-container');
    const bellDropdown = document.getElementById('notification-dropdown');
    const badge = document.getElementById('notification-badge');
    const notificationList = document.getElementById('notification-list');
    const noDataText = document.getElementById('notification-no-data');
    const markAllReadBtn = document.getElementById('notification-mark-all-read');

    const paginationContainer = document.getElementById('notification-pagination');
    const prevBtn = document.getElementById('notification-prev-btn');
    const nextBtn = document.getElementById('notification-next-btn');
    const pageInfo = document.getElementById('notification-page-info');

    if (!bellContainer || !bellDropdown || !badge || !notificationList) {
        console.warn('Notification UI elements not found');
        return;
    }

    // Fetch unread count
    async function fetchUnreadCount() {
        try {
            const response = await fetch(`${baseApiUrl}/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const count = await response.json();
                if (count > 0) {
                    badge.textContent = count;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }

    // Fetch my notifications
    async function fetchNotifications(page = 0) {
        try {
            const response = await fetch(`${baseApiUrl}/my?page=${page}&size=${pageSize}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const pageData = await response.json();
                currentPage = pageData.number;
                totalPages = pageData.totalPages;
                renderNotifications(pageData.content);
                updatePaginationControls();
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    // Update pagination controls
    function updatePaginationControls() {
        if (!paginationContainer || !prevBtn || !nextBtn || !pageInfo) return;

        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';
        pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;

        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage >= totalPages - 1;
    }

    // Mark single notification as read
    async function markAsRead(id) {
        try {
            const response = await fetch(`${baseApiUrl}/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                await fetchUnreadCount();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Mark all as read
    async function markAllAsRead() {
        try {
            const response = await fetch(`${baseApiUrl}/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                await fetchUnreadCount();
                // Refresh list if dropdown is open, keeping the current page
                if (bellDropdown.classList.contains('show')) {
                    await fetchNotifications(currentPage);
                }
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    // Render notifications inside dropdown
    function renderNotifications(notifications) {
        notificationList.innerHTML = '';
        if (!notifications || notifications.length === 0) {
            noDataText.style.display = 'block';
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }

        noDataText.style.display = 'none';

        notifications.forEach(notif => {
            const li = document.createElement('li');
            li.className = `notification-item ${notif.isRead ? '' : 'unread'}`;
            li.dataset.id = notif.id;

            const timeStr = formatRelativeTime(notif.createdAt);

            li.innerHTML = `
                <span class="notification-item-text">${notif.message}</span>
                <span class="notification-item-time">${timeStr}</span>
            `;

            li.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!notif.isRead) {
                    await markAsRead(notif.id);
                    li.classList.remove('unread');
                }

                // Navigate or filter views based on type/referenceId
                handleNotificationClick(notif.type, notif.referenceId);
                bellDropdown.classList.remove('show');
            });

            notificationList.appendChild(li);
        });
    }

    function formatRelativeTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }

    function handleNotificationClick(type, referenceId) {
        if (!referenceId) return;

        if (type.startsWith('LEAD_')) {
            const navLeads = document.getElementById('nav-leads');
            if (navLeads) navLeads.click();
        } else if (type.startsWith('STUDENT_')) {
            const navHome = document.getElementById('nav-home');
            if (navHome) navHome.click();
        } else if (type.startsWith('PAYMENT_')) {
            const navRevenue = document.getElementById('nav-finance-revenue');
            if (navRevenue) navRevenue.click();
        } else if (type.startsWith('TASK_')) {
            const navWorkHours = document.getElementById('nav-work-hours');
            if (navWorkHours) navWorkHours.click();
        }
    }

    // Toggle dropdown
    bellContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        bellDropdown.classList.toggle('show');
        if (bellDropdown.classList.contains('show')) {
            fetchNotifications(0); // Always start at first page
        }
    });

    // Pagination button event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentPage > 0) {
                fetchNotifications(currentPage - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentPage < totalPages - 1) {
                fetchNotifications(currentPage + 1);
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        bellDropdown.classList.remove('show');
    });

    bellDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    markAllReadBtn.addEventListener('click', () => {
        markAllAsRead();
    });

    // Initialize and start polling
    fetchUnreadCount();
    // Poll every 60 seconds
    setInterval(fetchUnreadCount, 60000);
});
