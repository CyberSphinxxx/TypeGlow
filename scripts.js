const targetText = document.getElementById('targetText');
const userInput = document.getElementById('userInput');
const congratulations = document.getElementById('congratulations');
const clickInstruction = document.getElementById('clickInstruction');
const resetButton = document.getElementById('resetButton');

const words = {
    easy: [
        'apple', 'banana', 'cat', 'dog', 'elephant',
        'fish', 'grape', 'hat', 'igloo', 'juice', 'ham',
        'orange', 'lemon', 'pencil', 'kite', 'robot', 'sun',
        'tree', 'cup', 'book', 'egg', 'vase', 'wolf', 'stone',
        'jet', 'door'
    ],
    medium: [
        'cucumber', 'tomato', 'computer', 'internet',
        'keyboard', 'mouse', 'window', 'software',
        'programming', 'algorithm', 'bicycle', 'mountain', 'library',
        'umbrella', 'calculator', 'elephant', 'sunflower', 'chocolate',
        'engineer', 'parachute'
    ],
    hard: [
        'extraordinary', 'communication', 'development',
        'unbelievable', 'conventional', 'mathematics',
        'revolutionary', 'understanding', 'experimental',
        'comprehension', 'implementation', 'circumference',
        'interpretation', 'architecture', 'sophistication',
        'psychology', 'philosophy', 'institutional',
        'transformation', 'infrastructure'
    ],
    impossible: [
        'incomprehensibilities', 'overcompensating',
        'disproportionately', 'electroencephalography',
        'interdisciplinary', 'microarchitecture',
        'counterproductive', 'disestablishmentarianism',
        'psychophysiological', 'electromagnetism', 'antidisestablishmentarianism',
        'uncharacteristically', 'subterraneanly', 'unconstitutionally', 'misunderstanding',
        'internationalization', 'hypercholesterolemia',
        'deinstitutionalization', 'thermodynamically'
    ]
};

let originalText = 'Choose a Level to Start Playing'; // Set default text
let startTime; // Variable to store the start time
let typingComplete = false; // Track whether the user has completed typing
let levelChosen = false; // Track if a level is chosen

// Initially disable the input field
userInput.disabled = true;

// Create a WPM display element
const wpmDisplay = document.createElement('p');
wpmDisplay.setAttribute('id', 'wpmDisplay');
document.querySelector('.container').appendChild(wpmDisplay); // Append to the container

// Function to get random words from the selected level
function getRandomWords(level) {
    const levelWords = words[level];
    const numberOfWords = level === 'easy' ? 10 : level === 'medium' ? 12 : level === 'hard' ? 10 : 10;

    // Shuffle the words array
    const shuffledWords = levelWords.sort(() => 0.5 - Math.random());

    // Get the first 'numberOfWords' from the shuffled array
    return shuffledWords.slice(0, numberOfWords).join(' ');
}

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

// Function to check if the user has completed typing the text and calculate WPM
function checkCompletion(inputText) {
    if (inputText === originalText) {
        typingComplete = true; // Mark typing as complete
        userInput.disabled = true; // Disable input field after completion
        
        congratulations.classList.remove('hidden');
        resetButton.classList.remove('hidden');
        
        // Calculate WPM
        const endTime = new Date(); // Get end time
        const timeTakenInMinutes = (endTime - startTime) / 60000; // Time taken in minutes
        const wordCount = originalText.split(' ').length; // Calculate the number of words
        const wpm = Math.round(wordCount / timeTakenInMinutes); // Calculate WPM
        
        // Display WPM
        wpmDisplay.textContent = `Your WPM: ${wpm}`;
    }
    
    else {
        congratulations.classList.add('hidden');
        resetButton.classList.add('hidden');
        wpmDisplay.textContent = ''; // Clear WPM display if text is not completed
    }
}

// Event listener for difficulty levels
document.querySelectorAll('.level').forEach(level => {
    level.addEventListener('click', (e) => {
        const selectedLevel = e.target.getAttribute('data-level');
        updateLevel(selectedLevel);
        userInput.disabled = false; // Enable the input field when a level is selected
        userInput.focus(); // Focus on the input field
        levelChosen = true; // Mark that a level has been chosen
        typingComplete = false; // Reset typing completion status
    });
});

// Function to update the level and text
function updateLevel(level) {
    originalText = getRandomWords(level); // Get random words based on selected level
    targetText.innerHTML = ''; // Clear the displayed text
    userInput.value = ''; // Clear the input
    congratulations.classList.add('hidden'); // Hide the congratulations message
    resetButton.classList.add('hidden'); // Hide the reset button
    clickInstruction.style.display = 'block'; // Show the click instruction
    wpmDisplay.textContent = ''; // Clear WPM display

    // Start timer
    startTime = new Date(); // Record the start time
    
    // Reset text display
    targetText.innerHTML = originalText; // Set the new target text
}

// Event listener for text input
userInput.addEventListener('input', () => {
    if (!typingComplete && levelChosen) { // Only allow typing if a level is chosen and typing is not complete
        const inputText = userInput.value;
        updateText(inputText);
        checkCompletion(inputText);
    }
});

// Function to focus on input when the container is clicked
function focusInput() {
    if (levelChosen && !typingComplete) {
        userInput.focus();
    }
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
    const selectedLevel = document.querySelector('.level[data-selected="true"]').getAttribute('data-level');
    updateLevel(selectedLevel);
    userInput.disabled = true; // Disable input until the user selects a new level
    levelChosen = false; // Reset levelChosen flag
    typingComplete = false; // Reset typing completion status
});
