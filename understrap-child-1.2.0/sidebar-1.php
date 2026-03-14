<div class="sidebar-inner px-4 pt-3">
    <div class="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
        <div class="d-flex align-items-center">
            <div class="avatar-lg me-4">
                <!-- User avatar -->
                <svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                </svg>
            </div>
            <div class="d-block">
                <h2 class="h5 mb-3">Hi, Jane</h2>
                <a href="../pages/examples/sign-in.html" class="btn btn-secondary btn-sm d-inline-flex align-items-center">
                    <svg class="icon icon-xxs me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Sign Out
                </a>
            </div>
        </div>
        <div class="collapse-close d-md-none">
            <a href="#sidebarMenu" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="true" aria-label="Toggle navigation">
                <svg class="icon icon-xs" fill="black" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </a>
        </div>
    </div>

    <ul class="nav flex-column pt-3 pt-md-0">
        <li class="nav-item">
            <a href="http://localhost:8888/asset_one" class="nav-link d-flex align-items-center">
                <span class="sidebar-icon">
                    <img src="http://localhost:8888/asset_one/wp-content/themes/1pwr_asset_one/assets/img/brand/1pwr_logo.png" style="margin-top: -5px; width: 80%;" alt="1PWR Logo">
                </span>
            </a>
        </li>
        <li class="nav-item">
            <a href="http://localhost:8888/asset_one" class="nav-link">
                <span class="sidebar-icon">
                    <svg class="icon icon-xs me-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                    </svg>
                </span>
                <span class="sidebar-text">Dashboard</span>
            </a>
        </li>
        <!-- Assets Menu -->
        <li class="nav-item">
            <span class="nav-link collapsed d-flex justify-content-between align-items-center" data-bs-toggle="collapse" data-bs-target="#submenu-assets" aria-expanded="false">
                <span>
                    <span class="sidebar-icon">
                        <svg class="icon icon-xs me-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9V9h2v4zm0-6H9V5h2v2z"></path>
                        </svg>
                    </span>
                    <span class="sidebar-text">Assets</span>
                </span>
                <span class="link-arrow">
                    <svg class="icon icon-sm" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                </span>
            </span>
            <div class="multi-level collapse" role="list" id="submenu-assets" aria-expanded="false">
                <ul class="flex-column nav">
                    <li class="nav-item">
                        <a class="nav-link" href="http://localhost:8888/asset_one/index.php/all-assets/">
                            <span class="sidebar-text">View All</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="http://localhost:8888/asset_one/index.php/add-new-asset/">
                            <span class="sidebar-text">Add New Asset</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="http://localhost:8888/asset_one/index.php/categories/">
                            <span class="sidebar-text">Categories</span>
                        </a>
                    </li>
                </ul>
            </div>
        </li>
        <!-- Employees Menu -->
        <li class="nav-item">
            <span class="nav-link collapsed d-flex justify-content-between align-items-center" data-bs-toggle="collapse" data-bs-target="#submenu-employees" aria-expanded="false">
                <span>
                    <span class="sidebar-icon">
                        <svg class="icon icon-xs me-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 2a2 2 0 00-2 2v1h4V4a2 2 0 00-2-2z"></path>
                            <path fill-rule="evenodd" d="M2 9a2 2 0 012-2h12a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2V9zm4 1a1 1 0 100 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                        </svg>
                    </span>
                    <span class="sidebar-text">Employees</span>
                </span>
                <span class="link-arrow">
                    <svg class="icon icon-sm" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                </span>
            </span>
            <div class="multi-level collapse" role="list" id="submenu-employees" aria-expanded="false">
                <ul class="flex-column nav">
                    <li class="nav-item">
                        <a class="nav-link" href="http://localhost:8888/asset_one/index.php/view-all-employees/">
                            <span class="sidebar-text">View All Employees</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="http://localhost:8888/asset_one/index.php/employee-add-new/">
                            <span class="sidebar-text">Add New</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="http://localhost:8888/asset_one/index.php/departments/">
                            <span class="sidebar-text">Departments</span>
                        </a>
                    </li>
                </ul>
            </div>
        </li>
        <!-- Requests Menu -->
        <li class="nav-item">
            <span class="nav-link collapsed d-flex justify-content-between align-items-center" data-bs-toggle="collapse" data-bs-target="#submenu-requests" aria-expanded="false">
                <span>
                    <span class="sidebar-icon">
                        <svg class="icon icon-xs me-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm1 3h10v10H5V5zm2 1a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z"></path>
                        </svg>
                    </span>
                    <span class="sidebar-text">Requests</span>
                </span>
                <span class="link-arrow">
                    <svg class="icon icon-sm" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                </span>
            </span>
            <div class="multi-level collapse" role="list" id="submenu-requests" aria-expanded="false">
                <ul class="flex-column nav">
                    <li class="nav-item">
                        <a class="nav-link" href="http://localhost:8888/asset_one/index.php/request-list/">
                            <span class="sidebar-text">View All Requests</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="http://localhost:8888/asset_one/index.php/asset-request-form/">
                            <span class="sidebar-text">Add New</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="http://localhost:8888/asset_one/index.php/asset-return-form/">
                            <span class="sidebar-text">Returns</span>
                        </a>
                    </li>
                </ul>
            </div>
        </li>
        <li role="separator" class="dropdown-divider mt-4 mb-3 border-gray-700"></li>
        <!-- Logged Out Links -->
        <li class="nav-item">
            <a href="http://localhost:8888/asset_one/index.php/login/" target="_blank" class="nav-link d-flex align-items-center">
                <span class="sidebar-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <circle cx="12" cy="7" r="4"></circle>
                        <path d="M15 13h-6v-2h6v-3l5 4-5 4v-3z"></path>
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
                    </svg>
                </span>
                <span class="sidebar-text">Sign In</span>
            </a>
        </li>
        <li class="nav-item">
            <a href="http://localhost:8888/asset_one/index.php/register/" target="_blank" class="nav-link d-flex align-items-center">
                <span class="sidebar-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <circle cx="12" cy="7" r="4"></circle>
                        <line x1="12" y1="13" x2="12" y2="19" stroke="currentColor" stroke-width="2"></line>
                        <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" stroke-width="2"></line>
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
                    </svg>
                </span>
                <span class="sidebar-text">Register</span>
            </a>
        </li>
    </ul>
</div>