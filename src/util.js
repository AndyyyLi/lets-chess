import { ChessEngine } from "./chessEngine";

export const isCreatorMode = () => o3h.Instance.playType === o3h.PlayType.Creator;

export const isAudienceMode = () => o3h.Instance.playType === o3h.PlayType.Audience;

export const sleep = function(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// clears current puzzles then sorts them
export function sortPuzzles(puzzles, sortBy, currentSort) {
    // will not sort the same sorting type twice
    if (currentSort == sortBy) return;

    let puzzleList = document.getElementById("puzzleList");

    // clear current puzzles
    var child = puzzleList.lastElementChild;
    while (child) {
        puzzleList.removeChild(child);
        child = puzzleList.lastElementChild;
    }

    document.querySelectorAll("#selectionScreen .indicator").forEach(i => {
        i.style.opacity = "0";
    })

    // sort puzzles by:
    if (sortBy == "moves") {
        document.querySelector("#selectionScreen .move").style.opacity = "1";

        puzzles.sort(function(a,b) {
            let numMovesA = a.Moves.split(" ").length;
            let numMovesB = b.Moves.split(" ").length;

            if (numMovesA == numMovesB) return b.Popularity - a.Popularity;

            return numMovesA - numMovesB;
        });

    } else if (sortBy == "difficulty") {
        document.querySelector("#selectionScreen .diff").style.opacity = "1";

        puzzles.sort(function(a,b) {return a.Rating - b.Rating});

    } else if (sortBy == "gameState") {
        document.querySelector("#selectionScreen .state").style.opacity = "1";

        puzzles.sort(function(a,b) {
            let stateA = 0, stateB = 0;

            switch (true) {
                case (a.Themes.includes("mate")):
                    stateA = 1;
                    break;
                case (a.Themes.includes("advantage")):
                    stateA = 2;
                    break;
                case (a.Themes.includes("crushing")):
                    stateA = 3;
                    break;
                case (a.Themes.includes("equality")):
                    stateA = 4;
                    break;
                default:
                    stateA = 5;
            }

            switch (true) {
                case (b.Themes.includes("mate")):
                    stateB = 1;
                    break;
                case (b.Themes.includes("advantage")):
                    stateB = 2;
                    break;
                case (b.Themes.includes("crushing")):
                    stateB = 3;
                    break;
                case (b.Themes.includes("equality")):
                    stateB = 4;
                    break;
                default:
                    stateB = 5;
            }

            if (stateA == stateB) return a.Rating - b.Rating;

            return stateA - stateB;
        });

    } else if (sortBy == "opening") {
        document.querySelector("#selectionScreen .open").style.opacity = "1";

        puzzles.sort(function(a,b) {
            if (a.OpeningFamily == "" && b.OpeningFamily == "") return a.Rating - b.Rating;
            if (a.OpeningFamily == "") return 1;
            if (b.OpeningFamily == "") return -1;

            let idx = 0;

            while (a.OpeningVariation.charCodeAt(idx) == b.OpeningVariation.charCodeAt(idx)
                    && idx < a.OpeningVariation.length - 1 && idx < b.OpeningVariation.length - 1) idx++;

            return a.OpeningFamily.charCodeAt(idx) - b.OpeningFamily.charCodeAt(idx);
        });

    }
}

// displays 8 puzzles at a time, returns updated index for puzzlesList
export function displayPuzzles(puzzles, currIdx) {
    // displayed all puzzles already
    if (currIdx == puzzles.length) return;

    let puzzleList = document.getElementById("puzzleList");
    let width = (screen.width / 2) - 10;

    for (let i = 0; i < 8 && currIdx < puzzles.length; i++) {
        let puzzle = puzzles[currIdx++];

        var board = document.createElement("div");
        board.id = puzzle.PuzzleId;
        board.className = "puzzle";
        board.style.width = width + "px";

        let config = {
            showNotation: false,
            position: puzzle.FEN
        };

        // when clicked, shows user the details popup
        board.onclick = function() {
            window.app.setChosenPuzzle(puzzle);

            // set info
            document.querySelector("#selectionScreen .details .puzzleTitleDetails").innerText = getPuzzleTitle(puzzle);
            document.querySelector("#selectionScreen .details .puzzleDifficulty").innerText = getPuzzleDifficulty(puzzle.Rating);
            document.querySelector("#selectionScreen .details .puzzleUserColour").innerText = (puzzle.FEN.split(" ")[1] == "b") ? "White" : "Black";
            document.querySelector("#selectionScreen .details .puzzleMoves").innerText = puzzle.Moves.split(" ").length / 2;
            document.querySelector("#selectionScreen .details .puzzleObjective").innerText = getPuzzleObjective(puzzle.Themes);

            document.getElementById("puzzleInfo").style.width = (screen.width / 2 - 20) + "px";

            ChessEngine.buildPuzzle("puzzleInfo", config, false);

            document.querySelector("#selectionScreen .showInfo").style.transform = "scale(1)";
        };

        puzzleList.appendChild(board);

        ChessEngine.buildPuzzle(board.id, config, false);
    }
    
    return currIdx;
}

// returns puzzle title based on opening family and variation
export function getPuzzleTitle(puzzle) {
    if (puzzle.OpeningFamily) {
        return puzzle.OpeningVariation.replaceAll('_', ' ');
    } else {
        return "Puzzle " + puzzle.PuzzleId;
    }
}

// returns puzzle difficulty based on rating
export function getPuzzleDifficulty(rating) {
    switch (true) {
        case (rating >= 2750):
            return "Extreme";
        case (rating >= 2000):
            return "Hard";
        case (rating >= 1000):
            return "Medium";
        default:
            return "Easy";
    }
}

// returns puzzle objective based on themes
export function getPuzzleObjective(themes) {

    switch (true) {
        case (themes.includes("mate")):
            return "Checkmate";
        case (themes.includes("advantage")):
            return "Gain decisive advantage";
        case (themes.includes("crushing")):
            return "Exploit opponent's blunder";
        case (themes.includes("equality")):
            return "Recover from disadvantage";
        default:
            return "Identify best moves";
    }
}

// sets up the details for the given focus puzzle
export function setupPuzzleDetails(puzzle, screen, boardId) {

    document.querySelector(screen + " .puzzleTitle").innerText = getPuzzleTitle(puzzle);
    document.querySelector(screen + " .difficultyIndicator").innerText = getPuzzleDifficulty(puzzle.Rating);

    // show what colour user will play as
    let opponentsMove = puzzle.FEN.split(" ")[1];
    if (opponentsMove == 'b') {
        document.querySelector(screen + " .colourBox").style.background = "white";
        document.querySelector(screen + " .colour").innerText = "White";
    } else {
        document.querySelector(screen + " .colourBox").style.background = "black";
        document.querySelector(screen + " .colour").innerText = "Black";
    }
    
    ChessEngine.buildPuzzle(boardId, puzzle.FEN, true);
}

// iterates over all squares of queried board and changes their colours
export function changeBoardColours(query, bgColour, colour) {{
    document.querySelectorAll(query).forEach(e => {
        e.style.backgroundColor = bgColour;
        e.style.color = colour;
    });
}}

// generates the leaderboard at designated screen, also identifies creator/owner entry and optional entry from current user
export function renderLeaderboard(entries, avatarPreloadList, screen, activeUser = "") {
    entries.forEach((entry) => {
        let entryDiv = document.createElement("div");
        entryDiv.className = "leaderboardEntry";

        let avatar = document.createElement("img");
        avatar.className = "entryAvatar";
        avatarPreloadList.addHttpLoad(entry.User.AvatarImageUrl);
        avatar.src = entry.User.AvatarImageUrl;
        entryDiv.appendChild(avatar);

        let name = document.createElement("h3");
        name.className = "entryName";
        name.innerText = entry.User.Name;
        entryDiv.appendChild(name);

        let score = document.createElement("h3");
        score.className = "entryScore";
        score.innerText = entry.Score;
        entryDiv.appendChild(score);

        entryDiv.classList.add("shadow");

        if (entry.IsOwner) {
            entryDiv.classList.add("ownerEntry");
        }

        if (entry.User.Name == activeUser) {
            entryDiv.classList.add("activeUserEntry");
        }

        document.querySelector("#" + screen + " .leaderboard").appendChild(entryDiv);
    });

}