let currentOperation = '+';

function setOperation(operation) {
    currentOperation = operation;
    displayOperation();
}

function displayOperation() {
    let userInput = document.getElementById('userInput').value;
    let operationDisplay = document.getElementById('operationDisplay');

    let cleanedInput = cleanInput(userInput);

    if (cleanedInput === '') {
        operationDisplay.innerText = 'Select an operation';
    } else {
        let numbers = parseNumbers(cleanedInput);
        if (numbers.length === 0) {
            operationDisplay.innerText = 'No valid numbers found.';
        } else {
            let operationString = numbers.join(` ${getOperationSymbol(currentOperation)} `);
            operationDisplay.innerText = operationString;
        }
    }
}

function getOperationSymbol(operation) {
    const symbols = { '+': '+', '-': '-', '*': '×', '/': '÷' };
    return symbols[operation] || operation;
}

function validateInput() {
    let userInput = document.getElementById('userInput').value;
    let cleanedInput = cleanInput(userInput);

    if (cleanedInput === '' || !/^\d+(\.\d+)?( \d+(\.\d+)?)*$/.test(cleanedInput)) {
        showToast("Invalid input format. Please enter numbers separated by spaces, commas, or newlines.", "error");
    }
}

function calculateResult() {
    let userInput = document.getElementById('userInput').value;

    try {
        let cleanedInput = cleanInput(userInput);
        if (cleanedInput === '') {
            throw new Error("Input is empty. Please enter valid numbers.");
        }

        let numbers = parseNumbers(cleanedInput);
        if (numbers.length === 0) {
            throw new Error("No valid numbers found in the input.");
        }

        let result;
        switch (currentOperation) {
            case '+':
                result = numbers.reduce((acc, num) => acc + num, 0);
                break;
            case '-':
                result = numbers.reduce((acc, num, index) => index === 0 ? num : acc - num);
                break;
            case '*':
                result = numbers.reduce((acc, num) => acc * num, 1);
                break;
            case '/':
                if (numbers.includes(0)) throw new Error("Division by zero is not allowed.");
                result = numbers.reduce((acc, num, index) => index === 0 ? num : acc / num);
                break;
            default:
                throw new Error("Unknown operation.");
        }

        document.getElementById('result').innerText = `The result is: ${formatResult(result)}`;
        displayOperation();
        showToast("Calculation completed successfully.", "success");

    } catch (error) {
        document.getElementById('result').innerText = 'The result is: 0';
        showToast(error.message, "error");
    }
}

function formatResult(number) {
    return number.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function cleanInput(input) {
    return input.replace(/[^\d.\s,-]/g, '')
        .replace(/[\s,]+/g, ' ')
        .trim();
}

function parseNumbers(input) {
    return input.split(' ')
        .map(Number)
        .filter(num => !isNaN(num) && isFinite(num));
}

function clearInput() {
    document.getElementById('userInput').value = '';
    document.getElementById('operationDisplay').innerText = 'Select an operation';
    calculateResult();
}

function resetResult() {
    document.getElementById('result').innerText = 'The result is: 0';
    document.getElementById('operationDisplay').innerText = 'Select an operation';
    showToast("Result has been reset.", "success");
}

function copyResult() {
    let resultText = document.getElementById('result').innerText;
    let resultNumber = resultText.replace('The result is: ', '').trim();

    navigator.clipboard.writeText(resultNumber).then(() => {
        showToast("Result copied to clipboard!", "success");
    }).catch(err => {
        showToast("Failed to copy result: " + err, "error");
    });
}

function showToast(message, type) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}