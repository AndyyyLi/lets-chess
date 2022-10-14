import { ChessEngine } from "./chessEngine";

export const isCreatorMode = () => o3h.Instance.playType === o3h.PlayType.Creator;

export const isAudienceMode = () => o3h.Instance.playType === o3h.PlayType.Audience;

export const sleep = function(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function sortAndDisplayPuzzles(puzzles, sortBy, currentSort, screenApp) {
    // will not sort the same sorting type twice
    if (currentSort == sortBy) return;

    let puzzleList = document.getElementById("puzzleList");

    // clear current puzzles
    var child = puzzleList.lastElementChild;
    while (child) {
        puzzleList.removeChild(child);
        child = puzzleList.lastElementChild;
    }

    // sort puzzles
    if (sortBy == "moves") {

        puzzles.sort(function(a,b) {
            let numMovesA = a.Moves.split(" ").length;
            let numMovesB = b.Moves.split(" ").length;

            if (numMovesA == numMovesB) return b.Popularity - a.Popularity;

            return numMovesA - numMovesB;
        });

    } else if (sortBy == "difficulty") {

        puzzles.sort(function(a,b) {return a.Rating - b.Rating});

    } else if (sortBy == "gameState") {

        puzzles.sort(function(a,b) {
            let stateA = 0, stateB = 0;

            if (a.Themes.includes("endgame")) {
                stateA = 2;
            } else if (a.Themes.includes("middlegame")) {
                stateA = 1;
            }

            if (b.Themes.includes("endgame")) {
                stateB = 2;
            } else if (b.Themes.includes("middlegame")) {
                stateB = 1;
            }

            if (stateA == stateB) return a.Rating - b.Rating;

            return stateB - stateA;
        });

    } else if (sortBy == "opening") {

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
    // NOTE: initial display of puzzles has sortBy = "none", which skips all sorting options

    // display puzzles
    // !!! CAN BE OPTIMIZED
    let width = (screen.width / 2) - 10;

    puzzles.forEach(puzzle => {
        var board = document.createElement("div");
        board.id = puzzle.PuzzleId;
        board.className = "puzzle";
        board.style.width = width + "px";

        // when clicked, takes user to confirm screen
        board.onclick = function() {
            window.app.setChosenPuzzle(puzzle);

            // show title
            if (puzzle.OpeningFamily) {
                let name = puzzle.OpeningVariation.replaceAll('_', ' ');
                document.querySelector("#detailsScreen .puzzleTitle").innerHTML = name;
            } else {
                document.querySelector("#detailsScreen .puzzleTitle").innerHTML = "Puzzle " + puzzle.PuzzleId;
            }
            setupPuzzleDetails(puzzle, "#detailsScreen", "puzzleDetails");

            window.app.showDetails();
        };

        puzzleList.appendChild(board);

        ChessEngine.buildPuzzle(board.id, puzzle.FEN, false);

        document.querySelector(".body").lastElementChild.remove();
    });
}

// setups up the details screen with the given puzzle
export function setupPuzzleDetails(puzzle, screen, boardId) {
    // show difficulty
    let rating = puzzle.Rating;
    let difficulty;
    switch (true) {
        case (rating >= 2750):
            difficulty = "Extreme";
            break;
        case (rating >= 2000):
            difficulty = "Hard";
            break;
        case (rating >= 1000):
            difficulty = "Medium";
            break;
        default:
            difficulty = "Easy";
    }

    document.querySelector(screen + " .difficultyIndicator").innerHTML = difficulty;

    // show what colour user will play as
    let opponentsMove = puzzle.FEN.split(" ")[1];
    if (opponentsMove == 'b') {
        document.querySelector(screen + " .colourBox").style.background = "white";
        document.querySelector(screen + " .colour").innerHTML = "White";
    } else {
        document.querySelector(screen + " .colourBox").style.background = "black";
        document.querySelector(screen + " .colour").innerHTML = "Black";
    }
    
    ChessEngine.buildPuzzle(boardId, puzzle.FEN, true);

    document.querySelector(".body").lastElementChild.remove();
}

// iterates over all squares of queried board and changes their colours
export function changeBoardColours(query, bgColour, colour) {{
    document.querySelectorAll(query).forEach(e => {
        e.style.backgroundColor = bgColour;
        e.style.color = colour;
    });
}}