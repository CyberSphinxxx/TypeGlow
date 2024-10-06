const targetText = document.getElementById('targetText');
const userInput = document.getElementById('userInput');
const originalText = 'Hello World!';
const congratulations = document.getElementById('congratulations');
const clickInstruction = document.getElementById('clickInstruction');
const resetButton = document.getElementById('resetButton');

// Function to update the displayed text based on user input
function updateText(inputText) {
    let formattedText = '';
    const currentIndex = inputText.length;

    for (let i = 0; i < originalText.length; i++) {
        if (i < currentIndex) {
            formattedText += inputText[i] === originalText[i] 
                ? `<span class="correct">${originalText[i]}</span>` 
                : `<span class="incorrect">${originalText[i]}</span>`;
        }
        
        else if (i === currentIndex) {
            formattedText += `<span class="current">${originalText[i]}</span>`;
        }
        
        else {
            formattedText += originalText[i];
        }
    }
    targetText.innerHTML = formattedText;
}

// Function to check if user has completed typing the text
function checkCompletion(inputText) {
    if (inputText === originalText) {
        congratulations.classList.remove('hidden');
        resetButton.classList.remove('hidden'); // Show the reset button
    }
    
    else {
        congratulations.classList.add('hidden');
        resetButton.classList.add('hidden'); // Hide the reset button if not complete
    }
}

// Event listener for text input
userInput.addEventListener('input', () => {
    const inputText = userInput.value;
    updateText(inputText);
    checkCompletion(inputText);
});

// Function to focus on input when container is clicked
function focusInput() {
    userInput.focus();
}

// Hide instruction when input is focused
userInput.addEventListener('focus', () => {
    clickInstruction.style.display = 'none';
});

// Show instruction if the input loses focus
userInput.addEventListener('blur', () => {
    if (userInput.value === '') {
        clickInstruction.style.display = 'block';
    }
});

// Hide instruction when the tab is focused
window.addEventListener('focus', () => {
    clickInstruction.style.display = 'none';
});

// Show instruction when the tab loses focus
window.addEventListener('blur', () => {
    clickInstruction.style.display = 'block';
});

// Add event listener for reset button
resetButton.addEventListener('click', () => {
    userInput.value = '';
    targetText.innerHTML = originalText;
    congratulations.classList.add('hidden');
    resetButton.classList.add('hidden');
    clickInstruction.style.display = 'block';
    userInput.focus();
});
