import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('development', 'test', 'production')
                    .default('development'),
                PORT: Joi.number().default(3000),

                DATABASE_URL: Joi.string().required(),
                JWT_SECRET: Joi.string().when('NODE_ENV', {
                    is: 'production',
                    then: Joi.required(),
                    otherwise: Joi.optional().default('dev-secret-do-not-use-in-prod'),
                }),
                JWT_EXPIRATION: Joi.string().default('1h'),
            }),
        }),
    ],
})
export class AppConfigModule { }