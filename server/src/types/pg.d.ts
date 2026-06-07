declare module "pg" {
  export type QueryResult<T = any> = {
    rows: T[];
    rowCount: number | null;
  };

  export class Pool {
    constructor(config?: Record<string, unknown>);
    query<T = any>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
