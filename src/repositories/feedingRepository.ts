import {
  CreateTableCommand,
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { TaskEither, tryCatch } from "fp-ts/TaskEither";
import { Feeding } from "../models/feedings";

const client = new DynamoDBClient({
  region: "local",
  credentials: { accessKeyId: "keyId", secretAccessKey: "secretId" },
  endpoint: "http://localhost:8000",
});

export function fetchFeedings(): TaskEither<Error, Feeding[]> {
  const scanCommand = new ScanCommand({
    TableName: "Feedings",
  });

  const scanTask = () =>
    tryCatch(
      () => client.send(scanCommand),
      (err: Error) => new Error(`error scanning table: ${err.message}`)
    );

  return pipe(
    TE.Do,
    scanTask,
    TE.map((data) => data.Items.map((item) => unmarshall(item) as Feeding))
  );
}

export function postFeeding(feeding: Feeding): TaskEither<Error, void> {
  const putFeedingCommand = () =>
    new PutItemCommand({
      TableName: "Feedings",
      Item: marshall(feeding),
    });

  const putTask = () =>
    tryCatch(
      () => client.send(putFeedingCommand()),
      (error: Error) => new Error(`error putting item: ${error.message}`)
    );

  return pipe(
    TE.Do,
    putTask,
    TE.map(() => {
      return;
    })
  );
}

export function createTable(): TaskEither<Error, void> {
  const createTableCommand = new CreateTableCommand({
    TableName: "Feedings",
    KeySchema: [
      {
        KeyType: "HASH",
        AttributeName: "date",
      },
      {
        AttributeName: "time",
        KeyType: "RANGE",
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "date",
        AttributeType: "S",
      },
      {
        AttributeName: "time",
        AttributeType: "S",
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  });

  const createTableTask = () =>
    tryCatch(
      () => client.send(createTableCommand),
      (error: Error) => new Error(`error creating table: ${error.message}`)
    );

  return pipe(
    TE.Do,
    createTableTask,
    TE.map(() => {
      return;
    })
  );
}

export function fetchFeeding(
  dateParam: string,
  timeParam: string
): TaskEither<Error, Feeding> {
  return pipe(
    fetchFeedings(),
    TE.map((feedings) =>
      feedings.find(
        (feeding) => feeding.date === dateParam && feeding.time === timeParam
      )
    )
  );
}
