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

export function fetchFeedings(): TaskEither<ApiError, Feeding[]> {
  const scanCommand = new ScanCommand({
    TableName: "Feedings",
  });

  const scanTask = () =>
    tryCatch(
      () => client.send(scanCommand),
      (err: Error) => {
        return {
          message: `error scanning table: ${err.message}`,
          statusCode: 500,
        } as ApiError;
      }
    );

  return pipe(
    TE.Do,
    scanTask,
    TE.map((data) => data.Items.map((item) => unmarshall(item) as Feeding))
  );
}

export function postFeeding(feeding: Feeding): TaskEither<ApiError, void> {
  const putFeedingCommand = () =>
    new PutItemCommand({
      TableName: "Feedings",
      Item: marshall(feeding),
    });

  const putTask = () =>
    tryCatch(
      () => client.send(putFeedingCommand()),
      (err: Error) => {
        return {
          message: `error putting item: ${err.message}`,
          statusCode: 500,
        } as ApiError;
      }
    );

  return pipe(
    TE.Do,
    putTask,
    TE.map(() => {
      return;
    })
  );
}

export function createTable(): TaskEither<ApiError, void> {
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
      (error: Error) => {
        return {
          message: `error creating table: ${error.message}`,
          statusCode: 500,
        } as ApiError;
      }
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
): TaskEither<ApiError, Feeding> {
  return pipe(
    fetchFeedings(),
    TE.map((feedings) => {
      return TE.fromPredicate(
        (filteredFeedings: Feeding[]) => filteredFeedings.length === 1,
        () => {
          return {
            message: `Feeding not found for date ${dateParam} and time ${timeParam}.`,
            statusCode: 404,
          } as ApiError;
        }
      )(
        feedings.filter(
          (feeding) => feeding.date === dateParam && feeding.time === timeParam
        )
      );
    }),
    TE.flatten,
    TE.map((foundFeedingArray) => foundFeedingArray[0])
  );
}
