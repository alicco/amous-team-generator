// Array per memorizzare i giocatori
let allPlayers = [];  // Tutti i giocatori disponibili

// Riferimenti agli elementi del DOM
const playerNameInput = document.getElementById('player-name');
const addPlayerButton = document.getElementById('add-player');
const generateTeamsButton = document.getElementById('generate-teams');
const stepByStepButton = document.getElementById('step-by-step');
const playerButtonsContainer = document.getElementById('player-buttons');
const selectedPlayersContainer = document.getElementById('selected-players');
const teamsContainer = document.getElementById('teams-container');
const selectAllButton = document.getElementById('select-all');
const deselectAllButton = document.getElementById('deselect-all');

// Carica i giocatori dal localStorage all'avvio
loadPlayersFromStorage();

// Event Listeners
addPlayerButton.addEventListener('click', () => {
    addPlayer();
});

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

generateTeamsButton.addEventListener('click', () => {
    // Ottieni i giocatori selezionati
    const playersToUse = getSelectedPlayers();
    
    if (playersToUse.length < 2) {
        alert('Seleziona almeno 2 giocatori per generare le squadre');
        return;
    }
    
    generateBalancedTeams(playersToUse);
});

stepByStepButton.addEventListener('click', () => {
    // Ottieni i giocatori selezionati
    const playersToUse = getSelectedPlayers();
    
    if (playersToUse.length < 2) {
        alert('Seleziona almeno 2 giocatori per l\'estrazione');
        return;
    }
    
    startRouletteExtraction(playersToUse);
});

selectAllButton.addEventListener('click', () => {
    allPlayers.forEach(player => {
        player.selected = true;
    });
    savePlayersToStorage();
    renderPlayerButtons();
    updateSelectedPlayersDisplay();
});

deselectAllButton.addEventListener('click', () => {
    allPlayers.forEach(player => {
        player.selected = false;
    });
    savePlayersToStorage();
    renderPlayerButtons();
    updateSelectedPlayersDisplay();
});

// Funzioni
function addPlayer() {
    const playerName = playerNameInput.value.trim();
    
    if (playerName === '') {
        alert('Inserisci un nome valido');
        return;
    }
    
    if (allPlayers.some(player => player.name === playerName)) {
        alert('Questo giocatore è già stato aggiunto');
        return;
    }
    
    // Aggiungi il giocatore all'array con lo stato selezionato di default
    allPlayers.push({
        name: playerName,
        selected: true
    });
    
    savePlayersToStorage();
    renderPlayerButtons();
    updateSelectedPlayersDisplay();
    
    // Pulisci l'input
    playerNameInput.value = '';
    playerNameInput.focus();
}

function removePlayer(index) {
    allPlayers.splice(index, 1);
    savePlayersToStorage();
    renderPlayerButtons();
    updateSelectedPlayersDisplay();
}

function togglePlayerSelection(index) {
    allPlayers[index].selected = !allPlayers[index].selected;
    savePlayersToStorage();
    renderPlayerButtons();
    updateSelectedPlayersDisplay();
}

function renderPlayerButtons() {
    playerButtonsContainer.innerHTML = '';
    
    allPlayers.forEach((player, index) => {
        const buttonElement = document.createElement('div');
        buttonElement.className = `player-button ${player.selected ? 'selected' : ''}`;
        
        // Aggiungi icona in base allo stato selezionato
        const iconElement = document.createElement('i');
        iconElement.className = player.selected ? 'fas fa-user-check' : 'far fa-user';
        
        const nameElement = document.createElement('span');
        nameElement.textContent = player.name;
        
        const removeElement = document.createElement('i');
        removeElement.className = 'fas fa-times remove-player';
        removeElement.addEventListener('click', (e) => {
            e.stopPropagation();  // Impediamo che il click arrivi anche al pulsante
            removePlayer(index);
        });
        
        buttonElement.appendChild(iconElement);
        buttonElement.appendChild(nameElement);
        buttonElement.appendChild(removeElement);
        
        buttonElement.addEventListener('click', () => {
            togglePlayerSelection(index);
        });
        
        playerButtonsContainer.appendChild(buttonElement);
    });
}

function updateSelectedPlayersDisplay() {
    selectedPlayersContainer.innerHTML = '';
    
    const selectedPlayers = allPlayers.filter(player => player.selected);
    
    if (selectedPlayers.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'info-text';
        emptyMessage.textContent = 'Nessun giocatore selezionato';
        selectedPlayersContainer.appendChild(emptyMessage);
        return;
    }
    
    selectedPlayers.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.className = 'selected-player';
        
        const indicatorElement = document.createElement('span');
        indicatorElement.className = 'player-indicator';
        
        const nameElement = document.createElement('span');
        nameElement.textContent = player.name;
        
        playerElement.appendChild(indicatorElement);
        playerElement.appendChild(nameElement);
        
        selectedPlayersContainer.appendChild(playerElement);
    });
}

function getSelectedPlayers() {
    return allPlayers.filter(player => player.selected).map(player => player.name);
}

function savePlayersToStorage() {
    localStorage.setItem('amousPlayers', JSON.stringify(allPlayers));
}

function loadPlayersFromStorage() {
    const storedPlayers = localStorage.getItem('amousPlayers');
    if (storedPlayers) {
        allPlayers = JSON.parse(storedPlayers);
        renderPlayerButtons();
        updateSelectedPlayersDisplay();
    }
}

/**
 * Calcola il numero ottimale di squadre e giocatori per squadra.
 * Assicura che le squadre siano il più omogenee possibile.
 */
function calculateOptimalTeams(totalPlayers) {
    const maxPlayersPerTeam = 4;
    
    // Caso speciale: 3 o 4 giocatori, una sola squadra
    if (totalPlayers <= 4) {
        return {
            numTeams: 1,
            teamSizes: [totalPlayers],
            singleTeam: true
        };
    }
    
    // Calcola il numero di squadre
    let numTeams = Math.ceil(totalPlayers / maxPlayersPerTeam);
    
    // Per 5 giocatori, usa 2 squadre
    if (totalPlayers === 5) {
        numTeams = 2;
    }
    
    // Calcola i giocatori per squadra (dovrebbe essere un numero minimo)
    let minPlayersPerTeam = Math.floor(totalPlayers / numTeams);
    
    // Calcola quante squadre avranno un giocatore in più
    let teamsWithExtraPlayer = totalPlayers % numTeams;
    
    // Se tutte le squadre avrebbero un giocatore extra, allora tutte hanno lo stesso numero di giocatori
    if (teamsWithExtraPlayer === 0) {
        return {
            numTeams,
            teamSizes: Array(numTeams).fill(minPlayersPerTeam),
            singleTeam: false
        };
    }
    
    // Altrimenti, alcune squadre hanno un giocatore in più
    const teamSizes = Array(numTeams).fill(minPlayersPerTeam);
    for (let i = 0; i < teamsWithExtraPlayer; i++) {
        teamSizes[i]++;
    }
    
    return { 
        numTeams, 
        teamSizes,
        singleTeam: false
    };
}

function generateBalancedTeams(playersToUse) {
    // Copia e mischia l'array dei giocatori
    const shuffledPlayers = [...playersToUse].sort(() => Math.random() - 0.5);
    
    // Calcola la configurazione ottimale delle squadre
    const { numTeams, teamSizes, singleTeam } = calculateOptimalTeams(shuffledPlayers.length);
    
    // Crea un array di squadre vuote
    const teams = Array(numTeams).fill().map(() => []);
    
    // Distribuisci i giocatori tra le squadre in base alle dimensioni calcolate
    let playerIndex = 0;
    for (let i = 0; i < numTeams; i++) {
        for (let j = 0; j < teamSizes[i]; j++) {
            teams[i].push(shuffledPlayers[playerIndex++]);
        }
    }
    
    // Mostra le squadre
    displayTeams(teams, singleTeam);
}

function displayTeams(teams, singleTeam) {
    teamsContainer.innerHTML = '';
    
    // Se è il caso speciale di una sola squadra con 3-4 giocatori
    if (singleTeam) {
        // Crea un messaggio che spiega perché c'è una sola squadra
        const messageDiv = document.createElement('div');
        messageDiv.className = 'team-message';
        messageDiv.innerHTML = `<i class="fas fa-info-circle"></i> Hai selezionato ${teams[0].length} giocatori, non abbastanza per creare più squadre. Ecco la tua squadra!`;
        teamsContainer.appendChild(messageDiv);
    }
    
    teams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';
        
        const teamName = `Squadra ${index + 1}`;
        
        teamDiv.innerHTML = `
            <h3>${teamName}</h3>
            <ul>
                ${team.map(player => `<li>${player}</li>`).join('')}
            </ul>
        `;
        
        teamsContainer.appendChild(teamDiv);
    });
}

function startRouletteExtraction(playersToUse) {
    // Copia e mischia l'array dei giocatori
    const shuffledPlayers = [...playersToUse].sort(() => Math.random() - 0.5);
    
    // Calcola la configurazione ottimale delle squadre
    const { numTeams, teamSizes, singleTeam } = calculateOptimalTeams(shuffledPlayers.length);
    
    // Crea array per tenere traccia dei giocatori per squadra
    const teams = Array(numTeams).fill().map(() => []);
    
    // Imposta lo stato iniziale
    teamsContainer.innerHTML = '';
    
    // Se è il caso speciale di una sola squadra con 3-4 giocatori
    if (singleTeam) {
        // Crea un messaggio che spiega perché c'è una sola squadra
        const messageDiv = document.createElement('div');
        messageDiv.className = 'team-message';
        messageDiv.innerHTML = `<i class="fas fa-info-circle"></i> Hai selezionato ${shuffledPlayers.length} giocatori, non abbastanza per creare più squadre. Inseriremo tutti in una squadra!`;
        teamsContainer.appendChild(messageDiv);
    }
    
    // Crea il contenitore per l'estrazione
    const extractionContainer = document.createElement('div');
    extractionContainer.className = 'extraction-container';
    teamsContainer.appendChild(extractionContainer);
    
    // Crea il contenitore per il giocatore in estrazione
    const currentPlayerContainer = document.createElement('div');
    currentPlayerContainer.className = 'current-player';
    currentPlayerContainer.innerHTML = '<div class="player-spotlight"></div>';
    extractionContainer.appendChild(currentPlayerContainer);
    
    // Crea i contenitori delle squadre
    const teamContainers = [];
    for (let i = 0; i < numTeams; i++) {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';
        teamDiv.innerHTML = `<h3>Squadra ${i + 1}</h3><ul id="team${i}-list" class="team-list"></ul>`;
        teamsContainer.appendChild(teamDiv);
        
        teamContainers.push(document.getElementById(`team${i}-list`));
    }
    
    // Disabilita i pulsanti durante l'estrazione
    generateTeamsButton.disabled = true;
    stepByStepButton.disabled = true;
    
    // Indice corrente del giocatore
    let currentPlayerIndex = 0;
    
    // Funzione per estrarre un singolo giocatore
    function extractNextPlayer() {
        if (currentPlayerIndex < shuffledPlayers.length) {
            const player = shuffledPlayers[currentPlayerIndex];
            
            // Mostra il giocatore estratto nella spotlight
            const playerSpotlight = document.querySelector('.player-spotlight');
            playerSpotlight.textContent = player;
            playerSpotlight.style.display = 'block';
            
            // Per il caso di una sola squadra, non c'è bisogno di animazione roulette
            if (singleTeam) {
                // Aggiungi il giocatore alla squadra dopo una breve pausa
                setTimeout(() => {
                    const li = document.createElement('li');
                    li.textContent = player;
                    teamContainers[0].appendChild(li);
                    
                    // Aggiorna l'array della squadra
                    teams[0].push(player);
                    
                    // Passa al prossimo giocatore
                    currentPlayerIndex++;
                    
                    // Programma la prossima estrazione
                    setTimeout(() => {
                        playerSpotlight.style.display = 'none';
                        extractNextPlayer();
                    }, 500);
                }, 1500);
                
                return;
            }
            
            // Determina le squadre che possono ancora ricevere giocatori
            // (rispettando i limiti di dimensione calcolati)
            const availableTeams = [];
            for (let i = 0; i < numTeams; i++) {
                if (teams[i].length < teamSizes[i]) {
                    availableTeams.push(i);
                }
            }
            
            // Scegli randomicamente tra le squadre disponibili
            const randomIndex = Math.floor(Math.random() * availableTeams.length);
            const targetTeam = availableTeams[randomIndex];
            
            // Animazione roulette
            let rouletteCounter = 0;
            const rouletteTotal = 10 + Math.floor(Math.random() * 10); // 10-19 cambi
            let currentTeam = Math.floor(Math.random() * numTeams);
            
            function rouletteAnimation() {
                // Rimuovi l'evidenziazione dalla squadra precedente
                for (let i = 0; i < numTeams; i++) {
                    document.getElementById(`team${i}-list`).parentElement.classList.remove('highlight');
                }
                
                // Evidenzia la squadra corrente (solo se è disponibile)
                if (teams[currentTeam].length < teamSizes[currentTeam]) {
                    document.getElementById(`team${currentTeam}-list`).parentElement.classList.add('highlight');
                }
                
                // Incrementa il contatore e passa alla squadra successiva
                rouletteCounter++;
                currentTeam = (currentTeam + 1) % numTeams;
                
                // Continua l'animazione o finalizza
                if (rouletteCounter < rouletteTotal) {
                    // Rallenta l'animazione verso la fine
                    const delay = 100 + Math.floor(rouletteCounter / 3) * 50;
                    setTimeout(rouletteAnimation, delay);
                } else {
                    // Finisci l'animazione evidenziando la squadra target e aggiungendo il giocatore
                    for (let i = 0; i < numTeams; i++) {
                        document.getElementById(`team${i}-list`).parentElement.classList.remove('highlight');
                    }
                    document.getElementById(`team${targetTeam}-list`).parentElement.classList.add('highlight');
                    
                    // Aggiungi il giocatore alla squadra target dopo una breve pausa
                    setTimeout(() => {
                        const li = document.createElement('li');
                        li.textContent = player;
                        teamContainers[targetTeam].appendChild(li);
                        
                        // Aggiorna gli array delle squadre
                        teams[targetTeam].push(player);
                        
                        // Rimuovi l'evidenziazione
                        document.getElementById(`team${targetTeam}-list`).parentElement.classList.remove('highlight');
                        
                        // Passa al prossimo giocatore
                        currentPlayerIndex++;
                        
                        // Programma la prossima estrazione
                        setTimeout(() => {
                            playerSpotlight.style.display = 'none';
                            extractNextPlayer();
                        }, 500);
                    }, 500);
                }
            }
            
            // Avvia l'animazione della roulette dopo una breve attesa
            setTimeout(rouletteAnimation, 1000);
            
        } else {
            // Riabilita i pulsanti al termine dell'estrazione
            generateTeamsButton.disabled = false;
            stepByStepButton.disabled = false;
            
            // Rimuovi il contenitore di estrazione
            document.querySelector('.extraction-container').remove();
        }
    }
    
    // Avvia l'estrazione
    extractNextPlayer();
}

// Inizializza l'app
renderPlayerButtons();
updateSelectedPlayersDisplay();