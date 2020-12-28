// const newGame = new (require('./game_mechanics'))(data);
// newGame.run('game_iter.json');  
const FileServices = require('./file_services');

const Game = require('./game_mechanics');

test('Checking game data is valid', () => {
    const fileServices = new FileServices();
    fileServices.readFile('game.json')
    .then(data => {
       const game = new Game(data);
       
       expect(game.currentGame).toBeDefined();
    })
    
})