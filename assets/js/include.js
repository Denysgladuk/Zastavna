document.addEventListener("DOMContentLoaded", function() {
    // Function to load HTML content
    function loadComponent(selector, file) {
        const element = document.querySelector(selector);
        if (element) {
            fetch(file)
                .then(response => {
                    if (!response.ok) throw new Error("Component not found");
                    return response.text();
                })
                .then(data => {
                    element.innerHTML = data;
                    
                    // Dispatch event so other scripts know header is loaded
                    // (Important for your navigation.js to work!)
                    if (selector === '#header-placeholder') {
                        document.dispatchEvent(new Event('headerLoaded'));
                    }
                })
                .catch(err => console.error(err));
        }
    }

    // Load Header and Footer
    // Note: We use absolute paths (starting with /) so this works from any folder
    loadComponent("#header-placeholder", "/components/header.html");
    loadComponent("#footer-placeholder", "/components/footer.html");
});