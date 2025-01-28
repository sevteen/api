import type { App } from "supertest/types";
import type { TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";

import * as request from "supertest";
import { Test } from "@nestjs/testing";

import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET)", () =>
    request(app.getHttpServer()).get("/").expect(200).expect("Hello World!"));
});
