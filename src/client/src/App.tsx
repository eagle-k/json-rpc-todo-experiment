import { jsx } from "snabbdom";
import { JSONRPCClient } from "json-rpc-2.0";
import {
  Coproduct,
  ITodoApi,
  match,
  ITodo,
  todoApiMethods,
  FetchTodoKind,
} from "common";

// RPC Engine
const client: JSONRPCClient = new JSONRPCClient((jsonRPCRequest) =>
  fetch("/json-rpc", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(jsonRPCRequest),
  }).then((response) => {
    if (response.status === 200) {
      return response
        .json()
        .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }
  }),
);
function createApi<TAPI>(client: JSONRPCClient): TAPI {
  const apis = {} as any;
  for (const name of todoApiMethods) {
    apis[name] = (param: any) => client.request(name, param);
  }
  return apis;
}
// Free client-side APIs (generated automatically)
const todoApis = createApi<ITodoApi>(client);

// Apps
export type Model = {
  todos: ITodo[]; // TODO: RemoteData<ITodo[]>
  input: string;
  kind: FetchTodoKind;
};

export type Msg = Coproduct<{
  GotTodo: { todos: ITodo[] };
  SetInput: { value: string };
  AddTodo: {};
  AddedTodo: { todo: ITodo };
  UpdateTodo: { todo: ITodo };
  UpdatedTodo: { todo: ITodo };
  GetTodo: { kind: FetchTodoKind };
}>;

export type Dispatch = (msg: Msg) => void;

export type Effect = (dispatch: Dispatch) => void;

// helpers for Effect
const none = () => {};
const onInput = (dispatch: Dispatch) => (msg: Msg["type"]) => (e: Event) =>
  dispatch({
    type: msg,
    value: (e.target as HTMLInputElement).value,
  } as Msg);
const onClick = (dispatch: Dispatch) => (msg: Msg["type"]) => (e: Event) =>
  dispatch({
    type: msg,
  } as Msg);
const onSubmit = (dispatch: Dispatch) => (msg: Msg["type"]) => (e: Event) => {
  e.preventDefault();
  dispatch({
    type: msg,
  } as Msg);
};

export const init: [Model, Effect] = [
  { todos: [], input: "", kind: "All" },
  (dispatch) => {
    dispatch({ type: "GetTodo", kind: "All" });
  },
];

export const update = (msg: Msg, model: Model): [Model, Effect] =>
  match(msg, {
    GotTodo: ({ todos }) => [{ ...model, todos }, none],
    SetInput: ({ value }) => [{ ...model, input: value }, none],
    AddTodo: (_) => [
      { ...model, input: "" },
      async (dispatch) => {
        const todo = await todoApis.addTodo({ text: model.input });
        dispatch({ type: "AddedTodo", todo });
      },
    ],
    AddedTodo: ({ todo }) => [
      { ...model, todos: model.todos.concat([todo]) },
      none,
    ],
    UpdateTodo: ({ todo }) => [
      model,
      async (dispatch) => {
        const updatedTodo = await todoApis.updateTodo({ todo });
        dispatch({ type: "UpdatedTodo", todo: updatedTodo });
      },
    ],
    UpdatedTodo: ({ todo }) => [
      {
        ...model,
        todos: model.todos.map((t) => (todo.id === t.id ? todo : t)),
      },
      none,
    ],
    GetTodo: ({ kind }) => [
      { ...model, kind },
      async (dispatch) => {
        const todos = await todoApis.getTodos({ kind });
        dispatch({ type: "GotTodo", todos });
      },
    ],
  });

export function render(model: Model, dispatch: Dispatch) {
  const input = onInput(dispatch);
  const submit = onSubmit(dispatch);
  return (
    <div>
      <div class={{ hero: true, "is-primary": true }}>
        <div class={{ "hero-body": true }}>
          <form on={{ submit: submit("AddTodo") }}>
            <p class={{ title: true }}>Happy Todo List</p>
            <div class={{ field: true, "has-addons": true }}>
              <div class={{ control: true, "is-expanded": true }}>
                <input
                  class={{ input: true }}
                  attrs={{ type: "text" }}
                  hook={{
                    update: (_old, node) => {
                      (node.elm as HTMLInputElement).value = model.input;
                    },
                  }}
                  on={{ input: input("SetInput") }}
                />
              </div>
              <div class={{ control: true }}>
                <button
                  class={{ button: true, "is-info": true }}
                  attrs={{ type: "submit" }}
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class={{ panel: true }}>
        {renderTabs(model, dispatch)}
        {model.todos.map((todo) => renderTodo(todo, dispatch))}
      </div>
    </div>
  );
}

const kinds: FetchTodoKind[] = ["All", "Undone", "Done"];
function renderTabs(model: Model, dispatch: Dispatch) {
  return (
    <p class={{ "panel-tabs": true }}>
      {kinds.map((kind) => (
        <a
          class={{ "is-active": kind === model.kind }}
          on={{ click: (_) => dispatch({ type: "GetTodo", kind }) }}
        >
          {kind}
        </a>
      ))}
    </p>
  );
}

function renderTodo(todo: ITodo, dispatch: Dispatch) {
  return (
    <div class={{ "panel-block": true }}>
      <input
        attrs={{ type: "checkbox", checked: todo.isDone }}
        on={{
          click: (_) =>
            dispatch({
              type: "UpdateTodo",
              todo: { ...todo, isDone: !todo.isDone },
            }),
        }}
        hook={{
          update: (_old, node) => {
            (node.elm as HTMLInputElement).checked = todo.isDone;
          },
        }}
      />
      {todo.text}
    </div>
  );
}
