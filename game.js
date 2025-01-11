const game = document.getElementById('game');
const launcher = document.getElementById('launcher');
const scoreElement = document.getElementById('score');

let launcherX = window.innerWidth / 2;
const launcherSpeed = 12;
let missiles = [];
let targets = [];
let score = 0;

// Game state
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false
};

let isGameOver = false;
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// Event listeners
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

function createMissile() {
    const missile = document.createElement('div');
    missile.className = 'missile';
    missile.style.left = launcherX + 'px';
    missile.style.bottom = '60px';
    game.appendChild(missile);
    missiles.push({
        element: missile,
        x: launcherX,
        y: 60,
        speed: 10
    });
}

function createTarget() {
    const target = document.createElement('div');
    target.className = 'target';
    const x = Math.random() * window.innerWidth;
    target.style.left = x + 'px';
    target.style.top = '0px';
    game.appendChild(target);
    targets.push({
        element: target,
        x: x,
        y: 0,
        speed: 2 + Math.random() * 2
    });
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    game.appendChild(explosion);
    
    // Remove explosion element after animation
    setTimeout(() => {
        game.removeChild(explosion);
    }, 500);
}

function gameOver() {
    isGameOver = true;
    gameOverScreen.style.display = 'block';
    finalScoreDisplay.textContent = `Final Score: ${score}`;
}

function resetGame() {
    isGameOver = false;
    score = 0;
    scoreElement.textContent = 'Score: 0';
    gameOverScreen.style.display = 'none';
    
    // Clear all existing missiles and targets
    missiles.forEach(missile => game.removeChild(missile.element));
    targets.forEach(target => game.removeChild(target.element));
    missiles = [];
    targets = [];
    
    // Reset launcher position
    launcherX = window.innerWidth / 2;
    launcher.style.left = launcherX + 'px';

    // Restart the game loop
    requestAnimationFrame(updateGame);
}

// Add event listener for restart button
restartButton.addEventListener('click', resetGame);

function updateGame() {
    if (isGameOver) return;  // Stop game updates if game is over
    
    // Move launcher
    if (keys.ArrowLeft) {
        launcherX = Math.max(20, launcherX - launcherSpeed);
    }
    if (keys.ArrowRight) {
        launcherX = Math.min(window.innerWidth - 20, launcherX + launcherSpeed);
    }
    if (keys.ArrowUp) {
        if (missiles.length < 5) { // Limit number of missiles
            createMissile();
            keys.ArrowUp = false; // Prevent holding up key
        }
    }
    
    launcher.style.left = launcherX + 'px';

    // Update missiles
    missiles.forEach((missile, index) => {
        missile.y += missile.speed;
        missile.element.style.bottom = missile.y + 'px';
        
        // Remove missiles that go off screen
        if (missile.y > window.innerHeight) {
            game.removeChild(missile.element);
            missiles.splice(index, 1);
        }
    });

    // Update targets
    targets.forEach((target, targetIndex) => {
        target.y += target.speed;
        target.element.style.top = target.y + 'px';
        
        // Check if target hits launcher
        const dx = Math.abs(target.x - launcherX);
        const dy = Math.abs(target.y - (window.innerHeight - 60));
        if (dx < 30 && dy < 20) {
            createExplosion(target.x, target.y);
            gameOver();
            return;
        }
        
        // Check collision with missiles
        missiles.forEach((missile, missileIndex) => {
            const dx = Math.abs(missile.x - target.x);
            const dy = Math.abs(window.innerHeight - missile.y - target.y);
            if (dx < 20 && dy < 20) {
                // Collision detected
                createExplosion(target.x, target.y);
                game.removeChild(target.element);
                game.removeChild(missile.element);
                targets.splice(targetIndex, 1);
                missiles.splice(missileIndex, 1);
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
            }
        });

        // Remove targets that go off screen
        if (target.y > window.innerHeight) {
            game.removeChild(target.element);
            targets.splice(targetIndex, 1);
        }
    });

    // Randomly create new targets
    if (Math.random() < 0.02 && targets.length < 5) {
        createTarget();
    }

    requestAnimationFrame(updateGame);
}

// Start the game
updateGame(); 