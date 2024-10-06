const targetText = document.getElementById('targetText');
const userInput = document.getElementById('userInput');
const originalText = 'Practice Text Hello World!';

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
});

// Function to focus on the input when the container is clicked
function focusInput() {
  userInput.focus();
}
