import "source-map-support/register";
import express from "express";
import { JSONRPCServer } from "json-rpc-2.0";

import { Todo, ITodoApi, todoApiMethods, ITodo, FetchTodoKind } from "common";

// TODO: Replace the store with a database
class InMemoryTodoStore implements ITodoApi {
  private id: number = 0;
  private readonly todos: Todo[] = [];

  async getTodos({ kind }: { kind: FetchTodoKind }): Promise<ITodo[]> {
    switch (kind) {
      case "All":
        return this.todos;
      case "Done":
        return this.todos.filter((todo) => todo.isDone);
      case "Undone":
        return this.todos.filter((todo) => !todo.isDone);
    }

    const _shouldNotReach: never = kind;
  }
  async addTodo({ text }: { text: string }): Promise<ITodo> {
    const newTodo = new Todo(++this.id, text, false);
    this.todos.push(newTodo);
    return newTodo;
  }

  async updateTodo({ todo }: { todo: ITodo }): Promise<ITodo> {
    const i = this.todos.findIndex((t) => t.id === todo.id);
    if (i < 0) {
      throw new Error("Item does not exist.");
    } else {
      this.todos[i] = todo;
      return this.todos[i];
    }
  }
}
const todoApis = new InMemoryTodoStore();

// RPC Engine
const server = new JSONRPCServer();
for (const name of todoApiMethods) {
  const method = todoApis[name].bind(todoApis) as any;
  server.addMethod(name, method);
}
const app = express();
app.use(express.json());
app.post("/json-rpc", (req, res) => {
  const jsonRPCRequest = req.body;

  server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
    if (jsonRPCResponse) {
      res.json(jsonRPCResponse);
    } else {
      res.sendStatus(204);
    }
  });
});

const PORT = 5000;
app.listen(PORT);
console.log(`listening: http://localhost:${PORT}/`);
