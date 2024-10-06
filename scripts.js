const targetText = document.getElementById('targetText');
const userInput = document.getElementById('userInput');
const congratulations = document.getElementById('congratulations');
const clickInstruction = document.getElementById('clickInstruction');
const resetButton = document.getElementById('resetButton');

// Define texts for each level
const texts = {
    easy: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    medium: 'The quick brown fox jumps over the lazy dog.',
    hard: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    impossible: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'
};

let originalText = texts.easy; // Set default text

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
        resetButton.classList.remove('hidden');
    } else {
        congratulations.classList.add('hidden');
        resetButton.classList.add('hidden');
    }
}

// Event listener for difficulty levels
document.querySelectorAll('.level').forEach(level => {
    level.addEventListener('click', (e) => {
        const selectedLevel = e.target.getAttribute('data-level');
        updateLevel(selectedLevel);
    });
});

// Function to update the level and text
function updateLevel(level) {
    originalText = texts[level]; // Update the original text based on selected level
    targetText.innerHTML = ''; // Clear the displayed text
    userInput.value = ''; // Clear the input
    congratulations.classList.add('hidden'); // Hide the congratulations message
    resetButton.classList.add('hidden'); // Hide the reset button
    clickInstruction.style.display = 'block'; // Show the click instruction

    // Reset text display
    for (let i = 0; i < originalText.length; i++) {
        targetText.innerHTML += originalText[i];
    }
}

// Event listener for text input
userInput.addEventListener('input', () => {
    const inputText = userInput.value;
    updateText(inputText);
    checkCompletion(inputText);
});

// Function to focus on input when the container is clicked
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

// Reset button event listener
resetButton.addEventListener('click', () => {
    userInput.value = '';
    targetText.innerHTML = originalText; // Reset to the current level's text
    congratulations.classList.add('hidden');
    resetButton.classList.add('hidden');
    clickInstruction.style.display = 'block';
    userInput.focus();
});
