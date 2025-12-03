const startButton = document.getElementById('startButton');
const winnerDisplay = document.getElementById('winner');
const horses = document.querySelectorAll('.horse');
const commentatorDiv = document.getElementById('commentator');
const track = document.getElementById('track'); // Get the track element
const horseRaceGame = document.querySelector('.horse-race-game'); // Get the game container

const TRACK_WIDTH = 3000; // This should match the width set in style.css for #track
const FINISH_LINE_OFFSET = 80; // This should match the right offset in style.css for #finishLine
const finishLinePosition = TRACK_WIDTH - FINISH_LINE_OFFSET; // Finish line position relative to the track

// Game phase thresholds (as percentages of the track)
const EARLY_GAME_THRESHOLD = 0.3; // 30% of the track
const MID_GAME_THRESHOLD = 0.7; // 70% of the track

const finishLineElement = document.getElementById('finishLine'); // Get the finish line element

// Running Styles
const RunningStyle = {
    FRONT_RUNNER: 'Front Runner',
    PACE_CHASER: 'Pace Chaser',
    LATE_SURGER: 'Late Surger',
    END_CLOSER: 'End Closer'
};
const ALL_RUNNING_STYLES = Object.values(RunningStyle); // Array of all running styles

const nameInputElements = [];
for (let i = 0; i < horses.length; i++) {
    nameInputElements.push(document.getElementById(`nameInput${i}`));
}

let raceInterval;
let horseSpurted; // Will be initialized in startButton click
let currentLeader = -1;

function updateCommentary(message) {
    commentatorDiv.textContent = message;
}

startButton.addEventListener('click', () => {
    // Hide input fields
    nameInputElements.forEach(input => input.style.display = 'none');

    // Dynamically get horse names from input fields
    const horseNames = [];
    for (let i = 0; i < horses.length; i++) {
        const inputElement = document.getElementById(`nameInput${i}`);
        horseNames.push(inputElement.value || `Horse ${i + 1}`); // Use input value or a default
    }

    // Assign running styles
    const horseStyles = [];
    horses.forEach((horse, index) => { // Added horse and index to the forEach
        const randomIndex = Math.floor(Math.random() * ALL_RUNNING_STYLES.length);
        const style = ALL_RUNNING_STYLES[randomIndex];
        horseStyles.push(style);
        // Set the running style in the indicator span (will be updated again below with name)
        // For now, just set the style.
        horse.querySelector('.indicator').textContent = `${style}`;
    });
    console.log("Horse Running Styles:", horseStyles); // For debugging

    // Reset horses and winner display
    winnerDisplay.textContent = '';
    horses.forEach((horse, index) => { // Added index
        horse.style.transform = 'translateX(0px)'; // Use transform for movement
        // Update the indicator span with the horse's name and style
        horse.querySelector('.indicator').textContent = `${horseNames[index]} (${horseStyles[index]})`;
    });

    // Make finish line visible
    finishLineElement.style.display = 'block';

    // Reset spurt tracking
    horseSpurted = Array(horses.length).fill(false);

    // Disable start button
    startButton.disabled = true;

    let horsePositions = Array(horses.length).fill(0);
            let raceFinished = false;
            currentLeader = -1; // Reset currentLeader for a new race
    
            updateCommentary("The race is about to begin! Spectators are on the edge of their seats! Current Pace: EARLY");
    
            raceInterval = setInterval(() => {
                if (raceFinished) {
                    clearInterval(raceInterval);
                    startButton.disabled = false;
                    // Show input fields again
                    nameInputElements.forEach(input => input.style.display = 'inline-block');
                    finishLineElement.style.display = 'none'; // Hide finish line after race
                    return;
                }
    
                let maxPosition = -1;
                let leaderIndex = -1;
    
                // Determine current game phase
                const currentProgress = Math.max(...horsePositions) / finishLinePosition;
                let gamePhase;
                if (currentProgress < EARLY_GAME_THRESHOLD) {
                    gamePhase = 'early';
                } else if (currentProgress < MID_GAME_THRESHOLD) {
                    gamePhase = 'mid';
                } else {
                    gamePhase = 'late';
                }
    
                horses.forEach((horse, index) => {
                    let baseStep = Math.random() * 10;
                    let currentHorseSpeed = baseStep;
                    const horseStyle = horseStyles[index];
    
                    // Apply running style and game phase logic
                    switch (horseStyle) {
                        case RunningStyle.FRONT_RUNNER:
                            // Front Runners are full power from start to end
                            currentHorseSpeed *= 1.2; // Constant boost
                            break;
                        case RunningStyle.PACE_CHASER:
                            // Pace Chaser keeps a good distance to the front
                            if (leaderIndex !== -1 && horsePositions[index] < horsePositions[leaderIndex] - (TRACK_WIDTH * 0.1)) {
                                currentHorseSpeed *= 1.1; // Speed up if far behind leader
                            } else if (leaderIndex !== -1 && horsePositions[index] > horsePositions[leaderIndex] - (TRACK_WIDTH * 0.02)) {
                                currentHorseSpeed *= 0.9; // Slow down if too close to leader
                            }
                            break;
                        case RunningStyle.LATE_SURGER:
                            // Late Surgers start slow, surge in mid to late game
                            if (gamePhase === 'early') {
                                currentHorseSpeed *= 0.8;
                            } else if (gamePhase === 'mid') {
                                currentHorseSpeed *= 1.3;
                            } else if (gamePhase === 'late') {
                                currentHorseSpeed *= 1.8;
                            }
                            break;
                        case RunningStyle.END_CLOSER:
                            // End Closers make a big move very late
                            if (gamePhase === 'early' || gamePhase === 'mid') {
                                currentHorseSpeed *= 0.7;
                            } else if (gamePhase === 'late' && horsePositions[index] > finishLinePosition * 0.85) {
                                currentHorseSpeed *= 2.0; // Big boost very late
                            }
                            break;
                    }
    
                    // Late game general boost for all horses
                    if (gamePhase === 'late') {
                        currentHorseSpeed *= 2;
                    }
    
                    // Implement existing spurt logic, adjusted for new speeds
                    // Original logic: if (!horseSpurted[index] && horsePositions[index] > finishLinePosition * 0.7 && Math.random() < 0.30) {
                    // This original spurt needs to be integrated. For now, commenting out to build the new logic.
                    // The new 'Late Surger' and 'End Closer' logic already covers late game boosts.
                    // If a separate "spurt" is still desired, it needs careful consideration.
                    // For now, I'll remove the original spurt logic as it conflicts with the new running styles.
    
                    // Update horse position
                    horsePositions[index] += currentHorseSpeed;
                    horse.style.transform = `translateX(${horsePositions[index]}px)`; // Use transform
    
                    // Determine current leader
                    if (horsePositions[index] > maxPosition) {
                        maxPosition = horsePositions[index];
                        leaderIndex = index;
                    }
    
                    // Check for winner
                    if (horsePositions[index] >= finishLinePosition && !raceFinished) {
                        raceFinished = true;
                        winnerDisplay.textContent = `Winner: ${horseNames[index]}!`;
                        updateCommentary(`And the winner is ${horseNames[index]}! What a magnificent race! Current Pace: ${gamePhase.toUpperCase()}`);
                    }
                });
    
                // Camera scrolls to follow the leading horse
                if (leaderIndex !== -1) {
                    const leaderHorse = horses[leaderIndex];
                    const screenCenter = window.innerWidth / 2;
                    const scrollAmount = maxPosition - screenCenter;
                    const maxScrollLeft = TRACK_WIDTH - window.innerWidth;
                    horseRaceGame.scrollLeft = Math.min(Math.max(0, scrollAmount), maxScrollLeft);
                }
    
                // Update commentary for leader changes, but not if the race is already finished
                if (!raceFinished && leaderIndex !== -1 && leaderIndex !== currentLeader) {
                    currentLeader = leaderIndex;
                    updateCommentary(`${horseNames[currentLeader]} takes the lead! (${horseStyles[currentLeader]}) Current Pace: ${gamePhase.toUpperCase()}`);
                }
    
            }, 100);
        });