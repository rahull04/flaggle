# Using flaggle with NestJS

This guide provides a step-by-step walkthrough for integrating the **flaggle** feature flag service into a NestJS application using a clean, modular, and idiomatic approach.

## Table of Contents

1. [Installation](#installation)
2. [Database Module Setup](#database-module-setup)
3. [Feature Flag Module Setup](#feature-flag-module-setup)
4. [Integrating into the Main App Module](#integrating-into-the-main-app-module)
5. [Setting Up the Dashboard UI](#setting-up-the-dashboard-ui)
6. [Using FeatureFlagService in Your Application](#using-featureflagservice-in-your-application)

---

## Installation

First, add **flaggle** and the required PostgreSQL driver to your project:

```bash
npm install flaggle pg
# or
yarn add flaggle pg
```

## 1. Database Module Setup

Create a dedicated database module to manage the PostgreSQL connection and provide it globally.

**src/database.module.ts**

```ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: ['dist/**/*.entity.js'],
        synchronize: true, // Set to false in production
      }),
    }),
  ],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => new Pool({
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        user: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
      }),
    },
  ],
  exports: [PG_POOL, TypeOrmModule],
})
export class DatabaseModule {}
```

## 2. Feature Flag Module Setup

Encapsulate **flaggle** logic in a dynamic module.

**src/feature-flags/feature-flag.module.ts**

```ts
import { Global, Module, DynamicModule, ModuleMetadata } from '@nestjs/common';
import { FeatureFlagService, PostgresAdapter } from 'flaggle';
import { Pool } from 'pg';

export const FEATURE_FLAG_OPTIONS = 'FEATURE_FLAG_OPTIONS';

export interface FeatureFlagModuleOptions {
  pool: Pool;
  env: string;
  tableName?: string;
  autoCreate?: boolean;
}

export interface FeatureFlagModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<FeatureFlagModuleOptions> | FeatureFlagModuleOptions;
}

@Global()
@Module({})
export class FeatureFlagModule {
  static forRootAsync(options: FeatureFlagModuleAsyncOptions): DynamicModule {
    const optionsProvider = {
      provide: FEATURE_FLAG_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const serviceProvider = {
      provide: FeatureFlagService,
      inject: [FEATURE_FLAG_OPTIONS],
      useFactory: async (flaggleOptions: FeatureFlagModuleOptions) => {
        const adapter = new PostgresAdapter(flaggleOptions.pool, flaggleOptions.tableName, flaggleOptions.autoCreate);
        await adapter.init();
        return new FeatureFlagService(adapter, flaggleOptions.env);
      },
    };

    return {
      module: FeatureFlagModule,
      imports: options.imports || [],
      providers: [optionsProvider, serviceProvider],
      exports: [serviceProvider],
    };
  }
}
```

## 3. Integrating into the Main App Module

Import the DatabaseModule and FeatureFlagModule in `app.module.ts`.

**src/app.module.ts**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule, PG_POOL } from './database.module';
import { FeatureFlagModule } from './feature-flags/feature-flag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    FeatureFlagModule.forRootAsync({
      inject: [PG_POOL, ConfigService],
      useFactory: (pool: Pool, configService: ConfigService) => ({
        pool,
        tableName: 'flaggle',
        autoCreate: true,
        env: configService.get<string>('NODE_ENV', 'dev'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## 4. Setting Up the Dashboard UI

**flaggle** provides a pre-built Dashboard.

### c. Mount the Router

**src/main.ts**

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createFlaggleRouter, FeatureFlagService } from 'flaggle';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('v1');

  const featureFlagService = app.get(FeatureFlagService);
  const flaggleRouter = await createFlaggleRouter(featureFlagService);
  app.use('/flaggle', flaggleRouter); // Dashboard at /v1/flaggle/dashboard

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

## 5. Using FeatureFlagService in Your Application

Inject `FeatureFlagService` into any service or controller:

**src/app.service.ts**

```ts
import { Injectable } from '@nestjs/common';
import { FeatureFlagService } from 'flaggle';

@Injectable()
export class AppService {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  async getHello(): Promise<string> {
    if (await this.featureFlagService.isEnabled('new-greeting')) {
      return 'Hello from the new feature!';
    }
    return 'Hello World!';
  }
}
```

