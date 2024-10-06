const targetText = document.getElementById('targetText');
const userInput = document.getElementById('userInput');
const originalText = 'hello world';

userInput.addEventListener('input', () => {
  const inputText = userInput.value;
  let formattedText = '';

  for (let i = 0; i < originalText.length; i++) {
    if (i < inputText.length) {
      if (inputText[i] === originalText[i]) {
        formattedText += `<span class="correct">${originalText[i]}</span>`;
      }
      
      else {
        formattedText += `<span class="incorrect">${originalText[i]}</span>`;
      }
    }
    
    else {
      formattedText += originalText[i];
    }
  }

  targetText.innerHTML = formattedText;
});
