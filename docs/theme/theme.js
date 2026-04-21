document.addEventListener('DOMContentLoaded', () => {
    const lightRadio = document.getElementById('light-opt');
    const darkRadio = document.getElementById('dark-opt');

    function applyTheme(theme) {
        console.log("Switching to:", theme); 
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            darkRadio.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            lightRadio.checked = true;
        }
    }

    lightRadio.addEventListener('change', () => {
        applyTheme('light');
        localStorage.setItem('theme', 'light');
    });

    darkRadio.addEventListener('change', () => {
        applyTheme('dark');
        localStorage.setItem('theme', 'dark');
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
});