/** Dependency-free SDK for the versioned public API. */
export type Language = "en" | "cs";
export interface Envelope<T> {
  data: T;
  meta: { apiVersion: string; language: Language };
}
export class AgentApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export class AgentClient {
  constructor(
    readonly baseUrl = "https://monikadvorackova.net",
    readonly lang: Language = "en",
    private readonly token?: string,
  ) {}
  async request<T>(
    path: string,
    options: {
      method?: "GET" | "POST";
      body?: unknown;
      idempotencyKey?: string;
      query?: Record<string, string | number>;
    } = {},
  ): Promise<T> {
    if (!/^[a-z][a-z0-9/-]*$/.test(path)) throw new Error("Invalid API path");
    const url = new URL("/api/v1/" + path, this.baseUrl);
    url.searchParams.set("lang", this.lang);
    for(const [key,value] of Object.entries(options.query||{}))url.searchParams.set(key,String(value));
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(this.token ? { Authorization: "Bearer " + this.token } : {}),
        ...(options.idempotencyKey
          ? { "Idempotency-Key": options.idempotencyKey }
          : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
    const payload = await response.json();
    if (!response.ok)
      throw new AgentApiError(
        response.status,
        payload.error?.code || "request_failed",
        payload.error?.message || "Request failed",
      );
    return (payload as Envelope<T>).data;
  }
  profile() {
    return this.request<{
      id: string;
      title: string;
      description: string;
      status: string;
    }>("profile");
  }
  ask(question: string) {
    return this.request<{
      answer: string | null;
      abstained: boolean;
      citations: unknown[];
    }>("ask", { method: "POST", body: { question, lang: this.lang } });
  }
  prepareInquiry(input: {
    type:
      | "collaboration"
      | "speaking"
      | "research"
      | "consulting"
      | "technical_project";
    name: string;
    email: string;
    message: string;
    consent: true;
  }) {
    return this.request("inquiries/prepare", { method: "POST", body: input });
  }
  collection<T=unknown>(name:'skills'|'projects'|'publications'|'contributions'|'experience'|'education'|'evidence'|'changes',limit=20,offset=0){return this.request<{items:T[];total:number;offset:number;limit:number;nextOffset:number|null}>(name,{query:{limit,offset}});}
  search(query:string,kind?:string){return this.request('search',{query:{q:query,...(kind?{kind}:{})}});}
  graph(root?:string,depth=1){return this.request('graph',{query:{depth,...(root?{root}:{})}});}
  evidence(id:string,digest?:string){return this.request('evidence/verify',{query:{id,...(digest?{digest}:{})}});}
  match(requirements:string[]){return this.request('match',{method:'POST',body:{requirements,lang:this.lang}});}
  resume(){return this.request('resume');}
  citations(){return this.request('citations');}
  availability(){return this.request('availability');}
  health(){return this.request('health');}
  readiness(){return this.request('readiness');}
  submitInquiry(input:Parameters<AgentClient['prepareInquiry']>[0],idempotencyKey:string){return this.request('inquiries',{method:'POST',body:input,idempotencyKey});}

}
