const FileServices = require('./file_services');

const fileServices = new FileServices();

fileServices.readFile('game.json').then( (data) => {    
    const newGame = new (require('./game_mechanics'))(data);
    newGame.run('game_iter.json');   
})
.catch(e => {
    console.error(e);
})



