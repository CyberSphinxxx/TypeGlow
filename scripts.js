import { words } from './WORDSLIST/words.js';

const targetText        = document.getElementById('targetText');
const userInput         = document.getElementById('userInput');
const congratulations   = document.getElementById('congratulations');
const clickInstruction  = document.getElementById('clickInstruction');
const resetButton       = document.getElementById('resetButton');

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
    const numberOfWords = level === 'easy' ? 12 : level === 'medium' ? 12 : level === 'hard' ? 8 : 50;

    // Shuffle the words array
    const shuffledWords = [...levelWords].sort(() => 0.5 - Math.random());

    // Get the first 'numberOfWords' from the shuffled array
    return shuffledWords.slice(0, numberOfWords).join(' ');
}

// Function to update the displayed text based on user input
function updateText(inputText) {
    let formattedText = '';
    const currentIndex = inputText.length;

    for (let i = 0; i < originalText.length; i++) {
        const currentChar = originalText[i] === ' ' ? '&nbsp;' : originalText[i]; // Display spaces
        const inputChar = inputText[i] === ' ' ? '&nbsp;' : inputText[i]; // Handle space input

        if (i < currentIndex) {
            if (originalText[i] === ' ' && inputText[i] !== ' ') {
                // If the original is a space, but the input is not, mark it as incorrect
                formattedText += `<span class="incorrect-space" style="background-color: rgba(255, 51, 51, 0.3);">&nbsp;</span>`;
            }
            
            else if (inputChar === currentChar) {
                formattedText += `<span class="correct">${currentChar}</span>`;
            }
            
            else {
                formattedText += `<span class="incorrect">${currentChar}</span>`;
            }
        }
        
        else if (i === currentIndex) {
            formattedText += `<span class="current">${currentChar}</span>`;
        }
        
        else {
            formattedText += currentChar;
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
        // Remove 'data-selected' from any previously selected level
        document.querySelectorAll('.level').forEach(btn => btn.removeAttribute('data-selected'));

        // Mark the clicked level as selected
        e.target.setAttribute('data-selected', 'true');

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
    userInput.disabled = true; // Disable input
    levelChosen = false; // Reset level chosen status
    typingComplete = false; // Reset typing completion status
    targetText.innerHTML = 'Choose a Level to Start Playing'; // Reset text
    userInput.value = ''; // Clear the input field
    wpmDisplay.textContent = ''; // Clear WPM display
    congratulations.classList.add('hidden'); // Hide the congratulations message
    resetButton.classList.add('hidden'); // Hide the reset button
    clickInstruction.style.display = 'block'; // Show the click instruction
});

// Click event to focus on the input
document.querySelector('.container').addEventListener('click', focusInput);
