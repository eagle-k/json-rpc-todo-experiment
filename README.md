# json-rpc-todo-experiment

ToDo Application using [json-rpc-2.0 library](https://github.com/shogowada/json-rpc-2.0)

## Prerequisite

- Node
- Yarn

## Install

```
yarn
```

## Run

```
yarn workspace server run dev
```

```
yarn workspace client run dev
```

## Design

- Domain objects and validation logic should be shared between server and client.
- Languages other than TypeScript should not be used.
- The protocol for communication between server and client should be represented by TypeScript interfaces.
- The server should implement the interfaces, and the client-side API should be available for free.

## TODOS

- Adding features
- Error handlings
- Build for production
