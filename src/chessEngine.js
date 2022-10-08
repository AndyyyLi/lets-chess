import { Chess } from 'chess.js';
import "./chessboard";

// chess engine module, provides full functionality to chosen chess puzzle
let ChessEngine = function () {
    let clickSource = null;
    let moves = [];
    // correctMoves and correctIdx track the indexes of the correct moves in moves
    let correctMoves = [];
    let correctIdx = 0;
    let attempts = 1;
    let userColour;
    let opponentColour;

    let solution = null;
    let solutionIdx = 0;
    
    let game = null;
    let board = null;
    let config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
    };

    // returns number of attempts made
    function getAttempts() {
        return attempts;
    }

    // builds display chessboard from puzzle object at given div
    function buildPuzzle(divId, fen, isOnlyPuzzle) {
        // if only puzzle on screen, set to fullscreen width
        if (isOnlyPuzzle) document.querySelector("#" + divId).style.width = (screen.width - 10) + "px";
        
        ChessBoard(divId, fen);
    }

    // initializes puzzle for solving
    function initPuzzle(divId, puzzle) {
        // set title of gameplay screen
        if (puzzle.OpeningFamily) {
            let name = puzzle.OpeningVariation.replaceAll('_', ' ');
            document.querySelector("#gameplayScreen .puzzleTitle").innerHTML = name;
        } else {
            document.querySelector("#gameplayScreen .puzzleTitle").innerHTML = "Puzzle " + puzzle.PuzzleId;
        }

        // reset moves and attempts for new puzzle
        moves = [];
        attempts = 0;
        addAttempt();

        // sets up chess.js and chessboard
        game = new Chess(puzzle.FEN);
        config.position = puzzle.FEN;
        document.querySelector("#" + divId).style.width = (screen.width - 10) + "px";
        board = ChessBoard(divId, config);

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
            let target = square.getAttribute("data-square")

            square.onclick = function() {
                clickToPlace(target);
            }
        });

        // set the solution moves list
        solution = puzzle.Moves.split(" ");

        // make opponent's move that starts puzzle
        setTimeout(opponentMove, 300);
    }

    // removes highlights of the given category (black/white/options)
    function removeHighlights(category) {
        document.querySelectorAll("#gameplayScreen .square-55d63").forEach(square => {
            square.classList.remove("highlight-" + category);
        });
    }

    // fires when user clicks on a piece
    function onDragStart(source, piece, position, orientation) {
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
            })
        }
    }

    // fires when a picked up piece is dropped
    function onDrop(source, target) {
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
        if (move === null) return "snapback";

        // highlight user's move
        removeHighlights(userColour);
        document.querySelector("#gameplayScreen .square-" + source).classList.add("highlight-" + userColour);
        document.querySelector("#gameplayScreen .square-" + target).classList.add("highlight-" + userColour);
        removeHighlights("options");

        addMove(source, target);

        if (clickSource) board.position(game.fen()); // the physical board updates based on game current fen only if clicked, not dragged

        // check move correctness
        if (isCorrect()) {
            // opponent moves
            removeHighlights(opponentColour);
            correctMoves.push(moves.length - 1);
            solutionIdx++;
            window.setTimeout(opponentMove, 250);
            document.querySelector("#notif").innerHTML = "";
            document.getElementById("undoButton").style.display = "none";
        } else {
            // wrong move, must try again
            document.querySelector("#notif").innerHTML = "There is a better move."
            document.getElementById("undoButton").style.display = "inline";
        }
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

        addMove(source, target);
    }


    // moves pieces based on clicked target square
    function clickToPlace(target) {
        if (clickSource) {
            if (clickSource != target) onDrop(clickSource, target);
            removeHighlights("options");
            clickSource = null;
        }
    }

    // displays notification when user solves the puzzle
    function puzzleFinish() {
        document.querySelector("#notif").innerHTML = "Congratulations on solving the puzzle!";
        document.querySelector("#gameplayScreen .controls").classList.remove("hidden");
    }

    // adds move to moves, in notation 'sourcetarget' (e.g. 'g2h3'), and updates the last move
    function addMove(source, target) {
        moves.push(source + target);
    }

    // updates display of attempts
    function addAttempt() {
        document.querySelector("#attempts").innerHTML = ++attempts;
    }

    // returns the index of the next correct move for skipping
    function getNextCorrectMoveIdx() {
        return correctMoves[correctIdx++];
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
    function undoMove() {
        if (moves.length) {
            // backend changes
            game.undo();

            // visual changes
            removeHighlights(userColour);
            removeHighlights("options");
            document.querySelector("#notif").innerHTML = "";
            document.getElementById("undoButton").style.display = "none";
            addAttempt();

            // update board
            board.position(game.fen());
        }
    }

    // returns true if the last move made matches next move in solution, else return false
    function isCorrect() {
        if (!solution) return false;

        let i = moves.length - 1;

        return moves[i] == solution[solutionIdx];
    }

    return {
        getAttempts: getAttempts,
        buildPuzzle: buildPuzzle,
        undoMove: undoMove,
        initPuzzle: initPuzzle
    };

}();

export { ChessEngine };