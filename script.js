let display = document.getElementById('display');
let expression = '';
let shouldResetDisplay = false;
let angleMode = 'DEG'; // DEG or RAD

function updateDisplay() {
    display.textContent = expression || '0';
}

function toggleAngleMode() {
    angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
    document.getElementById('angleMode').textContent = angleMode;
}

function appendNumber(number) {
    if (shouldResetDisplay) {
        expression = number;
        shouldResetDisplay = false;
    } else {
        if (expression === '' || expression === '0') {
            expression = number;
        } else {
            expression += number;
        }
    }
    updateDisplay();
}

function appendText(text) {
    if (shouldResetDisplay && text !== '(' && text !== ')') {
        expression = text;
        shouldResetDisplay = false;
    } else {
        expression += text;
    }
    updateDisplay();
}

function appendOperator(op) {
    if (expression === '') return;

    // Replace last operator if user presses another operator
    const lastChar = expression[expression.length - 1];
    if (['+', '-', '*', '/', '^', '%'].includes(lastChar)) {
        expression = expression.slice(0, -1) + op;
    } else {
        expression += op;
    }
    shouldResetDisplay = false;
    updateDisplay();
}

function applyFunction(func) {
    if (shouldResetDisplay && expression !== '') {
        // Apply function to the result
        const value = expression;
        expression = func + '(' + value + ')';
        shouldResetDisplay = false;
    } else {
        // Get the last number in the expression
        const match = expression.match(/([\d.]+)$/);
        if (match) {
            const number = match[0];
            const beforeNumber = expression.slice(0, -number.length);
            expression = beforeNumber + func + '(' + number + ')';
        } else {
            // No number to apply function to, just add the function call
            expression += func + '(';
        }
    }
    updateDisplay();
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function calculate() {
    if (expression === '') return;

    try {
        // Remove trailing operator if present
        let expr = expression;
        const lastChar = expr[expr.length - 1];
        if (['+', '-', '*', '/', '^', '%'].includes(lastChar)) {
            expr = expr.slice(0, -1);
        }

        // Replace ^ with ** for power operation
        expr = expr.replace(/\^/g, '**');

        // Replace function names with their Math equivalents
        // For DEG mode, we need to add extra closing parenthesis for toRadians/toDegrees wrapper
        if (angleMode === 'DEG') {
            expr = expr.replace(/sin\(([^)]+)\)/g, 'Math.sin(toRadians($1))');
            expr = expr.replace(/cos\(([^)]+)\)/g, 'Math.cos(toRadians($1))');
            expr = expr.replace(/tan\(([^)]+)\)/g, 'Math.tan(toRadians($1))');
            expr = expr.replace(/asin\(([^)]+)\)/g, 'toDegrees(Math.asin($1))');
            expr = expr.replace(/acos\(([^)]+)\)/g, 'toDegrees(Math.acos($1))');
            expr = expr.replace(/atan\(([^)]+)\)/g, 'toDegrees(Math.atan($1))');
        } else {
            expr = expr.replace(/sin\(/g, 'Math.sin(');
            expr = expr.replace(/cos\(/g, 'Math.cos(');
            expr = expr.replace(/tan\(/g, 'Math.tan(');
            expr = expr.replace(/asin\(/g, 'Math.asin(');
            expr = expr.replace(/acos\(/g, 'Math.acos(');
            expr = expr.replace(/atan\(/g, 'Math.atan(');
        }

        expr = expr.replace(/log\(/g, 'Math.log10(');
        expr = expr.replace(/ln\(/g, 'Math.log(');
        expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
        expr = expr.replace(/abs\(/g, 'Math.abs(');
        expr = expr.replace(/exp\(([^)]+)\)/g, 'Math.exp($1)');
        expr = expr.replace(/pow10\(([^)]+)\)/g, '(10**($1))');
        expr = expr.replace(/square\(([^)]+)\)/g, '(($1)**2)');
        expr = expr.replace(/factorial\(/g, 'factorial(');

        // Evaluate the expression
        let result = Function('toRadians', 'toDegrees', 'factorial', '"use strict"; return (' + expr + ')')(toRadians, toDegrees, factorial);

        if (!isFinite(result)) {
            alert('Math error: Result is infinity or undefined');
            clearDisplay();
            return;
        }

        // Round to 12 decimal places to avoid floating-point precision errors
        result = Math.round(result * 1e12) / 1e12;

        // If the result is very close to an integer, round it
        if (Math.abs(result - Math.round(result)) < 1e-10) {
            result = Math.round(result);
        }

        expression = result.toString();
        shouldResetDisplay = true;
        updateDisplay();
    } catch (error) {
        alert('Invalid expression: ' + error.message);
        clearDisplay();
    }
}

function clearDisplay() {
    expression = '';
    shouldResetDisplay = false;
    updateDisplay();
}

function deleteLast() {
    if (expression.length > 0) {
        expression = expression.slice(0, -1);
    }
    updateDisplay();
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;

    // Numbers and decimal point
    if ((key >= '0' && key <= '9') || key === '.') {
        event.preventDefault();
        appendNumber(key);
    }
    // Operators
    else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
        event.preventDefault();
        appendOperator(key);
    }
    // Parentheses
    else if (key === '(' || key === ')') {
        event.preventDefault();
        appendText(key);
    }
    // Power
    else if (key === '^') {
        event.preventDefault();
        appendOperator('^');
    }
    // Enter or equals for calculation
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    // Escape or 'c' for clear
    else if (key === 'Escape' || key.toLowerCase() === 'c') {
        event.preventDefault();
        clearDisplay();
    }
    // Backspace or Delete for delete last
    else if (key === 'Backspace' || key === 'Delete') {
        event.preventDefault();
        deleteLast();
    }
});
