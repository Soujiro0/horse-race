const startButton = document.getElementById('startButton');
const winnerDisplay = document.getElementById('winner');
const horses = document.querySelectorAll('.horse');
const finishLinePosition = window.innerWidth - 200;
const commentatorDiv = document.getElementById('commentator');

let raceInterval;
let horseSpurted = Array(horses.length).fill(false); // To track if a horse has spurted
let currentLeader = -1; // To track the current leading horse for commentary

function updateCommentary(message) {
    commentatorDiv.textContent = message;
}

startButton.addEventListener('click', () => {
    // Reset horses and winner display
    winnerDisplay.textContent = '';
    horses.forEach(horse => {
        horse.style.left = '0px';
    });

    // Reset spurt tracking
    horseSpurted = Array(horses.length).fill(false);

    // Disable start button
    startButton.disabled = true;

    let horsePositions = Array(horses.length).fill(0);
    let raceFinished = false;
    currentLeader = -1; // Reset currentLeader for a new race

    updateCommentary("The race is about to begin! Spectators are on the edge of their seats!");

    raceInterval = setInterval(() => {
        if (raceFinished) {
            clearInterval(raceInterval);
            startButton.disabled = false;
            return;
        }

        let maxPosition = -1;
        let leaderIndex = -1;

        horses.forEach((horse, index) => {
            let randomStep = Math.random() * 10;

            // Implement late game spurt
            if (!horseSpurted[index] && horsePositions[index] > finishLinePosition * 0.7 && Math.random() < 0.30) { // 30% chance for a spurt in late game
                randomStep *= 5; // 5x speed boost
                horseSpurted[index] = true;
                updateCommentary(`Horse ${index + 1} bursts ahead with a powerful spurt!`);
            }

            horsePositions[index] += randomStep;
            horse.style.left = `${horsePositions[index]}px`;

            // Determine current leader
            if (horsePositions[index] > maxPosition) {
                maxPosition = horsePositions[index];
                leaderIndex = index;
            }

            // Check for winner
            if (horsePositions[index] >= finishLinePosition && !raceFinished) {
                raceFinished = true;
                winnerDisplay.textContent = `Winner: Horse ${index + 1}!`;
                updateCommentary(`And the winner is Horse ${index + 1}! What a magnificent race!`);
            }
        });

        // Update commentary for leader changes, but not if the race is already finished
        if (!raceFinished && leaderIndex !== -1 && leaderIndex !== currentLeader) {
            currentLeader = leaderIndex;
            updateCommentary(`Horse ${currentLeader + 1} takes the lead!`);
        }

    }, 100);
});