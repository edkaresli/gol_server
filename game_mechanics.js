const FileServices = require('./file_services');

// const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");

const DEAD = 0;
const ALIVE = 1; 
const NO_SPECIES = 0;

class Game {
    currentGame;   
    gameIterations;
    n;
    totalSpecies;
    constructor( fileJSON ) {
        // Do something with initial, e.g setup the game
        // array of GameCell[] (game rows)    
        let gameJSON = JSON.parse(fileJSON);   
        this.n = parseInt(gameJSON.life.world.n);
        this.currentGame = new Array(this.n);   
        for(let i = 0; i < this.n; i++) {
            this.currentGame[i] = new Array(this.n);
        }  
        this.gameIterations = [];    
        
        this.totalSpecies = parseInt(gameJSON.life.world.totalSpecies);

        this.createGameFromJSON(gameJSON.life.organisms);
        console.log("Game constructor");
    }
    
    createJSONFromGameIterations() {

        const getAliveCells = (game) => {
            const cells = [];
            for(let i = 0; i < game.length; i++) {
                for(let j = 0; j < game.length; j++) {
                    if(game[i][j].species !== NO_SPECIES) {
                        const cell = { x_pos: i, y_pos: j, speciesType: game[i][j].species }
                        cells.push(cell);
                    }
                }
            }
            return cells;
        }        
        
        const result = {};
        result.life = {};
        result.life.world = {};
        result.life.organisms = [...getAliveCells(this.currentGame)];
        result.life.world.n = this.n;
        result.life.world.totalSpecies = this.totalSpecies;
        result.life.world.iterations = this.gameIterations.length;
        result.life.gameIterations = [];
        for(let i = 0; i < this.gameIterations.length; i++) {
            // This can be optimized to include only living cells
            result.life.gameIterations[i] = this.gameIterations[i];
        }

        return result;
    }

    createGameFromJSON = (cellsArray) => {  
        // Init game with zero values 
        for(let i = 0; i < this.n; i++) {
            for( let j = 0; j < this.n; j++) {
               this.currentGame[i][j] = { status: DEAD, species: NO_SPECIES }; 
            }
        }         
            
        // Copy organisms from JSON to currentGame
        // If more than one organism resides in one cell the last one will overwrite the previous ones
        for (let i = 0; i < cellsArray.length; i++) {
            const cell = cellsArray[i];            
            this.currentGame[parseInt(cell.x_pos)][parseInt(cell.y_pos)] = { status: ALIVE, species: cell.speciesType }
        }                
    } 
    
    // solveConflicts = (gameData) => {
    //     let newGameData = {}

    //     return newGameData;
    // }

    isCellBecomesAlive(adjacentsList) {
        // The count of neighbors of the same type must be exactly 3 so the cell becomes alive                        
        const info = this.getBornCellType(adjacentsList);                
        return info.count === 3;        
    }

    isCellSurvives(cell, adjacentsList) {
        let count = 0;
        // Check whether cell has either 2, 3 adjacent live cells of the same type
        // If cell has 0 live cells or only 1 or 4 or more live cells then it dies
        adjacentsList.forEach(element => {
            if(element.species === cell.species) {
                count++;
            }
        });
        return count >= 2 && count < 4;
    }        
    
    getBornCellType(adjacentsList) {
        let types = new Map();
        let count = 0;
        // Since we might have many spcies type surrounding a dead cell
        // we must find the species type with the most cells surrounding the investigated cell
        for (let i = 0; i < adjacentsList.length; i++) {
          if(adjacentsList[i].species !== NO_SPECIES) {
            if(!types.has(adjacentsList[i].species)) {                
                types.set(adjacentsList[i].species, 1);
            }
            else {
                count = types.get(adjacentsList[i].species);
                count++;
                types.set(adjacentsList[i].species, count);
            }                       
          }      
        }
        let max = 0;
        let key = NO_SPECIES;
        for(let [k, v] of types) {
            if(max < v) {
                max = v;
                key = k;
            }
        }
        return { key, count: max };
    }

    computeCell(i, j, adjacentsList) {
        let currentCell = this.currentGame[i][j];
        let nextIterationCell = {};

        if(currentCell.status === ALIVE) {
            const nextCellAlive = this.isCellSurvives(currentCell, adjacentsList);
            if(nextCellAlive) {
                nextIterationCell = { status: ALIVE, species: currentCell.species }
            }
            else {
                nextIterationCell = { status: DEAD, species: NO_SPECIES }
            }
        }
        else {
            const info = this.getBornCellType(adjacentsList);
            if(info.count === 3) {
                nextIterationCell = { status: ALIVE, species: info.key }
            }
            else {
                nextIterationCell = { status: DEAD, species: NO_SPECIES }
            }            
        }

        return nextIterationCell;
    }
    
    computeCorners(newGameData) {        
        let i = 0;
        let j = 0;
       
        // Corner 0,0
        let adjacentsList = [];
        adjacentsList.push(this.currentGame[i][j + 1]);
        adjacentsList.push(this.currentGame[i + 1][j]);
        adjacentsList.push(this.currentGame[i + 1][j + 1]);
        let cell = this.computeCell(i, j, adjacentsList);
        newGameData[i][j] = cell;
               
        // Corner n - 1, 0
        i = this.n - 1;
        adjacentsList = [];
        adjacentsList.push(this.currentGame[i - 1][j]);
        adjacentsList.push(this.currentGame[i][j + 1]);
        adjacentsList.push(this.currentGame[i - 1][j + 1]);
        cell = this.computeCell(i, j, adjacentsList);
        newGameData[i][j] = cell;
       
        // Corner 0, n - 1
        i = 0;
        j = this.n - 1;
        adjacentsList = [];
        adjacentsList.push(this.currentGame[i][j - 1]);
        adjacentsList.push(this.currentGame[i + 1][j - 1]);
        adjacentsList.push(this.currentGame[i + 1][j]);
        cell = this.computeCell(i, j, adjacentsList);
        newGameData[i][j] = cell;
        
        // Corner n - 1, n - 1
        i = this.n - 1;
        j = this.n - 1;
        adjacentsList = [];
        adjacentsList.push(this.currentGame[i][j - 1]);
        adjacentsList.push(this.currentGame[i - 1][j - 1]);
        adjacentsList.push(this.currentGame[i - 1][j]);
        cell = this.computeCell(i, j, adjacentsList);
        newGameData[i][j] = cell;        
    }

    computeBorders(newGameData) {                        
      
        let adjacentsList = [];        
        // For i = 0, 0 < j < n - 1
        let i = 0; 
        let j;
        for(let j = 1; j < this.n - 1; j++) {
            adjacentsList.push(this.currentGame[i][j - 1]);
            adjacentsList.push(this.currentGame[i + 1][j - 1]);
            adjacentsList.push(this.currentGame[i + 1][j]);
            adjacentsList.push(this.currentGame[i + 1][j + 1]);
            adjacentsList.push(this.currentGame[i][j + 1]);

            const cell = this.computeCell(i, j, adjacentsList);

            newGameData[i][j] = cell;
        }    
        // For i = n - 1, 0 < j < n - 1
        adjacentsList = [];
        i = this.n - 1;
        for(let j = 1; j < this.n - 1; j++) {
            adjacentsList.push(this.currentGame[i][j - 1]);
            adjacentsList.push(this.currentGame[i - 1][j - 1]);
            adjacentsList.push(this.currentGame[i - 1][j]);
            adjacentsList.push(this.currentGame[i - 1][j + 1]);
            adjacentsList.push(this.currentGame[i][j + 1]);

            const cell = this.computeCell(i, j, adjacentsList);

            newGameData[i][j] = cell;
        }       
        // For 0 < i < n - 1, j = 0
        adjacentsList = [];
        j = 0;
        for(let i = 1; i < this.n - 1; i++) {
            adjacentsList.push(this.currentGame[i - 1][j]);
            adjacentsList.push(this.currentGame[i - 1][j + 1]);
            adjacentsList.push(this.currentGame[i][j + 1]);
            adjacentsList.push(this.currentGame[i + 1][j + 1]);
            adjacentsList.push(this.currentGame[i + 1][j]);

            const cell = this.computeCell(i, j, adjacentsList);

            newGameData[i][j] = cell;
        }
        // For 0 < i < n - 1, j = n - 1
        adjacentsList = [];
        j = this.n - 1;
        for(let i = 1; i < this.n - 1; i++) {
            adjacentsList.push(this.currentGame[i - 1][j]);
            adjacentsList.push(this.currentGame[i - 1][j - 1]);
            adjacentsList.push(this.currentGame[i][j - 1]);
            adjacentsList.push(this.currentGame[i + 1][j - 1]);
            adjacentsList.push(this.currentGame[i + 1][j]);

            const cell = this.computeCell(i, j, adjacentsList);

            newGameData[i][j] = cell;
        }
    }

    computeMainSection(newGameData) {
        let adjacentsList = [];
        
        for(let i = 1; i < this.n - 1; i++) {
            for(let j = 1; j < this.n - 1; j++) {
                adjacentsList.push(this.currentGame[i - 1][j - 1]);
                adjacentsList.push(this.currentGame[i - 1][j]);
                adjacentsList.push(this.currentGame[i - 1][j + 1]);
                adjacentsList.push(this.currentGame[i][j - 1]);
                adjacentsList.push(this.currentGame[i][j + 1]);
                adjacentsList.push(this.currentGame[i + 1][j - 1]);
                adjacentsList.push(this.currentGame[i + 1][j]);
                adjacentsList.push(this.currentGame[i + 1][j + 1]);    
                const cell = this.computeCell(i, j, adjacentsList);                
                newGameData[i][j] = cell; 
                adjacentsList = [];
            }
        }
    }

    computeNextIteration() {            
        const newGameData = new Array(this.n);
        for(let i = 0; i < this.n; i++) {
            newGameData[i] = new Array(this.n);
        }
        this.computeCorners(newGameData);
        this.computeBorders(newGameData);         
        this.computeMainSection(newGameData);       
        
        return newGameData;
    }
    
    displayIteration() {
        let output = '';
        for(let i = 0; i < this.n; i++) {
            for(let j = 0; j < this.n; j++) {
                output += this.currentGame[i][j].status === DEAD? 0 : this.currentGame[i][j].species;
            }
            output += '\n'
        }
        console.log(output);
    }

    run(fname) {
        let counter = 0;        
        setInterval(() => {        
        // 1. display game
        // 2. computeNextIteration()
        // 3. swap new game with old game
        // 4. after each 30 seconds save JSON to file
            this.displayIteration();
            const newGame = this.computeNextIteration();
            this.gameIterations.push(this.currentGame);
            this.currentGame = newGame;
            counter++;
            if(counter == 20) {
                // save game iterations to file and clear the iterations array                                
                FileServices.saveJSONAnimToFile(fname, this.createJSONFromGameIterations())
                .then(() => {
                    counter = 0;
                    this.gameIterations = [];
                })
                .catch(err => {
                    console.error(err);
                })
                
            }
        }, 2000)
    }
}

module.exports = Game;