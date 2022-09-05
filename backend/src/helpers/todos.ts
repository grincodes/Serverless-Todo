import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils';

// TODO: Implement businessLogic
const todoAccess = new TodosAccess();

export async function getAllTodos():Promise<TodoItem[]> {
    return todoAccess.getAllTodos()
}

export async function getTodosForUser(userId:string):Promise<TodoItem[]>{
    return await todoAccess.getTodosForUser(userId)
}

export async function updateTodo(UpdateTodoRequest:UpdateTodoRequest,todoId:string,userId:string):Promise<TodoItem>{

    return await todoAccess.updateTodo(UpdateTodoRequest,todoId,userId);
}

export async function deleteTodo(todoId:string,userId:string){
    return await todoAccess.deleteTodo(todoId,userId)
}
export async function createTodo(
    CreateTodoRequest:CreateTodoRequest,
    jwtToken: string
) :Promise<TodoItem>{
    
    const todoId  = uuid.v4()
    const userId = parseUserId(jwtToken)

    return await todoAccess.createTodo({
        userId: userId,
        todoId,
        name: CreateTodoRequest.name,
        dueDate: CreateTodoRequest.dueDate,
        done: false,
        createdAt: new Date().toISOString(),
        attachmentUrl : ""
        
    })
    
}