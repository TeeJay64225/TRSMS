// Mobile dropdown toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the mobile invoice dropdown toggle
    const mobileDropdownToggle = document.querySelector('.mobile-dropdown-toggle');
    const mobileDropdownContent = document.querySelector('.mobile-dropdown-content');
    const mobileNavItemDropdown = document.querySelector('.mobile-nav-item.dropdown');
    
    // Toggle dropdown on click
    if (mobileDropdownToggle && mobileDropdownContent) {
        mobileDropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            mobileDropdownContent.classList.toggle('show');
            mobileNavItemDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileNavItemDropdown.contains(e.target)) {
                mobileDropdownContent.classList.remove('show');
                mobileNavItemDropdown.classList.remove('active');
            }
        });
    }
    
    // Close mobile dropdown when navigating to a new page
    const dropdownLinks = document.querySelectorAll('.mobile-dropdown-content a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileDropdownContent.classList.remove('show');
            mobileNavItemDropdown.classList.remove('active');
        });
    });
});