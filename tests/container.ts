import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { DataSourceOptions } from 'typeorm';
import { Client } from 'pg';
import { cfg } from '../src/config';

export class PostgresTestContainer {
  private container: StartedPostgreSqlContainer | undefined;
  public client!: Client;

  async start() {
    this.container = await new PostgreSqlContainer('postgres:16')
      .withDatabase('app_test')
      .withUsername('test')
      .withPassword('test')
      .withStartupTimeout(60_000)
      .start();
    return this.container;
  }

  async getClient() {
    if (!this.container) {
      throw new Error('Postgres test container has not been started');
    }

    this.client = new Client({
      host: this.container.getHost(),
      port: this.container.getPort(),
      database: this.container.getDatabase(),
      user: this.container.getUsername(),
      password: this.container.getPassword(),
    });
    await this.client.connect();
    return this.client;
  }

  getTypeOrmOptions(extra: Partial<DataSourceOptions> = {}): DataSourceOptions {
    if (!this.container) {
      throw new Error('Postgres test container has not been started');
    }

    return {
      type: 'postgres',
      host: this.container.getHost(),
      port: this.container.getPort(),
      username: this.container.getUsername(),
      password: this.container.getPassword(),
      database: this.container.getDatabase(),
      synchronize: true,
      dropSchema: true,
      logging: false,
      entities: [],
      retryAttempts: 0,
      retryDelay: 0,
      ...extra,
      // } as DataSourceOptions;
    } as any;
  }

  applyToConfig(database = this.container?.getDatabase()) {
    if (!this.container || !database) {
      throw new Error('Postgres test container has not been started');
    }

    cfg.TYPE = 'postgres';
    cfg.DATABASE_HOST = this.container.getHost();
    cfg.DATABASE_PORT = this.container.getPort();
    cfg.DATABASE_USERNAME = this.container.getUsername();
    cfg.DATABASE_PASSWORD = this.container.getPassword();
    cfg.DATABASE_NAME = database;
    cfg.INITIAL_DATABASE = this.container.getDatabase();
    cfg.SSL_MODE = false;
  }

  async stop() {
    if (this.client) {
      await this.client.end();
    }

    if (this.container) {
      await this.container.stop();
      this.container = undefined;
    }
  }
}
