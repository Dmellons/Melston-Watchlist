// Runs once when the Next.js server boots.
export async function register() {
    // The Appwrite server (1.9.0) sends an x-appwrite-warning header on every
    // response because the node-appwrite SDK targets 1.9.5, and the SDK prints
    // it via console.warn — flooding the service journal. No 27.x SDK targets
    // 1.9.0 exactly, so filter this one known-benign message until the server
    // is upgraded to 1.9.5 (then this filter matches nothing and can be removed).
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Please downgrade your SDK to match the Appwrite version')
        ) {
            return;
        }
        originalWarn(...args);
    };
}
