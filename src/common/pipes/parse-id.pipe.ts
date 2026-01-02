import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';

/**
 * Pipe that ensures the provided ID is a valid, non-empty string.
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
    /**
     * Transforms and validates the input ID.
     * @param value The raw ID value.
     * @param metadata Metadata about the argument.
     * @returns The trimmed string ID.
     * @throws BadRequestException if the ID is invalid.
     */
    transform(value: string, metadata: ArgumentMetadata): string {
        if (!value || typeof value !== 'string' || value.trim() === '') {
            throw new BadRequestException('Invalid id');
        }
        return value.trim();
    }
}