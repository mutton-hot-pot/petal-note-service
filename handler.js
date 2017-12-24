'use strict';

const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} = require('graphql')
const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      retrieveNote: {
        args: {
          title: { name: 'title', type: new GraphQLNonNull(GraphQLString) }
        },
        type: GraphQLString,
        resolve: (parent, args) => retrieveNote(args.title)
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    createNote: {
      note: {
        args: {
          title: { name: 'title', type: new GraphQLNonNull(GraphQLString) },
          content: { name: 'content', type: new GraphQLNonNull(GraphQLString) }
        },
        type: GraphQLString,
        resolve: (parent, args) => createNote(args.title, args.content)
      }
    }
  })
})

const promisify = foo => new Promise((resolve, reject) => {
  foo((error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  })
})

const retrieveNote = title => promisify(callback =>
  dynamoDb.get({
    TableName: process.env.NOTE_TABLE,
    Key: { title },
  }, callback))
  .then((result) => {
    return result.Item;
  })

const createNote = (title, content) => promisify(callback =>
  dynamoDb.update({
    TableName: process.env.NOTE_TABLE,
    Key: { title, content },
    UpdateExpression: 'ADD title = :title, content = :content',
    ExpressionAttributeValues: {
      ':title': title,
      ':content': content
    },
  }, callback))
  .then(() => nickname);

module.exports.query = (event, context, callback) => graphql(schema, event.queryStringParameters.query)
  .then(
  result => callback(null, { statusCode: 200, body: JSON.stringify(result) }),
  err => callback(err)
  )