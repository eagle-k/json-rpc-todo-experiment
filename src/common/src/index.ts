export interface ITodo {
  id: number;
  text: string;
  isDone: boolean;
}

// Domain object should be shared.
export class Todo {
  constructor(
    readonly id: number,
    readonly text: string,
    readonly isDone: boolean,
  ) {}
}

export type FetchTodoKind = "All" | "Undone" | "Done";

// Protocol
export interface ITodoApi {
  getTodos(param: { kind: FetchTodoKind }): Promise<ITodo[]>;
  addTodo(param: { text: string }): Promise<ITodo>;
  updateTodo(param: { todo: ITodo }): Promise<ITodo>;
  // TODO: deleteTodo(param: { id: number })
}

// RPC Engine
function createApiMethodNames<IAPI>(
  dict: { [K in keyof IAPI]: K },
): (keyof IAPI)[] {
  return Object.keys(dict) as any;
}
export const todoApiMethods = createApiMethodNames<ITodoApi>({
  addTodo: "addTodo",
  getTodos: "getTodos",
  updateTodo: "updateTodo",
});

// Helpers
export type Coproduct<T extends Record<keyof any, {}>> = {
  [K in keyof T]: Record<"type", K> & T[K];
}[keyof T];

export type Individual<
  TCoproduct extends Record<"type", keyof any>,
  Tag extends TCoproduct["type"],
> = Extract<TCoproduct, Record<"type", Tag>>;

export function match<TCoproduct extends Record<"type", keyof any>, TOut>(
  value: TCoproduct,
  patterns: {
    [K in TCoproduct["type"]]: (
      param: Omit<Individual<TCoproduct, K>, "type">,
    ) => TOut;
  },
) {
  const tag: TCoproduct["type"] = value.type;
  return patterns[tag](value as any);
}
