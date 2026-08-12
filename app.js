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
// SAVED SPORTS
// --------------------------------------------------

let savedSports =
    JSON.parse(
        localStorage.getItem(
            "multitaskedSports"
        )
    ) || [
        "Soccer",
        "UFC",
        "Rugby"
    ];

    function loadSports() {

    const customOption =
        sportSelect.querySelector(
            'option[value="__custom__"]'
        );


    sportSelect
        .querySelectorAll(
            "option:not([value='__custom__'])"
        )
        .forEach(option => {

            option.remove();

        });


    savedSports.forEach(
        sport => {

            const option =
                document.createElement("option");

            option.value =
                sport;

            option.textContent =
                sport;

            sportSelect.insertBefore(
                option,
                customOption
            );

        }
    );

}

loadSports();

// --------------------------------------------------
// WORKFLOW TEMPLATES
// --------------------------------------------------

const workflowTemplates = {

    "Soccer Standard": [
        "Preslate",
        "Drop Slate",
        "Game End Marker",
        "Post Slate",
        "Broadcast End",
        "Expiration"
    ],

    "UFC Standard": [
        "Preslate",
        "Drop Slate",
        "Game End Marker",
        "Post Slate",
        "Broadcast End",
        "Expiration"
    ],

    "Rugby Standard": [
        "Preslate",
        "Drop Slate",
        "Game End Marker",
        "Post Slate",
        "Broadcast End",
        "Expiration"
    ]

};


// --------------------------------------------------
// STARTER GAMES
// --------------------------------------------------

const starterGames = [];

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

            const totalBreaks =
    game.commercialBreaks
        ? game.commercialBreaks.length
        : 0;

const sentBreaks =
    game.commercialBreaks
        ? game.commercialBreaks.filter(
            breakItem => breakItem.sent
        ).length
        : 0;

const nextBreak =
    game.commercialBreaks
        ? game.commercialBreaks.find(
            breakItem => !breakItem.sent
        )
        : null;


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

${
    totalBreaks > 0
        ? `

        <div class="break-summary">

            <div class="break-summary-header">

                <span class="next-label">
                    COMMERCIAL BREAKS
                </span>

                <span class="break-summary-count">
                    ${sentBreaks} / ${totalBreaks} SENT
                </span>

            </div>


            <div class="break-summary-main">

                <div>

                    <span class="break-summary-label">

                        ${
                            nextBreak
                                ? "NEXT BREAK"
                                : "BREAKS COMPLETE"
                        }

                    </span>


                    <div class="break-summary-time">

                        ${
                            nextBreak
                                ? nextBreak.duration
                                : "✓"
                        }

                    </div>

                </div>


                ${
                    nextBreak
                        ? `
                        <span class="break-summary-action">
                            READY
                        </span>
                        `
                        : `
                        <span class="break-summary-action">
                            ALL SENT
                        </span>
                        `
                }

            </div>

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

            ${
    game.commercialBreaks &&
    game.commercialBreaks.length > 0
        ? `

        <div class="game-commercial-breaks">

            <div class="game-commercial-breaks-header">

                <span class="next-label">
                    COMMERCIAL BREAKS
                </span>

            </div>


            <div class="game-break-list">

                ${game.commercialBreaks.map(
                    (breakItem, breakIndex) => {

                        const dropSlateComplete =
                            game.completed.includes(
                                "Drop Slate"
                            );


                        const gameEndComplete =
                            game.completed.includes(
                                "Game End Marker"
                            );

                            const nextBreakIndex =
    game.commercialBreaks.findIndex(
        breakItem => !breakItem.sent
    );


                        return `

                            <div class="
    game-break-row
    ${
        breakItem.sent
            ? "game-break-sent"
            : breakIndex === nextBreakIndex &&
              dropSlateComplete &&
              !gameEndComplete
                ? "game-break-current"
                : ""
    }
">

                                <div class="game-break-left">

                                    <span class="game-break-name">

                                        ${
                                            breakItem.sent
                                                ? "✓"
                                                : "○"
                                        }

                                        BREAK ${breakIndex + 1}

                                    </span>


                                    <button
    class="game-break-duration"
    onclick="
        editBreakDuration(
            ${index},
            ${breakIndex}
        )
    "
    title="Edit break duration"
>

    ${
        breakItem.duration ||
        "—"
    }

</button>

                                </div>


                                ${
    breakItem.sent
        ? `

        <div class="game-break-actions">

            <span class="game-break-status">

                SENT

            </span>

            <button
    class="revert-break-button"
    onclick="
        event.stopPropagation();
        revertBreak(
            ${index},
            ${breakIndex}
        )
    "
    title="Revert break"
>

    ↶

</button>

        </div>

        `
        : dropSlateComplete &&
          !gameEndComplete &&
          breakIndex === nextBreakIndex
            ? `

            <button
                class="game-break-button"
                onclick="
                    markBreakSent(
                        ${index},
                        ${breakIndex}
                    )
                "
            >

                BREAK SENT

            </button>

            `
            : `

            <span class="game-break-status">

                ${
                    gameEndComplete
                        ? "CLOSED"
                        : !dropSlateComplete
                            ? "WAITING"
                            : "LOCKED"
                }

            </span>

            `
}
                            </div>

                        `;

                    }
                ).join("")}

            </div>

        </div>

        `
        : ""
}


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
            ? `

                <button
                    class="revert-step-button"
                    onclick="
                        event.stopPropagation();
                        revertStep(
                            ${index},
                            '${step.replace(/'/g, "\\'")}'
                        )
                    "
                >

                    REVERT

                </button>

            `
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

    // --------------------------------------------------
// COMMERCIAL BREAK CHECK
// --------------------------------------------------

if (next === "Game End Marker") {

    const unsentBreaks =
        (game.commercialBreaks || [])
            .filter(breakItem => !breakItem.sent);


    if (unsentBreaks.length > 0) {

        const unsentNumbers =
            unsentBreaks
                .map(breakItem =>
                    game.commercialBreaks.indexOf(
                        breakItem
                    ) + 1
                );


        const breakText =
            unsentNumbers.length === 1
                ? `Break ${unsentNumbers[0]}`
                : `Breaks ${unsentNumbers.join(", ")}`;


        const confirmed =
            confirm(
                `${breakText} has not been marked SENT.\n\nAre you sure you want to complete the Game End Marker?`
            );


        if (!confirmed) {

            return;

        }

    }

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
// COMMERCIAL BREAK TRACKING
// --------------------------------------------------

function markBreakSent(
    gameIndex,
    breakIndex
) {

    const game =
        games[gameIndex];


    if (!game) {
        return;
    }


    if (
        !game.commercialBreaks ||
        !game.commercialBreaks[breakIndex]
    ) {
        return;
    }


    // Make sure all previous breaks
    // have already been marked sent.

    for (
        let i = 0;
        i < breakIndex;
        i++
    ) {

        if (
            !game.commercialBreaks[i].sent
        ) {

            return;

        }

    }


    game.commercialBreaks[
        breakIndex
    ].sent = true;


    saveGames(games);

    renderGames();

    renderOperatorMode();

}


// --------------------------------------------------
// REVERT COMMERCIAL BREAK
// --------------------------------------------------

function revertBreak(gameIndex, breakIndex) {

    const game = games[gameIndex];

    if (!game) {
        return;
    }

    if (
        !game.commercialBreaks ||
        !game.commercialBreaks[breakIndex]
    ) {
        return;
    }

    const breakItem =
        game.commercialBreaks[breakIndex];

    if (!breakItem.sent) {
        return;
    }

    const confirmed =
        confirm(
            `Revert Break ${breakIndex + 1}?`
        );

    if (!confirmed) {
        return;
    }

    breakItem.sent = false;

    saveGames(games);

    renderGames();

    renderOperatorMode();

}

// --------------------------------------------------
// EDIT COMMERCIAL BREAK DURATION
// --------------------------------------------------

function editBreakDuration(gameIndex, breakIndex) {

    const game = games[gameIndex];

    if (!game) {
        return;
    }

    if (
        !game.commercialBreaks ||
        !game.commercialBreaks[breakIndex]
    ) {
        return;
    }

    const breakItem =
        game.commercialBreaks[breakIndex];

    const currentDuration =
        breakItem.duration || "";

    const newDuration =
        prompt(
            `Edit duration for Break ${breakIndex + 1}\n\nEnter duration (example: 2:00)`,
            currentDuration
        );

    if (newDuration === null) {
        return;
    }

    const cleanedDuration =
        newDuration.trim();

    if (!cleanedDuration) {
        alert("Please enter a break duration.");
        return;
    }

    breakItem.duration =
        cleanedDuration;

    saveGames(games);

    renderGames();

    renderOperatorMode();

}

// --------------------------------------------------
// REVERT WORKFLOW STEP
// --------------------------------------------------

function revertStep(gameIndex, step) {

    const game = games[gameIndex];

    if (!game) {
        return;
    }

    const completedIndex =
        game.completed.indexOf(step);

    if (completedIndex === -1) {
        return;
    }

    const confirmed =
        confirm(
            `Revert "${step}"?`
        );

    if (!confirmed) {
        return;
    }

    game.completed.splice(
        completedIndex,
        1
    );

    // Restore appropriate game status

    if (step === "Game End Marker") {

        game.status = "LIVE";

    }

    if (
        game.status === "COMPLETE"
    ) {

        game.status = "POST GAME";

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
// COMMERCIAL BREAKS
// --------------------------------------------------

const includeCommercialBreaks =
    document.getElementById("includeCommercialBreaks");

const commercialBreaksContainer =
    document.getElementById("commercialBreaksContainer");

const addBreakBtn =
    document.getElementById("addBreakBtn");

const breakList =
    document.getElementById("breakList");


// Show / hide commercial breaks

includeCommercialBreaks.addEventListener(
    "change",
    () => {

        if (includeCommercialBreaks.checked) {

            commercialBreaksContainer.style.display =
                "block";

            // Add first break automatically

            if (breakList.children.length === 0) {

                addCommercialBreak();

            }

        } else {

            commercialBreaksContainer.style.display =
                "none";

        }

    }
);


// Add a commercial break

addBreakBtn.onclick = () => {

    addCommercialBreak();

};


function addCommercialBreak() {

    const breakNumber =
        breakList.children.length + 1;


    const breakRow =
        document.createElement("div");


    breakRow.className =
        "commercial-break-row";


    breakRow.innerHTML = `

        <div class="commercial-break-label">

            BREAK ${breakNumber}

        </div>


        <input
            type="text"
            class="commercial-break-duration"
            placeholder="Duration (ex: 2:00)"
        >


        <button
            type="button"
            class="remove-break-button"
        >
            ×
        </button>

    `;


    breakRow
        .querySelector(".remove-break-button")
        .onclick = () => {

            breakRow.remove();

            renumberCommercialBreaks();

        };


    breakList.appendChild(
        breakRow
    );

}


// Keep break numbers organized

function renumberCommercialBreaks() {

    const rows =
        breakList.querySelectorAll(
            ".commercial-break-row"
        );


    rows.forEach(
        (row, index) => {

            row.querySelector(
                ".commercial-break-label"
            ).textContent =
                `BREAK ${index + 1}`;

        }
    );

}

// --------------------------------------------------
// WORKFLOW TEMPLATE SELECTOR
// --------------------------------------------------

const workflowTemplate =
    document.getElementById("workflowTemplate");


workflowTemplate.addEventListener(
    "change",
    () => {

        const templateName =
            workflowTemplate.value;


        if (!templateName) {
            return;
        }


        const templateSteps =
            workflowTemplates[templateName];


        if (!templateSteps) {
            return;
        }


        const checkboxes =
            workflowOptions.querySelectorAll(
                "input[type='checkbox']"
            );


        checkboxes.forEach(
            checkbox => {

                checkbox.checked =
                    templateSteps.includes(
                        checkbox.value
                    );

            }
        );

    }
);

// --------------------------------------------------
// SAVED CUSTOM WORKFLOW STEPS
// --------------------------------------------------

let customWorkflowSteps =
    JSON.parse(
        localStorage.getItem(
            "multitaskedCustomWorkflowSteps"
        )
    ) || [];

    function loadCustomWorkflowSteps() {

    customWorkflowSteps.forEach(
        stepName => {

            addWorkflowStepToList(
                stepName
            );

        }
    );

}

function addWorkflowStepToList(stepName) {

    const label =
        document.createElement("label");

    label.className =
        "workflow-option";

    label.draggable = true;

    label.innerHTML = `

        <span class="workflow-drag-handle">
            ⋮⋮
        </span>

        <input
            type="checkbox"
            value="${stepName}"
            checked
        >

        <span>
            ${stepName}
        </span>

        <button
            type="button"
            class="remove-workflow-step"
            title="Remove workflow step"
        >
            ×
        </button>

    `;


    label
        .querySelector(
            ".remove-workflow-step"
        )
        .onclick = () => {

            label.remove();


            customWorkflowSteps =
                customWorkflowSteps.filter(
                    step =>
                        step.toLowerCase() !==
                        stepName.toLowerCase()
                );


            localStorage.setItem(
                "multitaskedCustomWorkflowSteps",
                JSON.stringify(
                    customWorkflowSteps
                )
            );

        };


    workflowOptions.appendChild(
        label
    );

}

// --------------------------------------------------
// CUSTOM WORKFLOW STEPS
// --------------------------------------------------

const addWorkflowStep =
    document.getElementById("addWorkflowStep");

const customWorkflowStep =
    document.getElementById("customWorkflowStep");

const workflowOptions =
    document.getElementById("workflowOptions");

    loadCustomWorkflowSteps();


addWorkflowStep.onclick = () => {

    const stepName =
        customWorkflowStep.value.trim();


    if (!stepName) {

        alert(
            "Please enter a workflow step."
        );

        return;

    }


    const existingSteps =
        Array.from(
            workflowOptions.querySelectorAll(
                "input[type='checkbox']"
            )
        ).map(
            checkbox =>
                checkbox.value.toLowerCase()
        );


    if (
        existingSteps.includes(
            stepName.toLowerCase()
        )
    ) {

        alert(
            "That workflow step already exists."
        );

        return;

    }


    // Add to the visible workflow

    addWorkflowStepToList(
        stepName
    );


    // Save permanently

    customWorkflowSteps.push(
        stepName
    );


    localStorage.setItem(
        "multitaskedCustomWorkflowSteps",
        JSON.stringify(
            customWorkflowSteps
        )
    );


    customWorkflowStep.value = "";

    customWorkflowStep.focus();

};

// --------------------------------------------------
// DRAG AND DROP WORKFLOW ORDER
// --------------------------------------------------

let draggedWorkflowStep = null;


// START DRAG
workflowOptions.addEventListener(
    "dragstart",
    event => {

        const step =
            event.target.closest(".workflow-option");

        if (!step) {
            return;
        }

        draggedWorkflowStep = step;

        event.dataTransfer.effectAllowed = "move";

        event.dataTransfer.setData(
            "text/plain",
            "workflow-step"
        );

        step.classList.add("dragging");

    }
);


// DRAG OVER
workflowOptions.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

        event.dataTransfer.dropEffect = "move";

        const target =
            event.target.closest(".workflow-option");

        if (
            !target ||
            target === draggedWorkflowStep
        ) {
            return;
        }


        document
            .querySelectorAll(".workflow-option")
            .forEach(step => {

                step.classList.remove(
                    "drag-over"
                );

            });


        target.classList.add(
            "drag-over"
        );

    }
);


// DROP
workflowOptions.addEventListener(
    "drop",
    event => {

        event.preventDefault();

        event.stopPropagation();


        const target =
            event.target.closest(".workflow-option");


        if (
            !target ||
            !draggedWorkflowStep ||
            target === draggedWorkflowStep
        ) {
            return;
        }


        const rect =
            target.getBoundingClientRect();


        const insertBefore =
            event.clientY <
            rect.top + rect.height / 2;


        if (insertBefore) {

            workflowOptions.insertBefore(
                draggedWorkflowStep,
                target
            );

        } else {

            workflowOptions.insertBefore(
                draggedWorkflowStep,
                target.nextSibling
            );

        }


        target.classList.remove(
            "drag-over"
        );

    }
);


// END DRAG
workflowOptions.addEventListener(
    "dragend",
    () => {

        if (draggedWorkflowStep) {

            draggedWorkflowStep.classList.remove(
                "dragging"
            );

        }


        document
            .querySelectorAll(".workflow-option")
            .forEach(step => {

                step.classList.remove(
                    "drag-over"
                );

            });


        draggedWorkflowStep = null;

    }
);




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


       const commercialBreaks =
    includeCommercialBreaks.checked
        ? Array.from(
            breakList.querySelectorAll(
                ".commercial-break-row"
            )
        ).map(row => ({

            duration:
                row.querySelector(
                    ".commercial-break-duration"
                ).value.trim(),

            sent: false

        }))
        : [];


const newGame = {

    name,

    sport,

    startTime,

    status: "UPCOMING",

    dropSlate,

    steps,

    completed: [],

    commercialBreaks

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

    includeCommercialBreaks.checked = false;

commercialBreaksContainer.style.display = "none";

breakList.innerHTML = "";


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
// TEMPLATES
// --------------------------------------------------

const templatesBtn =
    document.getElementById("templatesBtn");

const templatesPanel =
    document.getElementById("templatesPanel");

const closeTemplates =
    document.getElementById("closeTemplates");

const templateList =
    document.getElementById("templateList");

const createTemplateModal =
    document.getElementById("createTemplateModal");

const createTemplateBtn =
    document.getElementById("createTemplateBtn");

const closeCreateTemplateModal =
    document.getElementById("closeCreateTemplateModal");

const cancelCreateTemplate =
    document.getElementById("cancelCreateTemplate");

const templateWorkflowOptions =
    document.getElementById("templateWorkflowOptions");

const saveTemplateBtn =
    document.getElementById("saveTemplateBtn");


// --------------------------------------------------
// OPEN TEMPLATES PANEL
// --------------------------------------------------

if (templatesBtn) {

    templatesBtn.onclick = () => {

        renderTemplates();

        templatesPanel.classList.add(
            "templates-visible"
        );

    };

}


// --------------------------------------------------
// CLOSE TEMPLATES PANEL
// --------------------------------------------------

if (closeTemplates) {

    closeTemplates.onclick = () => {

        templatesPanel.classList.remove(
            "templates-visible"
        );

    };

}


// --------------------------------------------------
// RENDER SAVED TEMPLATES
// --------------------------------------------------

function renderTemplates() {

    if (!templateList) {
        return;
    }


    const savedTemplates =
        JSON.parse(
            localStorage.getItem(
                "multitaskedTemplates"
            )
        ) || [];


    if (savedTemplates.length === 0) {

        templateList.innerHTML = `

            <div class="empty-templates">

                No templates created yet.

            </div>

        `;

        return;

    }


    templateList.innerHTML =
        savedTemplates.map(
            (template, index) => {

                const workflow =
                    template.workflow || [];


                const enabledSteps =
                    workflow.filter(
                        step => step.enabled
                    );


                return `

                    <div class="template-card">

                        <div class="template-card-info">

                            <div class="template-card-name">

                                ${template.name}

                            </div>


                            <div class="template-card-sport">

                                ${template.sport}

                            </div>


                            <div class="template-workflow">

                                ${
                                    enabledSteps.length > 0

                                        ? enabledSteps
                                            .map(
                                                step =>
                                                    `
                                                    <span class="template-step">
                                                        ${step.name}
                                                    </span>
                                                    `
                                            )
                                            .join("")

                                        : `
                                            <span class="template-step">
                                                No workflow steps
                                            </span>
                                        `
                                }

                            </div>


                            ${
                                template.includeCommercialBreaks

                                    ? `
                                        <div class="template-commercial-badge">
                                            COMMERCIAL BREAKS
                                        </div>
                                    `

                                    : ""
                            }

                        </div>


                        <div class="template-card-actions">

                            <button
                                type="button"
                                class="template-use-button"
                                onclick="useTemplate(${index})"
                            >
                                USE
                            </button>


                            <button
                                type="button"
                                class="template-delete-button"
                                onclick="deleteTemplate(${index})"
                            >
                                DELETE
                            </button>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


// --------------------------------------------------
// DELETE TEMPLATE
// --------------------------------------------------

function deleteTemplate(index) {

    const savedTemplates =
        JSON.parse(
            localStorage.getItem(
                "multitaskedTemplates"
            )
        ) || [];


    const template =
        savedTemplates[index];


    if (!template) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${template.name}" template?`
        );


    if (!confirmed) {
        return;
    }


    savedTemplates.splice(
        index,
        1
    );


    localStorage.setItem(
        "multitaskedTemplates",
        JSON.stringify(
            savedTemplates
        )
    );


    renderTemplates();

}


// --------------------------------------------------
// USE TEMPLATE
// --------------------------------------------------

function useTemplate(index) {

    const savedTemplates =
        JSON.parse(
            localStorage.getItem(
                "multitaskedTemplates"
            )
        ) || [];


    const template =
        savedTemplates[index];


    if (!template) {
        return;
    }


    // Close templates panel

    if (templatesPanel) {

        templatesPanel.classList.remove(
            "templates-visible"
        );

    }


    // Open Add Game modal

    if (modal) {

        modal.style.display = "flex";

    }


    // Fill template name / sport

    const sportElement =
        document.getElementById("sport");

    const customSportElement =
        document.getElementById("customSport");


    if (sportElement) {

        const matchingSport =
            Array.from(
                sportElement.options
            ).find(
                option =>
                    option.value ===
                    template.sport
            );


        if (matchingSport) {

            sportElement.value =
                template.sport;

            if (customSportElement) {

                customSportElement.style.display =
                    "none";

                customSportElement.value = "";

            }

        } else {

            sportElement.value =
                "__custom__";


            if (customSportElement) {

                customSportElement.style.display =
                    "block";

                customSportElement.value =
                    template.sport;

            }

        }

    }


    // Apply workflow steps

    const workflowOptionsElement =
        document.getElementById(
            "workflowOptions"
        );


    if (workflowOptionsElement) {

        const templateWorkflow =
            template.workflow || [];


        const templateStepMap =
            {};


        templateWorkflow.forEach(
            step => {

                templateStepMap[
                    step.name
                ] = step.enabled;

            }
        );


        workflowOptionsElement
            .querySelectorAll(
                "input[type='checkbox']"
            )
            .forEach(
                checkbox => {

                    if (
                        Object.prototype.hasOwnProperty.call(
                            templateStepMap,
                            checkbox.value
                        )
                    ) {

                        checkbox.checked =
                            templateStepMap[
                                checkbox.value
                            ];

                    } else {

                        checkbox.checked =
                            false;

                    }

                }
            );

    }


    // Apply commercial-break setting

    const commercialBreakCheckbox =
        document.getElementById(
            "includeCommercialBreaks"
        );


    const commercialBreaksContainer =
        document.getElementById(
            "commercialBreaksContainer"
        );


    const breakListElement =
        document.getElementById(
            "breakList"
        );


    if (commercialBreakCheckbox) {

        commercialBreakCheckbox.checked =
            template.includeCommercialBreaks === true;


        if (
            template.includeCommercialBreaks
        ) {

            commercialBreaksContainer.style.display =
                "block";

            if (
                breakListElement &&
                breakListElement.children.length === 0
            ) {

                addCommercialBreak();

            }

        } else {

            commercialBreaksContainer.style.display =
                "none";

            if (breakListElement) {

                breakListElement.innerHTML = "";

            }

        }

    }

}


// --------------------------------------------------
// CREATE TEMPLATE MODAL
// --------------------------------------------------

if (createTemplateBtn) {

    createTemplateBtn.onclick = () => {

        loadTemplateWorkflowOptions();

        createTemplateModal.style.display =
            "flex";

    };

}


if (closeCreateTemplateModal) {

    closeCreateTemplateModal.onclick = () => {

        createTemplateModal.style.display =
            "none";

    };

}


if (cancelCreateTemplate) {

    cancelCreateTemplate.onclick = () => {

        createTemplateModal.style.display =
            "none";

    };

}


// --------------------------------------------------
// TEMPLATE WORKFLOW BUILDER
// --------------------------------------------------

function loadTemplateWorkflowOptions() {

    if (!templateWorkflowOptions) {
        return;
    }


    templateWorkflowOptions.innerHTML = "";


    const existingWorkflowSteps =
        workflowOptions.querySelectorAll(
            ".workflow-option"
        );


    existingWorkflowSteps.forEach(
        originalStep => {

            const originalCheckbox =
                originalStep.querySelector(
                    "input[type='checkbox']"
                );


            if (!originalCheckbox) {
                return;
            }


            const stepName =
                originalCheckbox.value;


            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "workflow-option";


            label.draggable = true;


            label.innerHTML = `

                <span class="workflow-drag-handle">
                    ⋮⋮
                </span>

                <input
                    type="checkbox"
                    value="${stepName}"
                    ${
                        originalCheckbox.checked
                            ? "checked"
                            : ""
                    }
                >

                <span>
                    ${stepName}
                </span>

            `;


            templateWorkflowOptions.appendChild(
                label
            );

        }
    );

}


// --------------------------------------------------
// SAVE TEMPLATE
// --------------------------------------------------

if (saveTemplateBtn) {

    saveTemplateBtn.onclick = () => {

        const templateName =
            document
                .getElementById("templateName")
                .value
                .trim();


        if (!templateName) {

            alert(
                "Please enter a template name."
            );

            return;

        }


        const templateSport =
            document
                .getElementById("templateSport")
                .value;


        const workflowSteps =
            Array.from(
                templateWorkflowOptions.querySelectorAll(
                    ".workflow-option"
                )
            ).map(
                step => {

                    const checkbox =
                        step.querySelector(
                            "input[type='checkbox']"
                        );


                    return {

                        name:
                            checkbox.value,

                        enabled:
                            checkbox.checked

                    };

                }
            );


        const includeCommercials =
            document
                .getElementById(
                    "templateIncludeCommercials"
                )
                .checked;


        const newTemplate = {

            id: Date.now(),

            name:
                templateName,

            sport:
                templateSport,

            workflow:
                workflowSteps,

            includeCommercialBreaks:
                includeCommercials

        };


        const savedTemplates =
            JSON.parse(
                localStorage.getItem(
                    "multitaskedTemplates"
                )
            ) || [];


        savedTemplates.push(
            newTemplate
        );


        localStorage.setItem(
            "multitaskedTemplates",
            JSON.stringify(
                savedTemplates
            )
        );


        alert(
            `"${templateName}" template saved.`
        );


        createTemplateModal.style.display =
            "none";


        renderTemplates();

    };

}


// --------------------------------------------------
// TEMPLATE SPORT — CUSTOM SPORT
// --------------------------------------------------

const templateSport =
    document.getElementById(
        "templateSport"
    );


const templateCustomSport =
    document.getElementById(
        "templateCustomSport"
    );


if (templateSport) {

    templateSport.addEventListener(
        "change",
        () => {

            if (
                templateSport.value ===
                "__custom__"
            ) {

                templateCustomSport.style.display =
                    "block";

                templateCustomSport.focus();

            } else {

                templateCustomSport.style.display =
                    "none";

                templateCustomSport.value =
                    "";

            }

        }
    );

}


// --------------------------------------------------
// INITIAL TEMPLATE RENDER
// --------------------------------------------------

renderTemplates();


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
    game.commercialBreaks &&
    game.commercialBreaks.length > 0
        ? `

        <div class="operator-breaks">

            <div class="operator-breaks-title">
                COMMERCIAL BREAKS
            </div>


            <div class="operator-break-list">

                ${game.commercialBreaks.map(
                    (breakItem, breakIndex) => {

                        const dropSlateComplete =
                            game.completed.includes(
                                "Drop Slate"
                            );


                        const gameEndComplete =
                            game.completed.includes(
                                "Game End Marker"
                            );
                            
                            const nextBreakIndex =
    game.commercialBreaks.findIndex(
        breakItem => !breakItem.sent
    );

                        return `

                            <div class="
    operator-break
    ${
        breakItem.sent
            ? "operator-break-sent"
            : breakIndex === nextBreakIndex &&
              dropSlateComplete &&
              !gameEndComplete
                ? "operator-break-current"
                : ""
    }
">

                                <div class="operator-break-info">

                                    <span class="operator-break-name">

                                        ${
                                            breakItem.sent
                                                ? "✓"
                                                : "○"
                                        }

                                        BREAK ${breakIndex + 1}

                                    </span>


                                    <button
    class="operator-break-duration"
    onclick="
        editBreakDuration(
            ${index},
            ${breakIndex}
        )
    "
    title="Edit break duration"
>

    ${
        breakItem.duration ||
        "—"
    }

</button>

                                </div>


                              ${
    breakItem.sent
        ? `

        <div class="operator-break-actions">

            <span class="operator-break-status">

                SENT

            </span>

            <button
    class="operator-revert-break-button"
    onclick="
        event.stopPropagation();
        revertBreak(
            ${index},
            ${breakIndex}
        )
    "
    title="Revert break"
>

    ↶

</button>

        </div>

        `
        : dropSlateComplete &&
          !gameEndComplete &&
          breakIndex === nextBreakIndex
            ? `

            <button
                class="operator-break-button"
                onclick="
                    markBreakSent(
                        ${index},
                        ${breakIndex}
                    )
                "
            >

                BREAK SENT

            </button>

            `
            : `

            <span class="operator-break-status">

                ${
                    gameEndComplete
                        ? "CLOSED"
                        : !dropSlateComplete
                            ? "WAITING"
                            : "LOCKED"
                }

            </span>

            `
}

                            </div>

                        `;

                    }
                ).join("")}

            </div>

        </div>

        `
        : ""
}


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

renderTemplates();


setInterval(() => {

    renderGames();

}, 30000);

