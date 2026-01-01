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

                // We'll add DB, JWT, etc. later
                // DATABASE_URL: Joi.string().required(),
                // JWT_SECRET: Joi.string().when('NODE_ENV', {
                //   is: 'production',
                //   then: Joi.required(),
                //   otherwise: Joi.optional(),
                // }),
            }),
        }),
    ],
})
export class AppConfigModule { }