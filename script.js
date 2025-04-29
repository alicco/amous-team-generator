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