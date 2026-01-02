import { FileValidator } from '@nestjs/common';

export class ImageFileTypeValidator extends FileValidator<Record<string, any>> {
  private allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  constructor(validationOptions?: Record<string, any>) {
    super(validationOptions ?? {});
  }

  isValid(file: Express.Multer.File): boolean {
    return this.allowedMimeTypes.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`;
  }
}