// Global type declarations for the monorepo
declare module 'uuid' {
  export function v4(): string;
}

declare module 'express' {
  export = express;
  function express(): express.Application;
  namespace express {
    interface Application {
      use(...args: any[]): Application;
      get(...args: any[]): Application;
      post(...args: any[]): Application;
      listen(...args: any[]): any;
    }
    interface Request {
      body: any;
      params: any;
      query: any;
    }
    interface Response {
      json(obj: any): Response;
      status(code: number): Response;
      send(data?: any): Response;
    }
  }
}
