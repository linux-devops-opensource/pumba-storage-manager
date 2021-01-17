import {get, post, requestBody} from '@loopback/rest';
import {Package} from '../models/package.model';
const fs = require('fs');

const directoryName = "C:\\Users\\haimn\\Desktop\\אקטון\\pumba-storage-manager\\packages\\";

export class PackagesController {
  constructor() { }
  @get('/package')
  getPackage(@requestBody() pack: Package): Promise<Object> {
    return new Promise((resolutionFunc, rejectionFunc) => {
      fs.readFile(directoryName + pack.name, 'utf8', function (err: any, data: any) {
        if (err) {
          rejectionFunc(err);
        }
        pack.file = data;
        resolutionFunc(pack);
      });
    });
  }

  @post('/package')
  postPackage(@requestBody() pack: Package) {
    fs.writeFile(directoryName + pack.name, pack.file, function (err: any) {
      if (err) return console.log(err);
      console.log('saved');
    });
  }
}
