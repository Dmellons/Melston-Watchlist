// node-appwrite v27 parses API responses into null-prototype objects, which
// React's server->client component serializer rejects ("Only plain objects...
// can be passed to Client Components"). Round-trip SDK data through JSON to
// produce plain objects before it crosses that boundary.
export function toPlain<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}
