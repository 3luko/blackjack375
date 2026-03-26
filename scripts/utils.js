export function updateUsername() {
    // READ: Get from storage
    const username = localStorage.getItem('username') || "Player";
    
    // DOM: Find the element
    const element = document.getElementById('username');
    
    // LOGIC: Only update if the element actually exists on this specific page
    if (element) {
        element.textContent = username;
    }
    
    return username;
}