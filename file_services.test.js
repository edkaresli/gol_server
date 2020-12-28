const FileServices = require('./file_services');

test('reading a JSON game file', () => {
    const f = new FileServices();
    return f.readFile('game.json').then(data => {
        expect(data).toBeDefined()
    });
})