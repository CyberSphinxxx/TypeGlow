const targetText = document.getElementById('targetText');
const userInput = document.getElementById('userInput');
const originalText = 'Hello World!';
const congratulations = document.getElementById('congratulations');
const clickInstruction = document.getElementById('clickInstruction');

// Event Listener for Input
userInput.addEventListener('input', () => {
  const inputText = userInput.value;
  let formattedText = '';
  
  // Track the current letter index
  const currentIndex = inputText.length;

  for (let i = 0; i < originalText.length; i++) {
    if (i < currentIndex) {
      if (inputText[i] === originalText[i]) {
        formattedText += `<span class="correct">${originalText[i]}</span>`;
      }
      
      else {
        formattedText += `<span class="incorrect">${originalText[i]}</span>`;
      }
    }
    
    else if (i === currentIndex) {
      // Highlight the current letter being typed
      formattedText += `<span class="current">${originalText[i]}</span>`;
    }
    
    else {
      formattedText += originalText[i];
    }
  }

  targetText.innerHTML = formattedText;

  // Check if the user has finished typing the text
  if (inputText === originalText) {
    congratulations.classList.remove('hidden'); // Show the congratulatory message
  }
  
  else {
    congratulations.classList.add('hidden'); // Hide it if not complete
  }
});

// Function to focus on the input when the container is clicked
function focusInput() {
  userInput.focus();
}

// Hide instruction when input is focused
userInput.addEventListener('focus', () => {
    clickInstruction.style.display = 'none'; // Hide instruction
});

// Show instruction when input loses focus
userInput.addEventListener('blur', () => {
    if (userInput.value === '') { // Show only if input is empty
        clickInstruction.style.display = 'block'; // Show instruction
    }
});

// Initially show instruction on focus
window.addEventListener('focus', () => {
    clickInstruction.style.display = 'none'; // Hide instruction when the tab is focused
});

window.addEventListener('blur', () => {
    clickInstruction.style.display = 'block'; // Show instruction when the tab loses focus
});