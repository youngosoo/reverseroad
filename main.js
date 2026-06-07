document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numbersContainer = document.querySelector('.numbers-container');
    const colors = [
        '#f44336', // Red
        '#e91e63', // Pink
        '#9c27b0', // Purple
        '#673ab7', // Deep Purple
        '#3f51b5', // Indigo
        '#2196f3', // Blue
        '#00bcd4', // Cyan
        '#009688', // Teal
        '#4caf50', // Green
        '#ff9800', // Orange
    ];

    generateBtn.addEventListener('click', () => {
        const lottoNumbers = generateLottoNumbers();
        displayNumbers(lottoNumbers);
    });

    function generateLottoNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function displayNumbers(numbers) {
        numbersContainer.innerHTML = '';
        numbers.forEach((number, index) => {
            const numberEl = document.createElement('div');
            numberEl.classList.add('number');
            numberEl.textContent = number;
            
            // Randomly select a color from the palette, but try to avoid duplicates in a row
            const colorIndex = (index + Math.floor(Math.random() * colors.length)) % colors.length;
            numberEl.style.backgroundColor = colors[colorIndex];
            
            // Add staggered delay for the animation
            numberEl.style.animationDelay = `${index * 0.1}s`;
            
            numbersContainer.appendChild(numberEl);
        });
    }
});