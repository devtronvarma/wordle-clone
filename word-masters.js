const letters = document.querySelectorAll(".game-letter"); // array-like list of all the letter spaces
const loadingDiv = document.querySelector(".info-bar")
const ANSWER_LENGTH = 5;
const ROUNDS = 6;


// async init allows you to do await wherever you want to!
async function init() {

    let currentGuess = ""
    let currentRow = 0;
    let isLoading = true;

    // get the word of the day, format it for validation
    const res = await fetch("https://words.dev-apis.com/word-of-the-day")
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split('');
    setLoading(false);
    isLoading = false;

    // track doneness
    let done = false;

    console.log(word);

    // function to display letter to the letter divs
    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter.toUpperCase();
        } else {
            // lop off last letter if we're at the end and replace it with typed letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter.toUpperCase()
        }

        // fills in the current row of the letters using the currentRow holder
        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter.toUpperCase();
    }

    // function to commit the user's guess (TODO)
    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return;
        }

        // Validate the guess is a word (POST API)
        isLoading = true;
        setLoading(true);

        const res = await fetch('https://words.dev-apis.com/validate-word', {
            method: 'POST',
            body: JSON.stringify({ word: currentGuess })
        });

        const resObject = await res.json();
        const { validWord } = resObject;

        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        }

        // Checking letters in the guess against the answer

        // Split the guess into individual letters
        const guessParts = currentGuess.split('');

        // Use makeMap utility function to make map of answer
        const map = makeMap(word);

        // Loop through letters in guess and letters in answer
        for (let i = 0; i < ANSWER_LENGTH; i++) {

            // mark as correct if matches and reduce our map count for the correct letter
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");

                // mark all the correct things first in the map
                map[guessParts[i]]--;
            }
        }

        // Loop through guess again to handle all the close and wrong letters
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts[i]) {
                // do nothing, see above
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {    // if the letter still exists in the map,
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");          // then, we're still close
                map[guessParts[i]]--;                                                    // have to keep track of close ones
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong")           // or it's wrong
            }
        }

        console.log(currentGuess)
        console.log(word);

        // Move to next row and reset
        currentRow++;

        // Did the user win or lose?
        if (currentGuess === word) {
            // you win
            alert('you win!');
            // flashing colors for brand
            document.querySelector(".brand").classList.add("winner");
            done = true;
            return;
        } else if (currentRow === ROUNDS) {
            alert(`you lose! the word was ${word}`);
            done = true;
        }

        currentGuess = '';
    }



    // Handle backspace
    function backspace () {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }


    // Mark invalid word (could update later)
    function markInvalidWord() {
        alert("not a valid word. please try again.")
    }

    document.addEventListener("keydown", function handleKeyPress (event){

        if (done || isLoading) {
            // do nothing
            return;
        }

        const action = event.key;

        // cases for acceptable key events
        if (action === 'Enter') {
            commit();
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action);
        } else {
            // do nothing
        }
    });
}


// Some helper functions

// check if the input is a letter
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

// setup the loading animation to run only when the API is loading
function setLoading(isLoading) {
    // toggle the loadingDiv class to hidden if the API is loading
    loadingDiv.classList.toggle('hidden', !isLoading)
}

// map the word of the day to an object (utility function)
function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i];
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }

    return obj;
}

init()
