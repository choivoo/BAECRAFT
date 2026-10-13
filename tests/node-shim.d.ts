// @types/node 없이 테스트·스크립트가 쓰는 최소 node:fs 선언
declare module 'node:fs' {
  export function readFileSync(path: string, enc: 'utf8'): string;
  export function readdirSync(path: string): string[];
  export function writeFileSync(path: string, data: string): void;
  export function mkdirSync(path: string, opts?: { recursive?: boolean }): void;
}
