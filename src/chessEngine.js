/* eslint-disable no-undef */
import { Chess } from 'chess.js';
import "./chessboard";
import { isAudienceMode, getPuzzleDifficulty, getPuzzleTitle } from './util';

// chess engine module, provides full functionality to chosen chess puzzle
let ChessEngine = function () {
    let fens = [];
    // replayIdx tracks index of fens in the replay, starts at -1 for first call by initPuzzleReplay
    let replayIdx = -1;
    // correctIdxs tracks the indices of the correct moves in fens
    let correctIdxs = [];
    
    let clickSource = null;
    let attempts = 1;
    let userColour;
    let opponentColour;

    let solution = null;
    let solutionIdx = 0;

    let touches = 0;
    
    let game = null;
    let board = null;
    let config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };

    // returns number of attempts made
    function getAttempts() {
        return attempts;
    }

    // builds display chessboard from puzzle object at given div
    function buildPuzzle(divId, config, isFocusPuzzle) {
        // if only puzzle on screen, set to fullscreen width
        if (isFocusPuzzle) document.querySelector("#" + divId).style.width = (screen.width - 20) + "px";
        
        ChessBoard(divId, config);

        // remove the element added to make dragging functionality work since it's not needed
        document.querySelector(".body").lastElementChild.remove();
    }

    // initializes puzzle for solving
    function initPuzzle(divId, puzzle) {
        // set title of gameplay screen
        document.querySelector("#gameplayScreen .puzzleTitle").innerText = getPuzzleTitle(puzzle);

        // reset fens and setup attempts for new puzzle
        fens = [];
        let savedAttempts = window.app.getAttemptRecord(puzzle.PuzzleId);
        attempts = savedAttempts ? savedAttempts - 1 : 0;
        addAttempt();

        // sets up chess.js and chessboard
        game = new Chess(puzzle.FEN);
        config.position = puzzle.FEN;
        document.querySelector("#" + divId).style.width = (screen.width - 20) + "px";
        board = ChessBoard(divId, config);

        document.getElementById(divId).addEventListener("touchstart", (e) => {
            touches = e.touches.length;
        });

        document.getElementById(divId).addEventListener("touchend", (e) => {
            touches = e.touches.length;
        });

        // show difficulty
        document.querySelector("#gameplayScreen .difficultyIndicator").innerText = getPuzzleDifficulty(puzzle.Rating);

        // determines which colour user plays as
        // opponentMove can only be 'b' or 'w' (check FEN strings samples)
        let opponentsMove = puzzle.FEN.split(" ")[1];
        if (opponentsMove == 'b') {
            opponentColour = "black";
            userColour = "white";
        } else {
            opponentColour = "white";
            userColour = "black";
        }

        // add click listeners to make click to place work
        document.querySelectorAll("#gameplayScreen .square-55d63").forEach(square => {
            let target = square.getAttribute("data-square");

            square.onclick = function() {
                clickToPlace(target);
            };
        });

        // set the solution moves list and reset index
        solution = puzzle.Moves.split(" ");
        solutionIdx = 0;

        // make opponent's move that starts puzzle
        setTimeout(opponentMove, 300);
    }

    // initializes puzzle for solving
    function initPuzzleReplay(divId, fen) {
        // sets up chess.js and chessboard
        game = new Chess(fen);
        document.querySelector("#" + divId).style.width = (screen.width - 20) + "px";
        board = ChessBoard(divId, fen);

        // remove the element added to make dragging functionality work since it's not needed
        document.querySelector(".body").lastElementChild.remove();

        // make opponent's move that starts puzzle
        setTimeout(nextMoveReplay, 300);
    }

    // plays the next move in replay
    function nextMoveReplay() {
        // boundary checker
        if (replayIdx == fens.length) return;

        if (replayIdx == 0) document.querySelector("#recordingScreen .prevMove").classList.remove("faded");
        board.position(fens[++replayIdx]);

        if (replayIdx == fens.length - 1) {
            document.querySelector("#recordingScreen .nextMove").classList.add("faded");
            document.querySelector("#recordingScreen .skipMoves").classList.add("faded");
        }
    }

    // plays the previous move in replay
    function prevMoveReplay() {
        // boundary checker
        if (replayIdx == 0) return;

        if (replayIdx == fens.length - 1) {
            document.querySelector("#recordingScreen .nextMove").classList.remove("faded");
            document.querySelector("#recordingScreen .skipMoves").classList.remove("faded");
        }
        board.position(fens[--replayIdx]);

        if (replayIdx == 0) document.querySelector("#recordingScreen .prevMove").classList.add("faded");
    }

    // removes highlights of the given category (black/white/options)
    function removeHighlights(category) {
        document.querySelectorAll("#gameplayScreen .square-55d63").forEach(square => {
            square.classList.remove("highlight-" + category);
        });
    }

    // fires when user clicks on a piece
    // eslint-disable-next-line no-unused-vars
    function onDragStart(source, piece, position, orientation) {
        // do not pick up more than 1 piece at a time
        if (touches) return false;
        // do not pick up pieces if the game is over
        if (game.game_over()) return false;

        // only pick up pieces for userColour
        if (userColour == "white") {
            if (piece.search(/^b/) !== -1) return false;
        } else {
            if (piece.search(/^w/) !== -1) return false;
        }

        // they picked the piece up to drag
        clickSource = null;

        // they selected a new piece, previous piece options need to be removed
        removeHighlights("options");

        // show possible moves for piece
        var possibleMoves = game.moves({
            square: source,
            verbose: true
        });

        // highlight selected piece regardless of whether it can move or not
        document.querySelector("#gameplayScreen .square-" + source).classList.add("highlight-options");

        if (possibleMoves.length) {
            // highlight movement options
            possibleMoves.forEach(move => {
                document.querySelector("#gameplayScreen .square-" + move.to).classList.add("highlight-options");
            });
        }
    }

    // fires when a picked up piece is dropped
    async function onDrop(source, target) {
        // user may want to click to place their piece
        if (source == target) {
            clickSource = source;
            return;
        }

        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: "q", // NOTE: always promote to a queen for example simplicity
        });

        // illegal move
        // resets touches because touchend event listener is inconsistent
        if (move === null) {
            removeHighlights("options");
            touches = 0;
            return "snapback";
        } 

        // highlight user's move
        removeHighlights(userColour);
        document.querySelector("#gameplayScreen .square-" + source).classList.add("highlight-" + userColour);
        document.querySelector("#gameplayScreen .square-" + target).classList.add("highlight-" + userColour);
        removeHighlights("options");

        addMove();

        if (clickSource) board.position(game.fen()); // the physical board updates based on game current fen only if clicked, not dragged

        // check move correctness
        if (isCorrect(source, target)) {
            // opponent moves
            removeHighlights(opponentColour);
            correctIdxs.push(fens.length - 1);
            solutionIdx++;
            document.querySelector("#notif").innerText = "Nice!";
            window.setTimeout(opponentMove, 250);
        } else {
            // wrong move, must try again
            attempts++;
            
            // Update persistent data for user's attempt record
            let puzzle = window.app.getChosenPuzzle();
            window.app.setAttemptRecord(puzzle.PuzzleId, attempts);
            const service = await o3h.Instance.getUserPersistentDataService();
            service.setPerOoohDataAsync(window.app.attemptRecord);

            document.querySelector("#notif").innerText = "There is a better move";
            document.getElementById("undoButton").style.transform = "scale(1)";

            document.getElementById("hintButton").style.opacity = "0.5";
            document.getElementById("hintButton").disabled = true;

            // threshold for give up button to appear
            // !!! CHANGE ATTEMPTS THRESHOLD FOR FINAL COPY
            if (attempts >= 1 && isAudienceMode()) document.getElementById("giveUpButton").style.transform = "scale(1)";
        }

        clickSource = null;
    }

    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    function onSnapEnd() {
        board.position(game.fen());
    }

    // makes opponent's next move, returns if puzzle is done
    function opponentMove() {
        let nextMove = getNextMove();

        // puzzle complete!
        if (nextMove == null) {
            puzzleFinish();
            return;
        }

        let source = nextMove.substring(0, 2);
        let target = nextMove.substring(2, 4);

        game.move({ from: source, to: target }); // the game status updates

        // highlight opponent's move
        removeHighlights(opponentColour);
        removeHighlights(userColour);
        document.querySelector('#gameplayScreen .square-' + source).classList.add('highlight-' + opponentColour);
        document.querySelector('#gameplayScreen .square-' + target).classList.add('highlight-' + opponentColour);

        board.position(game.fen()); // the physical board updates based on game current fen

        addMove();
    }


    // moves pieces based on clicked target square
    function clickToPlace(target) {
        if (clickSource) {
            if (clickSource != target) onDrop(clickSource, target);
        }
    }

    // displays notification when user solves the puzzle
    function puzzleFinish() {
        document.getElementById("undoButton").style.display = "none";
        document.getElementById("giveUpButton").style.display = "none";
        document.getElementById("hintButton").style.opacity = "0.5";
        document.getElementById("hintButton").disabled = true;

        document.querySelector("#notif").innerText = "Congratulations!";
        document.querySelector("#gameplayScreen .solvedImg").classList.remove("hidden");
        
        // run additional text if competing and update leaderboard
        if (window.app.getIsCompete()) {
            if (isAudienceMode() && attempts <= window.app.getAttempts()) {
                if (attempts < window.app.getAttempts()) {
                    document.querySelector("#gameplayScreen .solvedText").innerText = "You solved the puzzle in fewer attempts than the host!";
                } else if (attempts == window.app.getAttempts()) {
                    document.querySelector("#gameplayScreen .solvedText").innerText = "You solved the puzzle on the same attempt as the host!";
                }
            } else {
                document.querySelector("#gameplayScreen .solvedText").innerText = "You solved the puzzle on attempt " + attempts + "!";
            }

            if (isAudienceMode()) {
                window.app.gameplayScreen.updateLeaderboard(attempts);
            }
            
        }

        document.querySelector("#gameplayScreen .notifDiv .solvedText").classList.remove("hidden");
        document.querySelector("#gameplayScreen .notifDiv .next").classList.remove("hidden");
    }

    // adds current fen to fens with move update
    function addMove() {
        fens.push(game.fen());
    }

    // updates display of attempts
    function addAttempt() {
        document.querySelector("#attempts").innerText = attempts;
    }

    // "fast-forwards" game to skip consecutive blunders and stops at the next correct move
    // returns immediately if no more correct moves to move to
    function skipToNextCorrectMove() {
        let targetIdx = getNextCorrectMoveIdx();

        skipMoves(targetIdx);
    }

    // recursively plays the next move until reached next correct move or until end of fens
    function skipMoves(targetIdx) {
        if (replayIdx == fens.length || replayIdx == targetIdx) return;

        nextMoveReplay();

        setTimeout(skipMoves, 300, targetIdx);
    }

    // returns the index of the next correct move from current replayIdx
    // return 0 if there's no next correct move
    function getNextCorrectMoveIdx() {
        let nextIdx = fens.length - 1;

        for (let i = 0; i < correctIdxs.length; i++) {
            if (replayIdx < correctIdxs[i]) {
                nextIdx = correctIdxs[i];
                break;
            }
        }

        return nextIdx;
    }

    // returns the next move in the solution in notation 'sourcetarget' (e.g. g2h3)
    function getNextMove() {
        if (solutionIdx == solution.length) {
            // solved puzzle!
            return null;
        } else {
            return solution[solutionIdx++];
        }
    }

    // removes the last move made
    async function undoMove() {
        if (fens.length) {
            game.undo();

            // add the undone move for recording
            addMove();

            // visual changes
            removeHighlights(userColour);
            removeHighlights("options");
            document.querySelector("#notif").innerText = "Try again";
            document.getElementById("undoButton").style.transform = "scale(0)";

            document.getElementById("hintButton").style.opacity = "1";
            document.getElementById("hintButton").disabled = false;

            addAttempt();

            // update board
            board.position(game.fen());
        }
    }

    // returns true if the last move made matches next move in solution, else return false
    function isCorrect(source, target) {
        if (!solution) return false;

        return (source + target) == solution[solutionIdx];
    }

    // highlights the piece that needs to move next
    function showHint() {
        clickSource = null;
        removeHighlights("options");

        let source = solution[solutionIdx].substring(0, 2);

        document.querySelector("#gameplayScreen .square-" + source).classList.add("highlight-options");
    }

    return {
        getAttempts: getAttempts,
        buildPuzzle: buildPuzzle,
        undoMove: undoMove,
        initPuzzle: initPuzzle,
        initPuzzleReplay: initPuzzleReplay,
        nextMoveReplay: nextMoveReplay,
        prevMoveReplay: prevMoveReplay,
        skipToNextCorrectMove: skipToNextCorrectMove,
        showHint: showHint
    };

}();

export { ChessEngine };