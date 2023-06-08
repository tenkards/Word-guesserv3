document.addEventListener('DOMContentLoaded', function() {
  var wordDisplay = document.getElementById('word-display');
  var letterInput = document.getElementById('letter-input');
  var guessButton = document.getElementById('guess-button');
  var hintButton = document.getElementById('hint-button');
  var guessesRemainingDisplay = document.getElementById('guesses-remaining');
  var resultMessage = document.getElementById('result-message');
  var wordLengthSelect = document.getElementById('word-length-select');
  var hintMessage = document.getElementById('hint-message');

  var word = ''; // Word to guess
  var guessedWord = []; // Current state of guessed word
  var guessesRemaining = 7;
  var wordDefinition = ''; // Definition of the word
  var guessedLetters = []; // Guessed letters

  // Initialize the game
  function initGame() {
    if (!wordDisplay || !letterInput || !guessButton || !hintButton || !guessesRemainingDisplay || !resultMessage || !wordLengthSelect || !hintMessage) {
      console.error('One or more required DOM elements not found.');
      return;
    }

    letterInput.disabled = false;
    guessButton.disabled = false;
    hintButton.disabled = false;
    resultMessage.textContent = '';
    hintMessage.textContent = '';
    guessesRemaining = 7;
    guessesRemainingDisplay.textContent = guessesRemaining;
    guessedWord = [];
    wordDisplay.textContent = '';

    // Fetch word from API based on selected word length
    var wordLength = parseInt(wordLengthSelect.value);
    var apiUrl = 'https://random-word-api.herokuapp.com/word?length=' + wordLength;

    fetch(apiUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        word = data[0].toLowerCase();
        guessedWord = Array(word.length).fill('_');
        wordDisplay.textContent = guessedWord.join(' ');
      })
      .catch(function(error) {
        console.error('Error fetching word:', error);
      });

    guessedLetters = []; // Reset guessed letters
    updateHintButtonVisibility();
  }

  // Update hint button visibility
  function updateHintButtonVisibility() {
    hintButton.style.display = guessesRemaining === 3 ? 'block' : 'none';
  }

  // Handle user's guess
  function handleGuess() {
    var letter = letterInput.value.toLowerCase();

    if (letter.length !== 1 || !letter.match(/[a-z]/i)) {
      alert('Please enter a single letter.');
      return;
    }

    // Check if letter has already been guessed
    if (guessedLetters.includes(letter)) {
      alert('You have already guessed this letter.');
      return;
    }

    guessedLetters.push(letter); // Add letter to guessed letters

    var isCorrectGuess = false;

    for (var i = 0; i < word.length; i++) {
      if (word[i] === letter) {
        guessedWord[i] = letter;
        isCorrectGuess = true;
      }
    }

    if (!isCorrectGuess) {
      guessesRemaining--;
      guessesRemainingDisplay.textContent = guessesRemaining;

      if (guessesRemaining === 0) {
        gameOver('You lose! The word was ' + word);
      }

      if (guessesRemaining === 3) {
        updateHintButtonVisibility();
      }
    }

    wordDisplay.textContent = guessedWord.join(' ');

    if (guessedWord.join('') === word) {
      gameOver('Congratulations! You guessed the word correctly.');
    }

    letterInput.value = '';
  }

  // Fetch word definition as a hint
  function fetchHint() {
    if (!word) {
      alert('Please start a game first.');
      return;
    }

    var apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + word;

    fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to fetch word definition.');
        }
        return response.json();
      })
      .then(function(data) {
        if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0 && data[0].meanings[0].definitions && data[0].meanings[0].definitions.length > 0) {
          wordDefinition = data[0].meanings[0].definitions[0].definition;
          hintMessage.textContent = 'Hint: ' + wordDefinition;
        } else {
          hintMessage.textContent = 'No definition found.';
        }
      })
      .catch(function(error) {
        console.error('Error fetching word definition:', error);
        hintMessage.textContent = 'Failed to fetch definition.';
      });
  }

  // Game over
  function gameOver(message) {
    letterInput.disabled = true;
    guessButton.disabled = true;
    hintButton.disabled = true;
    resultMessage.textContent = message;
  }

  // Get a random length between 5 and 9 for the word
  function getRandomLength() {
    return Math.floor(Math.random() * 5) + 5;
  }

  // Add event listeners
  guessButton.addEventListener('click', handleGuess);
  hintButton.addEventListener('click', fetchHint);
  wordLengthSelect.addEventListener('change', initGame);

  // Start the game
  initGame();
});
