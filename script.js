/* =========================
   VARIABLES
========================= */

let current = "";

const resultElement =
    document.getElementById("result");

const expressionElement =
    document.getElementById("expression");




function insert(value) {

    if (current === "Error") {
        current = "";
    }

    current += value;

    updateDisplay();
}


/* =========================
   UPDATE DISPLAY
========================= */

function updateDisplay() {

    resultElement.textContent =
        current || "0";

    expressionElement.textContent =
        current || "Ready...";
}


/* =========================
   CLEAR
========================= */

function clearAll() {

    current = "";

    resultElement.textContent = "0";

    expressionElement.textContent =
        "Ready...";
}


/* =========================
   DELETE
========================= */

function backspace() {

    current =
        current.slice(0, -1);

    updateDisplay();
}


/* =========================
   CONSTANTS
========================= */

function insertConstant(type) {

    if (type === "pi") {

        current += Math.PI;

    } else if (type === "e") {

        current += Math.E;
    }

    updateDisplay();
}


/* =========================
   PERCENTAGE
========================= */

function percentage() {

    try {

        const value =
            evaluate(current);

        current =
            String(value / 100);

        updateDisplay();

    } catch {

        showError();
    }
}


/* =========================
   CALCULATE
========================= */

function calculate() {

    if (!current) return;

    try {

        const original =
            current;

        const answer =
            evaluate(current);

        current =
            formatNumber(answer);

        expressionElement.textContent =
            original + " =";

        resultElement.textContent =
            current;

        addHistory(
            original,
            current
        );

    } catch {

        showError();
    }
}


/* =========================
   SAFE EVALUATOR
========================= */

function evaluate(input) {

    if (!input) {
        throw new Error();
    }

    let expression =
        input
            .replaceAll("×", "*")
            .replaceAll("÷", "/");


    /*
        Only mathematical characters
        are allowed.
    */

    if (
        !/^[0-9+\-*/().\s]+$/
            .test(expression)
    ) {

        throw new Error();
    }


    return Function(
        `"use strict";
         return (${expression})`
    )();
}


/* =========================
   FORMAT NUMBER
========================= */

function formatNumber(number) {

    if (!Number.isFinite(number)) {

        throw new Error();
    }


    if (Math.abs(number) < 1e-10) {

        number = 0;
    }


    return Number(
        number.toPrecision(12)
    ).toString();
}


/* =========================
   SCIENTIFIC
========================= */

function scientific(operation) {

    try {

        const value =
            evaluate(current);

        let answer;


        switch (operation) {

            case "sin":

                answer =
                    Math.sin(
                        value *
                        Math.PI / 180
                    );

                break;


            case "cos":

                answer =
                    Math.cos(
                        value *
                        Math.PI / 180
                    );

                break;


            case "tan":

                answer =
                    Math.tan(
                        value *
                        Math.PI / 180
                    );

                break;


            case "log":

                answer =
                    Math.log10(value);

                break;


            case "ln":

                answer =
                    Math.log(value);

                break;


            case "sqrt":

                answer =
                    Math.sqrt(value);

                break;


            case "square":

                answer =
                    value ** 2;

                break;


            case "cube":

                answer =
                    value ** 3;

                break;


            case "inverse":

                answer =
                    1 / value;

                break;


            case "factorial":

                answer =
                    factorial(value);

                break;
        }


        const expression =
            `${operation}(${value})`;


        current =
            formatNumber(answer);


        expressionElement.textContent =
            expression;


        resultElement.textContent =
            current;


        addHistory(
            expression,
            current
        );


    } catch {

        showError();
    }
}


/* =========================
   FACTORIAL
========================= */

function factorial(number) {

    if (
        number < 0 ||
        !Number.isInteger(number)
    ) {

        throw new Error();
    }


    if (number > 170) {

        throw new Error();
    }


    let result = 1;


    for (
        let i = 2;
        i <= number;
        i++
    ) {

        result *= i;
    }


    return result;
}


/* =========================
   ERROR
========================= */

function showError() {

    current = "Error";

    resultElement.textContent =
        "Error";

    expressionElement.textContent =
        "Invalid calculation";
}


/* =========================
   HISTORY
========================= */

function addHistory(
    expression,
    result
) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "nexusHistory"
            )
        ) || [];


    history.unshift({

        expression,
        result

    });


    history =
        history.slice(0, 30);


    localStorage.setItem(
        "nexusHistory",
        JSON.stringify(history)
    );


    renderHistory();
}


/* =========================
   RENDER HISTORY
========================= */

function renderHistory() {

    const list =
        document.getElementById(
            "historyList"
        );


    const history =
        JSON.parse(
            localStorage.getItem(
                "nexusHistory"
            )
        ) || [];


    if (!history.length) {

        list.innerHTML =
            `<p class="empty-history">
                No calculations yet.
            </p>`;

        return;
    }


    list.innerHTML =
        history.map(
            (item, index) => `

            <div
                class="history-item"
                data-history="${index}"
            >

                <div class="history-expression">
                    ${item.expression}
                </div>

                <div class="history-result">
                    = ${item.result}
                </div>

            </div>
        `
        ).join("");


    document
        .querySelectorAll(
            ".history-item"
        )
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const history =
                        JSON.parse(
                            localStorage.getItem(
                                "nexusHistory"
                            )
                        ) || [];


                    const index =
                        item.dataset.history;


                    current =
                        history[index].result;


                    updateDisplay();

                    toggleHistory();
                }
            );
        });
}


/* =========================
   CLEAR HISTORY
========================= */

function clearHistory() {

    localStorage.removeItem(
        "nexusHistory"
    );

    renderHistory();
}


/* =========================
   HISTORY TOGGLE
========================= */

function toggleHistory() {

    document
        .getElementById(
            "historyPanel"
        )
        .classList.toggle("open");
}


/* =========================
   COPY RESULT
========================= */

async function copyResult() {

    if (
        !current ||
        current === "Error"
    ) {
        return;
    }


    try {

        await navigator.clipboard
            .writeText(current);


        expressionElement.textContent =
            "Copied ✓";

    } catch {

        expressionElement.textContent =
            "Copy failed";
    }
}


/* =========================
   BUTTON EVENTS
========================= */

document
    .querySelectorAll(
        "[data-value]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                insert(
                    button.dataset.value
                );
            }
        );
    });


document
    .querySelectorAll(
        "[data-constant]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                insertConstant(
                    button.dataset.constant
                );
            }
        );
    });


document
    .querySelectorAll(
        "[data-scientific]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                scientific(
                    button.dataset.scientific
                );
            }
        );
    });


/* =========================
   SPECIAL BUTTONS
========================= */

document
    .getElementById("clearBtn")
    .addEventListener(
        "click",
        clearAll
    );


document
    .getElementById("deleteBtn")
    .addEventListener(
        "click",
        backspace
    );


document
    .getElementById("deleteMainBtn")
    .addEventListener(
        "click",
        backspace
    );


document
    .getElementById("percentBtn")
    .addEventListener(
        "click",
        percentage
    );


document
    .getElementById("equalBtn")
    .addEventListener(
        "click",
        calculate
    );


document
    .getElementById("copyBtn")
    .addEventListener(
        "click",
        copyResult
    );


document
    .getElementById("historyBtn")
    .addEventListener(
        "click",
        toggleHistory
    );


document
    .getElementById("clearHistoryBtn")
    .addEventListener(
        "click",
        clearHistory
    );


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key;


        if (
            /[0-9.+\-*/()]/
                .test(key)
        ) {

            insert(
                key
                    .replace("*", "×")
                    .replace("/", "÷")
            );

            return;
        }


        if (
            key === "Enter" ||
            key === "="
        ) {

            calculate();

            return;
        }


        if (
            key === "Backspace"
        ) {

            backspace();

            return;
        }


        if (
            key === "Escape"
        ) {

            clearAll();

            return;
        }


        if (
            key === "%"
        ) {

            percentage();
        }
    }
);


/* =========================
   INITIALIZE
========================= */

renderHistory();