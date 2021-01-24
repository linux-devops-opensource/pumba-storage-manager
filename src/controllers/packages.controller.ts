import {inject} from '@loopback/core';
import {
  del, get,
  HttpErrors,
  oas,
  param, post,
  Request, requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import {readdir} from 'fs';
import path from 'path';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler} from '../types';
const fs = require('fs');


const SANDBOX = path.resolve(__dirname, '../../packages');

export class PackagesController {
  constructor(
    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
  ) { }

  @get('/packages/{sid}/{filename}')
  @oas.response.file()
  downloadFile(
    @param.path.string('sid') SID: string,
    @param.path.string('filename') fileName: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const file = validateFileName(`${SID}/${fileName}`);
    response.download(file, fileName);
    return response;
  }

  @get('/packages/{sid}', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  listFiles(
    @param.path.string('sid') SID: string,
  ): Promise<string[]> {
      return new Promise((resolve, reject) => {
        readdir(`${SANDBOX}/${SID}`, (err, files) => {
          if (err) {reject(err)}
          resolve(files)
        });
      })
    }

  @post('/packages/{sid}', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  postPackage(
    @param.path.string('sid') SID: string,
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      this.handler(request, response, (err: any) => {
        if (err) reject(err);
        else {
          resolve(PackagesController.getFilesAndFields(request));
        }
      });
    });
  }

  @del('/packages/{sid}/{filename}', {
    responses: {
      200: {
        content: {
          // string[]
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        description: 'A list of files',
      },
    },
  })
  deletePackage(
    @param.path.string('filename') fileName: string,
    @param.path.string('sid') SID: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.unlink(`${SANDBOX}/${SID}/${fileName}`, (err: any) => {
        if (err) { reject(err) }
        resolve("file deleted successfully")
      });
    })
  }

  @del('/packages/{sid}', {
    responses: {
      200: {
        content: {
          // string[]
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        description: 'A list of files',
      },
    },
  })
  deleteAllPackages(
    @param.path.string('sid') SID: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.rmdir(`${SANDBOX}/${SID}`,  { recursive: true }, (err: any) => {
        if (err) {reject(err)}
        resolve("SID directory deleted successfully");
      })
    })
  }

  private static getFilesAndFields(request: Request) {
    const uploadedFiles = request.files;
    const mapper = (f: globalThis.Express.Multer.File) => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      encoding: f.encoding,
      mimetype: f.mimetype,
      size: f.size,
    });
    let files: object[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    } else {
      for (const filename in uploadedFiles) {
        files.push(...uploadedFiles[filename].map(mapper));
      }
    }
    return {files, fields: request.body};
  }
}

function validateFileName(fileName: string) {
  const resolved = path.resolve(SANDBOX, fileName);
  if (resolved.startsWith(SANDBOX)) return resolved;
  // The resolved file is outside sandbox
  throw new HttpErrors.BadRequest(`Invalid file name: ${fileName}`);
}
