import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
    transform(value: string, metadata: ArgumentMetadata): string {
        if (!value || typeof value !== 'string' || value.trim() === '') {
            throw new BadRequestException('Invalid id');
        }
        return value.trim();
    }
}