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

            }),
        }),
    ],
})
export class AppConfigModule { }