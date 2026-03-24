/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetWeatherForecast($latitude: Float!, $longitude: Float!, $units: String!) {\n    weatherForecast(latitude: $latitude, longitude: $longitude, units: $units) {\n      id\n      date\n      dayName\n      high\n      low\n      condition\n      icon\n      precipitation\n      hourly {\n        hour\n        temp\n        condition\n        icon\n        precipitation\n        humidity\n        wind\n      }\n    }\n  }\n": typeof types.GetWeatherForecastDocument,
    "\n  query SearchWeatherLocations($query: String!) {\n    weatherGeocodingSearch(query: $query) {\n      id\n      name\n      country\n      admin1\n      latitude\n      longitude\n    }\n  }\n": typeof types.SearchWeatherLocationsDocument,
};
const documents: Documents = {
    "\n  query GetWeatherForecast($latitude: Float!, $longitude: Float!, $units: String!) {\n    weatherForecast(latitude: $latitude, longitude: $longitude, units: $units) {\n      id\n      date\n      dayName\n      high\n      low\n      condition\n      icon\n      precipitation\n      hourly {\n        hour\n        temp\n        condition\n        icon\n        precipitation\n        humidity\n        wind\n      }\n    }\n  }\n": types.GetWeatherForecastDocument,
    "\n  query SearchWeatherLocations($query: String!) {\n    weatherGeocodingSearch(query: $query) {\n      id\n      name\n      country\n      admin1\n      latitude\n      longitude\n    }\n  }\n": types.SearchWeatherLocationsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetWeatherForecast($latitude: Float!, $longitude: Float!, $units: String!) {\n    weatherForecast(latitude: $latitude, longitude: $longitude, units: $units) {\n      id\n      date\n      dayName\n      high\n      low\n      condition\n      icon\n      precipitation\n      hourly {\n        hour\n        temp\n        condition\n        icon\n        precipitation\n        humidity\n        wind\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetWeatherForecast($latitude: Float!, $longitude: Float!, $units: String!) {\n    weatherForecast(latitude: $latitude, longitude: $longitude, units: $units) {\n      id\n      date\n      dayName\n      high\n      low\n      condition\n      icon\n      precipitation\n      hourly {\n        hour\n        temp\n        condition\n        icon\n        precipitation\n        humidity\n        wind\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchWeatherLocations($query: String!) {\n    weatherGeocodingSearch(query: $query) {\n      id\n      name\n      country\n      admin1\n      latitude\n      longitude\n    }\n  }\n"): (typeof documents)["\n  query SearchWeatherLocations($query: String!) {\n    weatherGeocodingSearch(query: $query) {\n      id\n      name\n      country\n      admin1\n      latitude\n      longitude\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;