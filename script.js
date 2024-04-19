document.addEventListener('DOMContentLoaded', function () {
    const button = document.querySelector('.enter-button');
    const texts = document.querySelectorAll('header h1, header h2, footer p');

    function toggleBlendMode() {
        texts.forEach(text => {
            if (text.style.mixBlendMode === 'difference') {
                text.style.mixBlendMode = ''; // Reset to default
                text.style.color = ''; // Reset color to default
            } else {
                text.style.mixBlendMode = 'difference';
                text.style.color = '#A60C0C'; // Set color to white for visibility
            }
        });
    }

    button.addEventListener('mouseover', toggleBlendMode);
    button.addEventListener('mouseout', toggleBlendMode);
});
