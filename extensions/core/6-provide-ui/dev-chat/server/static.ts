import { join } from "node:path";

export const serveStatic = async (
  path: string,
  publicDir: string,
): Promise<Response> => {
  const filePath = path === "/" ? "/index.html" : path;
  const fullPath = join(publicDir, filePath);

  const file = Bun.file(fullPath);
  const exists = await file.exists();

  if (!exists) {
    return new Response("Not Found", { status: 404 });
  }

  if (filePath.endsWith(".ts")) {
    return transpileTypeScript(fullPath);
  }

  const contentType = getContentType(filePath);
  return new Response(file, {
    headers: { "Content-Type": contentType },
  });
};

const transpileTypeScript = async (fullPath: string): Promise<Response> => {
  const result = await Bun.build({
    entrypoints: [fullPath],
    target: "browser",
    format: "esm",
  });

  if (!result.success || result.outputs.length === 0) {
    const errors = result.logs.map((log) => log.message).join("\n");
    return new Response(`Build error:\n${errors}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const code = await result.outputs[0]?.text();
  return new Response(code, {
    headers: { "Content-Type": "application/javascript" },
  });
};

const getContentType = (path: string): string => {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".json")) return "application/json";
  return "application/octet-stream";
};
