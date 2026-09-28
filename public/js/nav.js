document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'orders.html';

  // Highlight active nav item
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const text = item.textContent.trim().toLowerCase();
    
    if (text.includes('orders') && currentPath.includes('orders.html')) {
      item.href = 'orders.html';
    } else if (text.includes('orders')) {
      item.href = 'orders.html';
    }

    if (text.includes('tables') && (currentPath.includes('tables.html') || currentPath.includes('table_grid.html') || currentPath.includes('select_table.html'))) {
      item.href = 'tables.html';
    } else if (text.includes('tables')) {
      item.href = 'tables.html';
    }

    if (text.includes('clock') && currentPath.includes('attendance.html')) {
      item.href = 'attendance.html';
    } else if (text.includes('clock')) {
      item.href = 'attendance.html';
    }

    if (text.includes('profile') && currentPath.includes('profile.html')) {
      item.href = 'profile.html';
    } else if (text.includes('profile')) {
      item.href = 'profile.html';
    }
  });

  // Attach New Order button handler
  const newOrderBtns = document.querySelectorAll('.new-order-btn, .btn-primary');
  newOrderBtns.forEach(btn => {
    if (btn.textContent.toLowerCase().includes('new order')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'select_table.html';
      });
    }
  });

  // Attach Brand link handler
  const brandLinks = document.querySelectorAll('.brand, .logo h1');
  brandLinks.forEach(brand => {
    brand.style.cursor = 'pointer';
    brand.addEventListener('click', () => {
      window.location.href = 'orders.html';
    });
  });

  // Dynamic profile picture & name synchronization for sidebar across all pages
  if (window.API && typeof window.API.fetchProfile === 'function') {
    window.API.fetchProfile().then(res => {
      if (res && res.profile) {
        const p = res.profile;
        if (p.avatarUrl) {
          const staffAvatarContainers = document.querySelectorAll('.staff-avatar');
          staffAvatarContainers.forEach(container => {
            let img = container.querySelector('img');
            if (!img) {
              container.innerHTML = `<img src="${p.avatarUrl}" alt="${p.name || 'Staff'}" style="width:100%;height:100%;object-fit:cover;">`;
            } else {
              img.src = p.avatarUrl;
            }
          });
        }
        if (p.name || p.fullName) {
          const nameToUse = p.fullName || p.name;
          const staffNameEls = document.querySelectorAll('.staff-name');
          staffNameEls.forEach(el => {
            el.textContent = nameToUse;
          });
        }
        if (p.role) {
          const staffRoleEls = document.querySelectorAll('.staff-role');
          staffRoleEls.forEach(el => {
            el.textContent = p.role;
          });
        }
      }
    }).catch(() => {});
  }

  // ==================== TOP BAR 3 ICONS HANDLERS ====================
  // Inject Dynamic Styles for Notifications, Quick Menu, and Sign Out Modal
  if (!document.getElementById('nav-dynamic-styles')) {
    const navStyle = document.createElement('style');
    navStyle.id = 'nav-dynamic-styles';
    navStyle.textContent = `
      .top-right, .header-right {
        position: relative !important;
      }

      .top-right svg, .header-right svg {
        cursor: pointer !important;
        transition: transform 0.15s ease, color 0.15s ease;
      }
      .top-right svg:hover, .header-right svg:hover {
        color: #FF7A45 !important;
        transform: scale(1.12);
      }

      .nav-bell-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .nav-bell-dot {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 8px;
        height: 8px;
        background-color: #FF7A45;
        border-radius: 50%;
        border: 2px solid #1B1F23;
        pointer-events: none;
      }

      /* Popover Dropdown Container */
      .nav-popover-dropdown {
        position: absolute;
        top: calc(100% + 14px);
        right: 0;
        width: 320px;
        background: #262B30;
        border: 1px solid #2E343A;
        border-radius: 14px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
        z-index: 10000;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: navPopFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .nav-popover-dropdown.show {
        display: flex;
      }

      @keyframes navPopFadeIn {
        from { opacity: 0; transform: translateY(-8px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .nav-popover-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid #2E343A;
        background: #1F2429;
      }

      .nav-popover-title {
        font-size: 13px;
        font-weight: 600;
        color: #FAFAFA;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .nav-popover-action {
        font-size: 11px;
        color: #FF7A45;
        background: transparent;
        border: none;
        cursor: pointer;
        font-weight: 500;
      }

      .nav-popover-action:hover {
        text-decoration: underline;
      }

      .nav-popover-body {
        max-height: 280px;
        overflow-y: auto;
        padding: 4px 0;
      }

      .nav-notif-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 16px;
        transition: background 0.15s ease;
        cursor: pointer;
        border-bottom: 1px solid rgba(255,255,255,0.03);
      }

      .nav-notif-item:hover {
        background: rgba(255, 122, 69, 0.08);
      }

      .nav-notif-item:last-child {
        border-bottom: none;
      }

      .nav-notif-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .nav-notif-icon.ready { background: rgba(76, 175, 80, 0.15); color: #4CAF50; }
      .nav-notif-icon.amber { background: rgba(245, 166, 35, 0.15); color: #F5A623; }
      .nav-notif-icon.blue { background: rgba(76, 154, 255, 0.15); color: #4C9AFF; }

      .nav-notif-content {
        flex: 1;
      }

      .nav-notif-title {
        font-size: 12px;
        font-weight: 600;
        color: #FAFAFA;
        margin-bottom: 2px;
      }

      .nav-notif-subtitle {
        font-size: 11px;
        color: #9CA3AF;
        line-height: 1.3;
      }

      .nav-notif-time {
        font-size: 10px;
        color: #6B7280;
        margin-top: 4px;
      }

      /* Quick Menu Link Items */
      .nav-menu-dropdown {
        width: 230px !important;
      }

      .nav-menu-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: #FAFAFA;
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.15s ease;
        border-bottom: 1px solid rgba(255,255,255,0.03);
      }

      .nav-menu-link:last-child {
        border-bottom: none;
      }

      .nav-menu-link:hover {
        background: rgba(255, 122, 69, 0.15);
        color: #FF7A45;
      }

      .nav-menu-link svg {
        width: 16px;
        height: 16px;
        color: #9CA3AF;
      }

      .nav-menu-link:hover svg {
        color: #FF7A45;
      }

      /* Logout Modal Overlay */
      .nav-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(5px);
        z-index: 30000;
        display: none;
        align-items: center;
        justify-content: center;
        animation: navModalFadeIn 0.2s ease;
      }

      .nav-modal-backdrop.show {
        display: flex;
      }

      .nav-modal-card {
        background: #262B30;
        border: 1px solid #2E343A;
        border-radius: 16px;
        width: 90%;
        max-width: 380px;
        padding: 26px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        text-align: center;
        animation: navModalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes navModalSlideUp {
        from { transform: translateY(20px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }

      .nav-modal-icon-badge {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: rgba(230, 57, 70, 0.15);
        border: 1px solid rgba(230, 57, 70, 0.3);
        color: #E63946;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
      }

      .nav-modal-title {
        font-size: 18px;
        font-weight: 700;
        color: #FAFAFA;
        margin-bottom: 8px;
      }

      .nav-modal-desc {
        font-size: 13px;
        color: #9CA3AF;
        line-height: 1.5;
        margin-bottom: 22px;
      }

      .nav-modal-actions {
        display: flex;
        gap: 12px;
      }

      .nav-modal-btn-cancel {
        flex: 1;
        background: transparent;
        border: 1px solid #2E343A;
        color: #FAFAFA;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .nav-modal-btn-cancel:hover {
        background: #1B1F23;
      }

      .nav-modal-btn-danger {
        flex: 1;
        background: #E63946;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .nav-modal-btn-danger:hover {
        background: #C82333;
      }
    `;
    document.head.appendChild(navStyle);
  }

  // Create Notifications Dropdown HTML
  let notifDropdown = document.getElementById('nav-notif-dropdown');
  if (!notifDropdown) {
    notifDropdown = document.createElement('div');
    notifDropdown.id = 'nav-notif-dropdown';
    notifDropdown.className = 'nav-popover-dropdown';
    notifDropdown.innerHTML = `
      <div class="nav-popover-header">
        <div class="nav-popover-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:#FF7A45;">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          Notifications
        </div>
        <button type="button" class="nav-popover-action" id="nav-clear-notif">Mark all as read</button>
      </div>
      <div class="nav-popover-body">
        <div class="nav-notif-item">
          <div class="nav-notif-icon ready">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="nav-notif-content">
            <div class="nav-notif-title">Order #2409 Ready</div>
            <div class="nav-notif-subtitle">Table 03 • Dry Aged Burger & Truffle Fries are ready to serve</div>
            <div class="nav-notif-time">2 mins ago</div>
          </div>
        </div>

        <div class="nav-notif-item">
          <div class="nav-notif-icon amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div class="nav-notif-content">
            <div class="nav-notif-title">Table 07 Request</div>
            <div class="nav-notif-subtitle">Customer requested additional water & condiments</div>
            <div class="nav-notif-time">10 mins ago</div>
          </div>
        </div>

        <div class="nav-notif-item">
          <div class="nav-notif-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="nav-notif-content">
            <div class="nav-notif-title">Shift Active</div>
            <div class="nav-notif-subtitle">Successfully clocked in for today's shift</div>
            <div class="nav-notif-time">45 mins ago</div>
          </div>
        </div>
      </div>
    `;
  }

  // Create Quick Menu Dropdown HTML
  let menuDropdown = document.getElementById('nav-menu-dropdown');
  if (!menuDropdown) {
    menuDropdown = document.createElement('div');
    menuDropdown.id = 'nav-menu-dropdown';
    menuDropdown.className = 'nav-popover-dropdown nav-menu-dropdown';
    menuDropdown.innerHTML = `
      <div class="nav-popover-header">
        <div class="nav-popover-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:#FF7A45;">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          Quick Menu
        </div>
      </div>
      <div class="nav-popover-body">
        <a href="orders.html" class="nav-menu-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          Orders Overview
        </a>
        <a href="tables.html" class="nav-menu-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Tables Map
        </a>
        <a href="attendance.html" class="nav-menu-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Clock & Shift
        </a>
        <a href="profile.html" class="nav-menu-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Staff Profile
        </a>
        <a href="select_table.html" class="nav-menu-link" style="color:#FF7A45; font-weight:600;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#FF7A45" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Order
        </a>
      </div>
    `;
  }

  // Create Logout Modal HTML
  let logoutModal = document.getElementById('nav-logout-modal');
  if (!logoutModal) {
    logoutModal = document.createElement('div');
    logoutModal.id = 'nav-logout-modal';
    logoutModal.className = 'nav-modal-backdrop';
    logoutModal.innerHTML = `
      <div class="nav-modal-card">
        <div class="nav-modal-icon-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:26px;height:26px;">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <div class="nav-modal-title">Sign Out</div>
        <div class="nav-modal-desc">Are you sure you want to end your active shift and sign out of the Waitstaff Portal?</div>
        <div class="nav-modal-actions">
          <button type="button" class="nav-modal-btn-cancel" id="nav-logout-cancel">Cancel</button>
          <button type="button" class="nav-modal-btn-danger" id="nav-logout-confirm">Sign Out</button>
        </div>
      </div>
    `;
    document.body.appendChild(logoutModal);
  }

  // Attach elements to page header containers
  const headerContainers = document.querySelectorAll('.top-right, .header-right');
  headerContainers.forEach(container => {
    // Append popovers to container if not attached
    if (!container.contains(notifDropdown)) {
      container.appendChild(notifDropdown);
    }
    if (!container.contains(menuDropdown)) {
      container.appendChild(menuDropdown);
    }

    const svgs = container.querySelectorAll('svg');
    if (svgs.length >= 3) {
      const bellSvg = svgs[0];
      const menuSvg = svgs[1];
      const logoutSvg = svgs[2];

      // Bell Dot
      if (!bellSvg.parentElement.classList.contains('nav-bell-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'nav-bell-wrapper';
        bellSvg.parentNode.insertBefore(wrapper, bellSvg);
        wrapper.appendChild(bellSvg);

        const dot = document.createElement('span');
        dot.className = 'nav-bell-dot';
        dot.id = 'nav-bell-dot';
        wrapper.appendChild(dot);
      }

      // Bell Icon Click (1st icon)
      bellSvg.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.classList.remove('show');
        notifDropdown.classList.toggle('show');
      });

      // Menu Icon Click (2nd icon)
      menuSvg.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.remove('show');
        menuDropdown.classList.toggle('show');
      });

      // Logout Icon Click (3rd icon)
      logoutSvg.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.remove('show');
        menuDropdown.classList.remove('show');
        logoutModal.classList.add('show');
      });
    }
  });

  // Attach all Sign Out buttons on page (e.g. footer sign out buttons)
  const signOutBtns = document.querySelectorAll('.sign-out-btn');
  signOutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutModal.classList.add('show');
    });
  });

  // Clear notifications event
  const clearNotifBtn = document.getElementById('nav-clear-notif');
  if (clearNotifBtn) {
    clearNotifBtn.addEventListener('click', () => {
      const dot = document.getElementById('nav-bell-dot');
      if (dot) dot.style.display = 'none';
      const notifItems = notifDropdown.querySelectorAll('.nav-notif-item');
      notifItems.forEach(item => item.style.opacity = '0.5');
      clearNotifBtn.textContent = 'All read';
      clearNotifBtn.disabled = true;
    });
  }

  // Logout modal events
  const cancelLogoutBtn = document.getElementById('nav-logout-cancel');
  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener('click', () => {
      logoutModal.classList.remove('show');
    });
  }

  const confirmLogoutBtn = document.getElementById('nav-logout-confirm');
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', () => {
      logoutModal.classList.remove('show');
      alert('Signed out successfully.');
      window.location.href = 'orders.html';
    });
  }

  // Close popovers on outside click
  document.addEventListener('click', (e) => {
    if (notifDropdown && !notifDropdown.contains(e.target)) {
      notifDropdown.classList.remove('show');
    }
    if (menuDropdown && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.remove('show');
    }
  });
});

