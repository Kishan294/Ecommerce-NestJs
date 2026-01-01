import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UTApi } from 'uploadthing/server';

@Injectable()
export class UploadthingService {
  private utapi: UTApi;

  constructor(private configService: ConfigService) {
    // Retrieve token from environment
    const token = this.configService.get<string>('UPLOADTHING_TOKEN');
    if (!token) {
      throw new Error('UPLOADTHING_TOKEN is not defined');
    }

    this.utapi = new UTApi({
      token: token,
    });
  }

  // Upload single file
  async uploadFile(file: Express.Multer.File) {
    try {
      // Convert Buffer to Uint8Array then to ArrayBuffer for Blob compatibility
      const arrayBuffer = file.buffer.buffer.slice(
        file.buffer.byteOffset,
        file.buffer.byteOffset + file.buffer.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: file.mimetype });
      const uploadFile = new File([blob], file.originalname, {
        type: file.mimetype,
      });

      const response = await this.utapi.uploadFiles([uploadFile]);

      // Handle response structure (SDK returns an array)
      if (!response || response.length === 0) {
        throw new Error('UploadThing returned empty response');
      }
      return response[0];
    } catch (error: any) {
      throw new Error(`UploadThing upload failed: ${error.message}`);
    }
  }

  // Delete files
  async deleteFiles(fileKeys: string[]) {
    try {
      return await this.utapi.deleteFiles(fileKeys);
    } catch (error: any) {
      throw new Error(`UploadThing delete failed: ${error.message}`);
    }
  }
}