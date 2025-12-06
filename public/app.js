
// Piece unicode characters - outlined classic style
const pieces = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Initial board setup (FEN-like array)
const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let board = JSON.parse(JSON.stringify(initialBoard));
let moveHistory = [];
let draggedPiece = null;
let draggedFrom = null;
let currentMode = 'play';

function initBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.id = `square-${row}-${col}`;
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece';
                pieceEl.textContent = pieces[piece];
                pieceEl.draggable = true;
                pieceEl.dataset.piece = piece;
                pieceEl.classList.add(piece === piece.toUpperCase() ? 'white' : 'black');
                pieceEl.addEventListener('dragstart', onDragStart);
                pieceEl.addEventListener('dragend', onDragEnd);
                square.appendChild(pieceEl);
            }

            square.addEventListener('dragover', onDragOver);
            square.addEventListener('drop', onDrop);
            boardEl.appendChild(square);
        }
    }
}

function onDragStart(e) {
    const square = e.target.parentElement;
    draggedPiece = e.target;
    draggedFrom = { row: parseInt(square.dataset.row), col: parseInt(square.dataset.col) };
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
}

function onDragEnd(e) {
    e.target.classList.remove('dragging');
}

function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('highlight');
}

function onDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('highlight');

    if (!draggedPiece || !draggedFrom) return;

    const toRow = parseInt(e.currentTarget.dataset.row);
    const toCol = parseInt(e.currentTarget.dataset.col);

    if (draggedFrom.row === toRow && draggedFrom.col === toCol) return;

    // Move piece
    const piece = board[draggedFrom.row][draggedFrom.col];
    board[draggedFrom.row][draggedFrom.col] = null;
    board[toRow][toCol] = piece;

    // Record move
    const fromSquare = String.fromCharCode(97 + draggedFrom.col) + (8 - draggedFrom.row);
    const toSquare = String.fromCharCode(97 + toCol) + (8 - toRow);
    moveHistory.push(`${fromSquare}${toSquare}`);

    draggedPiece = null;
    draggedFrom = null;

    if (currentMode === 'play') {
        updateMoveList();
    }

    initBoard();
}

function resetBoard() {
    board = JSON.parse(JSON.stringify(initialBoard));
    moveHistory = [];
    document.getElementById('play-moves-list').textContent = '';
    document.getElementById('play-moves').classList.add('hidden');
    initBoard();
}

function updateMoveList() {
    const movesList = document.getElementById('play-moves-list');
    const movesContainer = document.getElementById('play-moves');

    if (moveHistory.length > 0) {
        movesContainer.classList.remove('hidden');
        movesList.textContent = moveHistory.join(' ');
    }
}

function loadOpening() {
    const input = document.getElementById('opening-input').value.trim();
    const status = document.getElementById('opening-status');

    if (!input) {
        showStatus('Please enter opening moves', 'error');
        return;
    }

    // Simple parsing: split by space and filter valid moves
    const moves = input.match(/[a-hx][1-8][a-hx][1-8]|[KQRBN]?[a-h]?[x1-8]*[a-h][1-8]/g) || [];

    if (moves.length === 0) {
        showStatus('No valid moves found. Use format: e2e4 or e4', 'error');
        return;
    }

    resetBoard();
    moveHistory = [];

    // Apply moves (simplified - just moves pieces by coordinate)
    for (const move of moves) {
        const from = move.slice(0, 2);
        const to = move.slice(2, 4);

        const fromCol = from.charCodeAt(0) - 97;
        const fromRow = 8 - parseInt(from[1]);
        const toCol = to.charCodeAt(0) - 97;
        const toRow = 8 - parseInt(to[1]);

        if (board[fromRow][fromCol]) {
            const piece = board[fromRow][fromCol];
            board[fromRow][fromCol] = null;
            board[toRow][toCol] = piece;
            moveHistory.push(move);
        }
    }

    showStatus(`Loaded ${moves.length} moves!`, 'success');
    initBoard();
}

function showStatus(message, type) {
    const status = document.getElementById('opening-status');
    status.textContent = message;
    status.className = `status-message ${type} show`;
    setTimeout(() => status.classList.remove('show'), 3000);
}

// Mode switching
document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;

        document.getElementById('play-panel').classList.remove('active');
        document.getElementById('opening-panel').classList.remove('active');

        if (currentMode === 'play') {
            document.getElementById('play-panel').classList.add('active');
        } else {
            document.getElementById('opening-panel').classList.add('active');
        }

        resetBoard();
    });
});

// Initialize
initBoard();
