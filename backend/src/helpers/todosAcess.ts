import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
        private readonly docClient:DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ){}

   async getAllTodos(): Promise<TodoItem[]>{ 
        logger.info('Getting all todos');
        const result = await this.docClient.scan({
        TableName: this.todosTable
        }).promise()

        const items = result.Items
        return items as TodoItem[]
        
   }

   async getTodosForUser(userId:string):Promise<TodoItem[]>{
      logger.info(`Getting all todos for a {userId}`);
     const result = await this.docClient.query({ 
      TableName : this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }}).promise()
      const items = result.Items;
      return items as TodoItem[]
      
   }

   async updateTodo(updateTodo:TodoUpdate,todoId:string,userId:string):Promise<TodoItem>{
      logger.info(` updating todo {todoId}`);
     const result = await this.docClient.update({
              TableName: this.todosTable,
              UpdateExpression: `set #name = :name1, dueDate = :dueDate, done = :done, attachmentUrl =:attachmentUrl`,
              Key:{
                  'userId' : userId,
                  'todoId':todoId,

              },
              ExpressionAttributeValues: {
                ":name1": updateTodo.name,
                ":dueDate": updateTodo.dueDate,
                ":done" : updateTodo.done,
                ":todoId" : todoId,
                ":attachmentUrl" : updateTodo.attachmentUrl,
                ':userId': userId
              },
              ExpressionAttributeNames:{
                  "#name" : "name"
              },
              ConditionExpression: `userId = :userId AND todoId = :todoId`,
            }).promise()




      const item = result.Attributes;
      return item as TodoItem
      
   }

   

  async  updateAttachmentInTodoItem(userId: string,todoId: string,attachmentUrl: string): Promise<void> {
    await this.docClient
    .update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      },
    }).promise()

  return
}

   async deleteTodo(todoId:string,userId:string):Promise<string>{
        await this.docClient.delete({
          TableName: this.todosTable,
          Key: {
            'userId' : userId,
            'todoId': todoId
          },
           ExpressionAttributeValues: {
                ":todoId" : todoId,
                ':userId': userId
              },

              ConditionExpression: `userId = :userId AND todoId = :todoId `,
          
        })
      .promise()

      return todoId
   }

   async createTodo(todo:TodoItem):Promise<TodoItem> {
        await this.docClient.put({
             TableName: this.todosTable,
             Item: todo
        }).promise()
        return todo
   }
}


function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}