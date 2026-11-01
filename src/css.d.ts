// Permite importar archivos CSS como side-effects en TypeScript.
// Next.js procesa estos imports en build time; esta declaración
// suprime el error TS2882 del language server.
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
