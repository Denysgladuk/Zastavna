document.addEventListener("DOMContentLoaded", function() {
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
                    
                    if (selector === '#header-placeholder') {
                        document.dispatchEvent(new Event('headerLoaded'));
                    }
                })
                .catch(err => console.error(err));
        }
    }

    loadComponent("#header-placeholder", "/components/header.html");
    loadComponent("#footer-placeholder", "/components/footer.html");
});