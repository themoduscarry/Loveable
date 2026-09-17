/**
 * WebContainer manager for VBC AI Studio.
 *
 * Boots an in-browser Node.js runtime (via @webcontainer/api), writes a
 * Vite + React project template, installs deps, and starts the dev server.
 * Also provides Code Guard Stage 3 support — runtime error detection via
 * the WebContainer's preview-message system.
 *
 * All runtime imports of @webcontainer/api are dynamic so this module
 * doesn't break SSR. Type-only imports are safe because they're erased
 * at compile time.
 */

import type {
  WebContainer as WebContainerInstance,
  FileSystemTree,
  PreviewMessage,
} from "@webcontainer/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { WebContainerInstance, FileSystemTree };

/** The phases a container goes through while booting. */
export type ContainerPhase =
  | "booting"
  | "installing"
  | "starting"
  | "running"
  | "error";

/** A runtime error detected by Code Guard Stage 3. */
export type RuntimeError = {
  type: "uncaught-exception" | "unhandled-rejection" | "console-error";
  message: string;
  stack?: string;
};

/** Callbacks emitted during the boot lifecycle. */
export type BootCallbacks = {
  onPhase: (phase: ContainerPhase) => void;
  onUrl: (url: string) => void;
  onRuntimeError: (errors: RuntimeError[]) => void;
};

// ---------------------------------------------------------------------------
// Boot & start
// ---------------------------------------------------------------------------

/**
 * Boots a WebContainer, writes the project template, installs deps, and
 * starts the dev server. Returns the running container instance.
 *
 * Call this once when the workspace mounts. The callbacks fire as the
 * container moves through its lifecycle phases.
 */
export async function bootAndStart(
  template: FileSystemTree,
  callbacks: BootCallbacks,
): Promise<WebContainerInstance> {
  // Dynamic import — @webcontainer/api is browser-only.
  const { WebContainer } = await import("@webcontainer/api");

  callbacks.onPhase("booting");

  // COOP has no boot-time equivalent — it's set via the response headers
  // on the page itself (see next.config.ts), not here.
  const container = await WebContainer.boot({
    coep: "credentialless",
    forwardPreviewErrors: true,
  });

  // Mount the entire project tree at once (faster than writing files
  // one by one for the initial setup).
  await container.mount(template);

  // When the dev server is listening, hand the URL back to the caller.
  container.on("server-ready", (_port, url) => {
    callbacks.onUrl(url);
    callbacks.onPhase("running");
  });

  // Code Guard Stage 3: listen for runtime errors in the preview.
  // The `forwardPreviewErrors: true` boot option makes the container
  // forward console-error / uncaught-exception / unhandled-rejection
  // events from the preview iframe.
  const runtimeErrors: RuntimeError[] = [];
  container.on("preview-message", (message: PreviewMessage) => {
    const error = toRuntimeError(message);
    if (error) {
      runtimeErrors.push(error);
      callbacks.onRuntimeError([...runtimeErrors]);
    }
  });

  // Install dependencies.
  callbacks.onPhase("installing");
  const installProcess = await container.spawn("npm", ["install"]);
  const installExitCode = await installProcess.exit;

  if (installExitCode !== 0) {
    callbacks.onPhase("error");
    throw new Error(`npm install exited with code ${installExitCode}`);
  }

  // Start the Vite dev server (runs in the background — we hear about
  // it via the server-ready event registered above).
  callbacks.onPhase("starting");
  await container.spawn("npm", ["run", "dev"]);

  return container;
}


// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

/**
 * Write or update a single file in the WebContainer filesystem.
 * Creates intermediate directories as needed.
 */
export async function writeFile(
  container: WebContainerInstance,
  filePath: string,
  content: string,
): Promise<void> {
  const segments = filePath.split("/");
  if (segments.length > 1) {
    const dir = segments.slice(0, -1).join("/");
    try {
      await container.fs.mkdir(dir, { recursive: true });
    } catch {
      // Directory already exists — not an error.
    }
  }
  await container.fs.writeFile(filePath, content);
}

/**
 * Read a file from the WebContainer filesystem. Returns null if the
 * file doesn't exist.
 */
export async function readFile(
  container: WebContainerInstance,
  filePath: string,
): Promise<string | null> {
  try {
    return await container.fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Code Guard Stage 3: runtime error helpers
// ---------------------------------------------------------------------------

/**
 * Preview message type string literals, matching @webcontainer/api's
 * `PreviewMessageType` enum values. Written out as literals (rather than
 * importing the enum) so this module's only import from @webcontainer/api
 * stays type-only — the dynamic import in bootAndStart is the sole place
 * that touches the browser-only runtime.
 */
const PREVIEW_UNCAUGHT_EXCEPTION = "PREVIEW_UNCAUGHT_EXCEPTION";
const PREVIEW_UNHANDLED_REJECTION = "PREVIEW_UNHANDLED_REJECTION";
const PREVIEW_CONSOLE_ERROR = "PREVIEW_CONSOLE_ERROR";

/**
 * Convert a WebContainer PreviewMessage into a RuntimeError if it's an
 * error variant. Non-error messages are ignored and return null.
 */
function toRuntimeError(message: PreviewMessage): RuntimeError | null {
  switch (message.type) {
    case PREVIEW_UNCAUGHT_EXCEPTION:
      return {
        type: "uncaught-exception",
        message: message.message ?? "Uncaught exception",
        stack: message.stack ?? undefined,
      };
    case PREVIEW_UNHANDLED_REJECTION:
      return {
        type: "unhandled-rejection",
        message: message.message ?? "Unhandled rejection",
        stack: message.stack ?? undefined,
      };
    case PREVIEW_CONSOLE_ERROR:
      return {
        type: "console-error",
        message: Array.isArray(message.args) ? message.args.join(" ") : "Console error",
        stack: message.stack ?? undefined,
      };
    default:
      return null;
  }
}

/**
 * Check whether the current browser supports WebContainer.
 * WebContainer requires SharedArrayBuffer, which in turn requires
 * COOP/COEP headers on the page.
 */
export function isWebContainerSupported(): boolean {
  return typeof SharedArrayBuffer !== "undefined";
}

// ---------------------------------------------------------------------------
// Vite + React project template
// ---------------------------------------------------------------------------

/**
 * The file tree that gets mounted into the WebContainer on boot.
 * This is a minimal Vite + React + TypeScript project. The user's
 * generated code replaces `src/App.tsx`.
 *
 * The `FileSystemTree` structure is a nested object where directories
 * are `{ directory: { ... } }` and files are `{ file: { contents } }`.
 */
export const VITE_PROJECT_TEMPLATE: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "vbc-studio-project",
          private: true,
          type: "module",
          scripts: {
            dev: "vite",
            build: "tsc && vite build",
          },
          dependencies: {
            react: "^19.0.0",
            "react-dom": "^19.0.0",
          },
          devDependencies: {
            "@types/react": "^19.0.0",
            "@types/react-dom": "^19.0.0",
            "@vitejs/plugin-react": "^4.0.0",
            typescript: "^5.0.0",
            vite: "^6.0.0",
          },
        },
        null,
        2,
      ),
    },
  },
  "vite.config.ts": {
    file: {
      contents: [
        `import { defineConfig } from "vite";`,
        `import react from "@vitejs/plugin-react";`,
        ``,
        `export default defineConfig({`,
        `  plugins: [react()],`,
        `  server: { port: 5173, host: true },`,
        `});`,
      ].join("\n"),
    },
  },
  "tsconfig.json": {
    file: {
      contents: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            lib: ["ES2020", "DOM", "DOM.Iterable"],
            module: "ESNext",
            moduleResolution: "bundler",
            jsx: "react-jsx",
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            esModuleInterop: true,
          },
          include: ["src"],
        },
        null,
        2,
      ),
    },
  },
  "index.html": {
    file: {
      contents: [
        `<!DOCTYPE html>`,
        `<html lang="en">`,
        `  <head>`,
        `    <meta charset="UTF-8" />`,
        `    <meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
        `    <title>VBC AI Studio Preview</title>`,
        `  </head>`,
        `  <body>`,
        `    <div id="root"></div>`,
        `    <script type="module" src="/src/main.tsx"></script>`,
        `  </body>`,
        `</html>`,
      ].join("\n"),
    },
  },
  src: {
    directory: {
      "main.tsx": {
        file: {
          contents: [
            `import React from "react";`,
            `import ReactDOM from "react-dom/client";`,
            `import App from "./App";`,
            `import "./index.css";`,
            ``,
            `ReactDOM.createRoot(document.getElementById("root")!).render(`,
            `  <React.StrictMode>`,
            `    <App />`,
            `  </React.StrictMode>,`,
            `);`,
          ].join("\n"),
        },
      },
      "App.tsx": {
        file: {
          contents: [
            `export default function App() {`,
            `  return (`,
            `    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>`,
            `      <h1>Hello from VBC AI Studio</h1>`,
            `      <p>Start by describing a change in the prompt below.</p>`,
            `    </main>`,
            `  );`,
            `}`,
          ].join("\n"),
        },
      },
      "index.css": {
        file: {
          contents: [
            `*,`,
            `*::before,`,
            `*::after {`,
            `  box-sizing: border-box;`,
            `}`,
            ``,
            `body {`,
            `  margin: 0;`,
            `  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,`,
            `    sans-serif;`,
            `  -webkit-font-smoothing: antialiased;`,
            `}`,
          ].join("\n"),
        },
      },
    },
  },
};

