"use strict";

const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} = require("graphql");
const uuidv4 = require("uuid/v4");
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      retrieveNotes: {
        type: GraphQLString,
        resolve: (parent, args) => retrieveNotes()
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: "RootMutationType",
    fields: {
      createNote: {
        note: {
          args: {
            title: { name: "title", type: new GraphQLNonNull(GraphQLString) },
            content: {
              name: "content",
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          type: GraphQLString,
          resolve: (parent, args) => createNote(args.title, args.content)
        }
      }
    }
  })
});

const promisify = foo =>
  new Promise((resolve, reject) => {
    foo((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

const retrieveNotes = () =>
  promisify(callback => {
    const params = {
      TableName: process.env.NOTES_TABLE
    };
    return dynamoDb.scan(params, callback).then(result => result.Items);
  });

const createNote = (title, content) =>
  promisify(callback => {
    const params = {
      TableName: process.env.NOTES_TABLE,
      Item: {
        NoteId: { S: uuidv4() },
        Title: { S: title },
        Content: { S: content }
      }
    };
    return dynamoDb.update(params, callback).then(result => result.Item);
  });

const retrieveNote = noteId =>
  promisify(callback => {
    const params = {
      TableName: process.env.NOTES_TABLE,
      Key: { NoteId: { S: noteId } }
    };
    return dynamoDb.get(params, callback).then(result => {
      return result.Item;
    });
  });

module.exports.query = (event, context, callback) =>
  graphql(schema, event.queryStringParameters.query).then(
    result => callback(null, { statusCode: 200, body: JSON.stringify(result) }),
    err => callback(err)
  );
