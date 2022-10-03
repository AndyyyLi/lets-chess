import { Chess } from 'chess.js';
import "../chessboard";

// chess engine module, provides full functionality to chosen chess puzzle
let ChessEngine = function () {
    let clickSource = null;
    let moves = [];
    let solution = null;
    let attempts = 1;
    let game = null;
    let board = null;
    let config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
    };

    // builds display chessboard from puzzle object at given div
    function buildPuzzle(divId, puzzle) {
        ChessBoard(divId, puzzle.FEN);
    }

    // initializes puzzle for solving
    function initPuzzle(divId, puzzle) {
        // reset moves and attempts for new puzzle
        moves = [];
        attempts = 0;
        addAttempt();

        // sets up chess.js and chessboard
        game = new Chess(puzzle.FEN);
        config.position = puzzle.FEN;
        board = ChessBoard(divId, config);

        // add click listeners to make click to place work
        document.querySelectorAll(".square-55d63").forEach(square => {
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
        document.querySelectorAll(".square-55d63").forEach(square => {
            square.classList.remove("highlight-" + category);
        });
    }

    // fires when user clicks on a piece
    function onDragStart(source, piece, position, orientation) {
        // do not pick up pieces if the game is over
        if (game.game_over()) return false;

        // only pick up pieces for White
        if (piece.search(/^b/) !== -1) return false;

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
        document.querySelector(".square-" + source).classList.add("highlight-options");

        if (possibleMoves.length) {
            // highlight movement options
            possibleMoves.forEach(move => {
                document.querySelector(".square-" + move.to).classList.add("highlight-options");
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

        // highlight white's move
        removeHighlights("white");
        document.querySelector(".square-" + source).classList.add("highlight-white");
        document.querySelector(".square-" + target).classList.add("highlight-white");
        removeHighlights("options");

        addMove(source, target);

        if (clickSource) board.position(game.fen()); // the physical board updates based on game current fen only if clicked, not dragged

        // check move correctness
        if (isCorrect()) {
            // opponent moves
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

        // highlight black's move
        removeHighlights("black");
        document.querySelector('.square-' + source).classList.add('highlight-black');
        document.querySelector('.square-' + target).classList.add('highlight-black');

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
    }

    // adds move to moves, in notation 'sourcetarget' (e.g. 'g2h3'), and updates the last move
    function addMove(source, target) {
        moves.push(source + target);
    }

    // updates display of attempts
    function addAttempt() {
        document.querySelector("#attempts").innerHTML = ++attempts;
    }

    // returns the next move in the solution in notation 'sourcetarget' (e.g. g2h3)
    // note: the next move is always at index i, where i = moves.length
    // explanation: say the user just made their first (correct) move, so moves.length = 2
    // getNextMove should return the third move in the solution (opponent's turn), or solution[2]
    function getNextMove() {
        if (moves.length == solution.length) {
            // solved puzzle!
            return null;
        } else {
            return solution[moves.length];
        }
    }

    // removes the last move made
    function undoMove() {
        if (moves.length) {
            // backend changes
            moves.pop();
            game.undo();

            // visual changes
            removeHighlights("white");
            removeHighlights("options");
            document.querySelector("#notif").innerHTML = "";
            document.getElementById("undoButton").style.display = "none";
            addAttempt();

            // update board
            board.position(game.fen());
        }
    }

    // returns true if the last move made matches solution, else return false
    function isCorrect() {
        if (!solution) return false;

        let i = moves.length - 1;

        if (i > solution.length) return false;

        return moves[i] == solution[i];
    }

    // sets the puzzle and solution from json file
    async function setPuzzle() {
        // reset moves and attempts for new puzzle
        // moves = [];
        // attempts = 0;
        // addAttempt();

        try {
            const response = await fetch('./puzzles/sample_puzzles.json');
            const puzzles = await response.json();

            let sampleSolution = puzzles[0];

            // set game and board to puzzle
            initPuzzle("myBoard", sampleSolution);
            //   game.load(sampleSolution.FEN);
            //   board.position(sampleSolution.FEN);

            // set the solution moves list
            //   solution = sampleSolution.Moves.split(" ");

            // make opponent's move that starts puzzle
            //   setTimeout(opponentMove, 300);

        } catch (err) {
            console.log(err);
        }
    }

    return {
        buildPuzzle: buildPuzzle,
        undoMove: undoMove,
        setPuzzle: setPuzzle
    };

}();

export { ChessEngine };