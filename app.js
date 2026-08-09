console.log("Multitasked is running");


// --------------------------------------------------
// ELEMENTS
// --------------------------------------------------

const addGameBtn =
    document.getElementById("addGameBtn");

const modal =
    document.getElementById("gameModal");

const closeModal =
    document.getElementById("closeModal");

const container =
    document.getElementById("gameContainer");

const attentionList =
    document.getElementById("attentionList");


// --------------------------------------------------
// SPORT SELECTOR
// --------------------------------------------------

const sportSelect =
    document.getElementById("sport");

const customSport =
    document.getElementById("customSport");


sportSelect.addEventListener(
    "change",
    () => {

        if (
            sportSelect.value === "__custom__"
        ) {

            customSport.style.display =
                "block";

            customSport.focus();

        } else {

            customSport.style.display =
                "none";

            customSport.value = "";

        }

    }
);


// --------------------------------------------------
// STARTER GAMES
// --------------------------------------------------

const starterGames = [

    {
        name: "Arsenal vs Chelsea",
        sport: "Soccer",
        status: "LIVE",
        steps: [
            "Preslate",
            "Drop Slate",
            "Game End Marker",
            "Post Slate",
            "Broadcast End",
            "Expiration",
            "Clip"
        ],
        completed: [
            "Preslate",
            "Drop Slate"
        ],
        dropSlate: ""
    },


    {
        name: "Yankees vs Red Sox",
        sport: "Baseball",
        status: "LIVE",
        steps: [
            "Preslate",
            "Drop Slate",
            "Game End Marker",
            "Post Slate",
            "Broadcast End",
            "Expiration"
        ],
        completed: [
            "Preslate"
        ],
        dropSlate: ""
    },


    {
        name: "UFC Fight Night",
        sport: "UFC",
        status: "UPCOMING",
        steps: [
            "Drop Slate",
            "Preslate",
            "Broadcast End"
        ],
        completed: [],
        dropSlate: ""
    },


    {
        name: "Miami vs Orlando",
        sport: "Soccer",
        status: "COMPLETE",
        steps: [
            "Preslate",
            "Drop Slate",
            "Game End Marker",
            "Post Slate",
            "Expiration"
        ],
        completed: [
            "Preslate",
            "Drop Slate",
            "Game End Marker",
            "Post Slate",
            "Expiration"
        ],
        dropSlate: ""
    }

];


// --------------------------------------------------
// LOAD GAMES
// --------------------------------------------------

let games = loadGames();


if (!games) {

    games = starterGames;

    saveGames(games);

}


// --------------------------------------------------
// DATE
// --------------------------------------------------

function updateDate() {

    const dateElement =
        document.getElementById("currentDate");

    const now = new Date();

    dateElement.textContent =
        now.toLocaleDateString(
            undefined,
            {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

}


updateDate();


// --------------------------------------------------
// MODAL
// --------------------------------------------------

addGameBtn.onclick = () => {

    modal.style.display = "flex";

};


closeModal.onclick = () => {

    modal.style.display = "none";

};


window.onclick = (event) => {

    if (event.target === modal) {

        modal.style.display = "none";

    }

};


// --------------------------------------------------
// DROP SLATE TIME
// --------------------------------------------------

// --------------------------------------------------
// FORMAT TIME
// --------------------------------------------------

function formatTime(time) {

    if (!time) {
        return "—";
    }


    const [hours, minutes] =
        time.split(":").map(Number);


    const date =
        new Date();

    date.setHours(
        hours,
        minutes,
        0,
        0
    );


    return date.toLocaleTimeString(
        [],
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


function getDropSlateInfo(time, completed = false) {

    if (!time) {

        return {
            text: "—",
            className: ""
        };

    }

        if (completed) {

        return {
            text: "✓ DROPPED",
            className: "drop-complete"
        };

    }


    const [hours, minutes] =
        time.split(":").map(Number);


    const now = new Date();


    const slate =
        new Date();

    slate.setHours(
        hours,
        minutes,
        0,
        0
    );


    const difference =
        slate - now;


    const minutesAway =
        Math.floor(
            difference / 60000
        );


    if (minutesAway < 0) {

    return {
        text: "TIME REACHED",
        className: "drop-now"
    };

}


    if (minutesAway <= 15) {

        return {
            text: `IN ${minutesAway} MIN`,
            className: "drop-now"
        };

    }


    if (minutesAway <= 30) {

        return {
            text: `IN ${minutesAway} MIN`,
            className: "drop-soon"
        };

    }


    return {

        text: slate.toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        ),

        className: ""

    };

}


// --------------------------------------------------
// STATUS CLASS
// --------------------------------------------------

function getStatusClass(status) {

    if (status === "LIVE") {
        return "status-live";
    }

    if (status === "UPCOMING") {
        return "status-upcoming";
    }

    if (status === "POST GAME") {
        return "status-post";
    }

    return "status-complete";

}

// --------------------------------------------------
// AUTOMATIC GAME STATUS
// --------------------------------------------------

function updateGameStatuses() {

    const now = new Date();

    games.forEach(game => {

        // Don't change games that are already
        // in POST GAME or COMPLETE.

        if (
            game.status === "POST GAME" ||
            game.status === "COMPLETE"
        ) {
            return;
        }


        if (!game.startTime) {
            return;
        }


        const [hours, minutes] =
            game.startTime.split(":").map(Number);


        const start =
            new Date();

        start.setHours(
            hours,
            minutes,
            0,
            0
        );


        // Game has started

        if (now >= start) {

            game.status = "LIVE";

        }

    });

}


// --------------------------------------------------
// ATTENTION
// --------------------------------------------------

function getAttentionGames() {

    const attention = [];


    games.forEach((game, index) => {

        const next =
            game.steps.find(
                step =>
                    !game.completed.includes(step)
            );


        if (!next) {
            return;
        }


        // LIVE games always need
        // attention because they have
        // an active next action.

        if (game.status === "LIVE") {

            attention.push({

                game,
                index,
                action: next,
                urgency: "NOW"

            });

            return;

        }


        // Post-game events also need
        // attention.

        if (game.status === "POST GAME") {

            attention.push({

                game,
                index,
                action: next,
                urgency: "NOW"

            });

            return;

        }


        // Upcoming Drop Slate

        if (
            game.status === "UPCOMING" &&
            next === "Drop Slate" &&
            game.dropSlate
        ) {

            const info =
                getDropSlateInfo(
                    game.dropSlate
                );


            if (
                info.className === "drop-now" ||
                info.className === "drop-soon"
            ) {

                attention.push({

                    game,
                    index,
                    action: "Drop Slate",
                    urgency: info.text

                });

            }

        }

    });


    return attention;

}


// --------------------------------------------------
// RENDER ATTENTION
// --------------------------------------------------

function renderAttention() {

    const attention =
        getAttentionGames();


    document.getElementById(
        "attentionCount"
    ).textContent =
        attention.length;


    if (attention.length === 0) {

        attentionList.innerHTML = `

            <div class="empty-attention">

                Nothing requires your attention
                right now.

            </div>

        `;

        return;

    }


    attentionList.innerHTML =
        attention.map(item => `

            <div class="attention-item">

                <div class="attention-left">

                    <div class="attention-dot">
                    </div>


                    <div>

                        <div class="attention-game">

                            ${item.game.name}

                        </div>


                        <div class="attention-action">

                            ${item.action}

                        </div>

                    </div>

                </div>


                <div class="attention-right">

                    ${item.urgency}

                </div>

            </div>

        `).join("");

}


// --------------------------------------------------
// RENDER GAMES
// --------------------------------------------------

function renderGames() {

    updateGameStatuses();

    saveGames(games);

    container.innerHTML = "";

    container.innerHTML = "";


    document.getElementById(
        "gameCount"
    ).textContent =
        games.length;


    document.getElementById(
        "liveCount"
    ).textContent =
        games.filter(
            game => game.status === "LIVE"
        ).length;


    games.forEach((game, index) => {

        const next =
            game.steps.find(
                step =>
                    !game.completed.includes(step)
            );


        const completedCount =
            game.completed.length;


        const totalSteps =
            game.steps.length;


        const percentage =
            totalSteps === 0
                ? 0
                : Math.round(
                    (completedCount /
                        totalSteps) * 100
                );


        const dropInfo =
    getDropSlateInfo(
        game.dropSlate,
        game.completed.includes("Drop Slate")
    );


        const card =
            document.createElement("div");


        card.className =
            "game-card";


        card.innerHTML = `

            <div class="game-top">

                <div>

                    <h3 class="game-name">

                        ${game.name}

                    </h3>


                    <div class="game-sport">

                        ${game.sport}

                    </div>

                </div>


                <div class="status-badge ${getStatusClass(game.status)}">

                    ${game.status}

                </div>

            </div>


            ${
    game.dropSlate
        ? `

        <div class="drop-slate">

            <div class="drop-slate-info">

                <span class="drop-label">
                    DROP SLATE
                </span>

                <span class="drop-scheduled">
                    ${formatTime(game.dropSlate)}
                </span>

            </div>


            <span class="drop-time ${dropInfo.className}">

    ${
        game.completed.includes("Drop Slate")
            ? "✓ DROPPED"
            : dropInfo.text
    }

</span>

        </div>

        `
        : ""
}


            <div class="next-action">

                <div class="next-label">

                    NEXT ACTION

                </div>


                <div class="next-name">

                    ${next || "ALL PROCESSES COMPLETE"}

                </div>


                ${
                    next
                        ? `

                        <button
                            class="complete-button"
                            onclick="completeStep(${index})"
                        >

                            COMPLETE STEP

                        </button>

                        `
                        : ""
                }

            </div>


            <div class="progress-row">

                <span>

                    ${completedCount}
                    / 
                    ${totalSteps}
                    COMPLETED

                </span>


                <span>

                    ${percentage}%

                </span>

            </div>


            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width:${percentage}%"
                ></div>

            </div>


            <details class="workflow-details">

                <summary>
                    VIEW WORKFLOW
                </summary>


                <div class="workflow-list">

                    ${game.steps.map(step => {

    const isComplete =
        game.completed.includes(step);

    const isCurrent =
        !isComplete &&
        step === next;


    return `

        <div class="step ${
            isComplete
                ? "step-complete"
                : isCurrent
                    ? "step-current"
                    : ""
        }">

            <span>

                ${
                    isComplete
                        ? "✓"
                        : isCurrent
                            ? "→"
                            : "○"
                }

                ${step}

            </span>


            <span class="step-status">

                ${
                    isComplete
                        ? "DONE"
                        : isCurrent
                            ? "CURRENT"
                            : ""
                }

            </span>

        </div>

    `;

}).join("")}

                </div>

            </details>


            <button
                class="delete-button"
                onclick="deleteGame(${index})"
            >

                DELETE GAME

            </button>

        `;


        container.appendChild(card);

    });


    renderAttention();

}


// --------------------------------------------------
// COMPLETE STEP
// --------------------------------------------------

function completeStep(gameIndex) {

    const game =
        games[gameIndex];


    if (!game) {
        return;
    }


    const next =
        game.steps.find(
            step =>
                !game.completed.includes(step)
        );


    if (!next) {
        return;
    }


    game.completed.push(next);


    if (next === "Game End Marker") {

        game.status = "POST GAME";

    }


    if (
        game.completed.length ===
        game.steps.length
    ) {

        game.status = "COMPLETE";

    }


    saveGames(games);

renderGames();

renderOperatorMode();

}


// --------------------------------------------------
// DELETE GAME
// --------------------------------------------------

function deleteGame(gameIndex) {

    const game =
        games[gameIndex];


    if (!game) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${game.name}"?`
        );


    if (!confirmed) {
        return;
    }


    games.splice(
        gameIndex,
        1
    );


    saveGames(games);

    renderGames();

}


// --------------------------------------------------
// CREATE GAME
// --------------------------------------------------

document
    .getElementById("createGame")
    .onclick = () => {


        const name =
            document
                .getElementById("gameName")
                .value
                .trim();


        let sport =
    document
        .getElementById("sport")
        .value;


if (sport === "__custom__") {

    sport =
        document
            .getElementById("customSport")
            .value
            .trim();


    if (!sport) {

        alert(
            "Please enter a sport name."
        );

        return;

    }

}


        const dropSlate =
            document
                .getElementById("dropSlate")
                .value;
        const startTime =
    document
        .getElementById("startTime")
        .value;

        if (!name) {

            alert(
                "Please enter a game name."
            );

            return;

        }

        if (!startTime) {

    alert(
        "Please enter a game start time."
    );

    return;

}


        const steps =
            Array.from(
                document.querySelectorAll(
                    ".workflow-options input[type='checkbox']:checked"
                )
            ).map(
                item => item.value
            );


        if (steps.length === 0) {

            alert(
                "Please select at least one workflow step."
            );

            return;

        }


       const newGame = {

    name,

    sport,

    startTime,

    status: "UPCOMING",

    dropSlate,

    steps,

    completed: []

};


        games.push(newGame);


        saveGames(games);


        document
            .getElementById("gameName")
            .value = "";

            document
    .getElementById("startTime")
    .value = "";


        document
            .getElementById("dropSlate")
            .value = "";

            document
    .getElementById("sport")
    .value = "Soccer";

document
    .getElementById("customSport")
    .value = "";

document
    .getElementById("customSport")
    .style.display = "none";


        modal.style.display = "none";


        renderGames();

    };


// --------------------------------------------------
// INITIAL RENDER
// --------------------------------------------------

renderGames();


// --------------------------------------------------
// UPDATE DROP SLATE CLOCK
// --------------------------------------------------

// --------------------------------------------------
// OPERATOR MODE
// --------------------------------------------------

const operatorModeBtn =
    document.getElementById("operatorModeBtn");

const operatorPanel =
    document.getElementById("operatorPanel");

const operatorHeader =
    document.getElementById("operatorHeader");

const operatorGames =
    document.getElementById("operatorGames");

const minimizeOperator =
    document.getElementById("minimizeOperator");

const closeOperator =
    document.getElementById("closeOperator");


// --------------------------------------------------
// RENDER OPERATOR MODE
// --------------------------------------------------

function renderOperatorMode() {

    if (!operatorGames) {
        return;
    }


    operatorGames.innerHTML = "";


    games.forEach((game, index) => {

    if (game.status === "COMPLETE") {
        return;
    }

            const next =
                game.steps.find(
                    step =>
                        !game.completed.includes(step)
                );


            const dropInfo =
                getDropSlateInfo(
                    game.dropSlate,
                    game.completed.includes("Drop Slate")
                );


            const operatorGame =
                document.createElement("div");


            operatorGame.className =
                "operator-game";


            operatorGame.innerHTML = `

                <div class="operator-game-top">

                    <div class="operator-game-name">

                        ${game.name}

                    </div>


                    <div class="operator-status ${getStatusClass(game.status)}">

                        ${game.status}

                    </div>

                </div>


                <div class="operator-game-info">

                    ${
                        game.dropSlate
                            ? `
                            <span class="operator-drop">

                                DROP
                                ${formatTime(game.dropSlate)}

                            </span>
                            `
                            : ""
                    }


                    <span class="operator-action">

                        ${
                            next
                                ? next
                                : "COMPLETE"
                        }

                    </span>

                </div>


                ${
                    next
                        ? `
                        <button
                            class="operator-complete"
                            onclick="completeStep(${index})"
                        >

                            ✓

                        </button>
                        `
                        : ""
                }

            `;


            operatorGames.appendChild(
                operatorGame
            );

        });

}

// --------------------------------------------------
// OPERATOR MODE CONTROLS
// --------------------------------------------------

operatorModeBtn.onclick = () => {

    operatorPanel.classList.add(
        "operator-visible"
    );

    operatorPanel.classList.remove(
        "operator-minimized"
    );

    renderOperatorMode();

};


closeOperator.onclick = () => {

    operatorPanel.classList.remove(
        "operator-visible"
    );

};


minimizeOperator.onclick = () => {

    operatorPanel.classList.toggle(
        "operator-minimized"
    );

};


// --------------------------------------------------
// DRAG OPERATOR PANEL
// --------------------------------------------------

let isDragging = false;

let dragOffsetX = 0;
let dragOffsetY = 0;


operatorHeader.addEventListener(
    "mousedown",
    (event) => {

        if (
            event.target.closest(
                ".operator-control"
            )
        ) {
            return;
        }


        const rect =
            operatorPanel.getBoundingClientRect();


        isDragging = true;


        dragOffsetX =
            event.clientX - rect.left;


        dragOffsetY =
            event.clientY - rect.top;


        operatorPanel.style.left =
            `${rect.left}px`;

        operatorPanel.style.top =
            `${rect.top}px`;

        operatorPanel.style.bottom =
            "auto";

        operatorPanel.style.transform =
            "none";

    }
);


document.addEventListener(
    "mousemove",
    (event) => {

        if (!isDragging) {
            return;
        }


        operatorPanel.style.left =
            `${event.clientX - dragOffsetX}px`;


        operatorPanel.style.top =
            `${event.clientY - dragOffsetY}px`;

    }
);


document.addEventListener(
    "mouseup",
    () => {

        isDragging = false;

    }
);

setInterval(() => {

    renderGames();

}, 30000);