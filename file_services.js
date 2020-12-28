const fs = require('fs');
const xml2json = require('xml2json');

class FileServices {
    fileData; 
    
    constructor() {
        this.fileData = undefined;
    }
    
    readFile(fname) {
        return new Promise((resolve) => {
            const str = fs.readFileSync(`./assets/${fname}`, 'utf8');         
            if( fname.includes('.xml') ) {
                this.fileData = xml2json.toJson(str);
            }
            else if( fname.includes('.json') ) {
                this.fileData = str;
            }
            else {
                throw "Unsupported file type!";
            }
            resolve(this.fileData);
            
            // console.log("Done reading file");            
        });                
    }

    createGameData(fileData) {
        const json = xml2json.toJson(fileData);
        const game = {};
    }

    createJSONFromXML(xmlData) {    
        return xml2json.toJson(xmlData);
    }

    saveXML(fname, gameData) {
       this.fileData = xml2json.toXml(gameData);  
       fs.writeFile(`./assets/${fname}`, this.fileData, err => {
           console.error(err);
       });
    }

    // saveJSONToFile(fname, gameData) {
    //     // Needs to save an array of gameData information, not a single iteration!!!
    //     // I will change it later.
    //     // this.fileData = gameData; 
    //     // testing output:
    //     this.fileData = xml2json.toJson(this.fileData);
    //   //  console.log(JSON.stringify(this.fileData));
    //     fs.writeFile(`./assets/${fname}`, this.fileData, err => {
    //        console.error(err);
    //    });
    // }

    static saveJSONAnimToFile(fname, gameIterations) {
        return new Promise((resolve) => {
            const stringData = JSON.stringify(gameIterations);
            fs.writeFile(`./assets/${fname}`, stringData, 'utf8', (err) => {
                if(err) {
                    console.error(err);
                }
            });
            resolve();
        });        
    }    
}

module.exports = FileServices;