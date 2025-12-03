const startButton = document.getElementById('startButton');
const winnerDisplay = document.getElementById('winner');
const horses = document.querySelectorAll('.horse');
const finishLinePosition = window.innerWidth - 200;
const commentatorDiv = document.getElementById('commentator');

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

    // Reset horses and winner display
    winnerDisplay.textContent = '';
    horses.forEach(horse => {
        horse.style.left = '0px';
        // Optionally update the indicator span with the new name
        horse.querySelector('.indicator').textContent = horseNames[Array.from(horses).indexOf(horse)];
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
            // Show input fields again
            nameInputElements.forEach(input => input.style.display = 'inline-block'); // or 'block' depending on desired layout
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
                updateCommentary(`${horseNames[index]} bursts ahead with a powerful spurt!`);
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
                winnerDisplay.textContent = `Winner: ${horseNames[index]}!`;
                updateCommentary(`And the winner is ${horseNames[index]}! What a magnificent race!`);
            }
        });

        // Update commentary for leader changes, but not if the race is already finished
        if (!raceFinished && leaderIndex !== -1 && leaderIndex !== currentLeader) {
            currentLeader = leaderIndex;
            updateCommentary(`${horseNames[currentLeader]} takes the lead!`);
        }

    }, 100);
});