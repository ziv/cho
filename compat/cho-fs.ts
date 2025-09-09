export interface ChoFs {
  // file system

  chmod(path: string | URL, mode: number | string): Promise<void>;
  chmodSync(path: string | URL, mode: number | string): void;

  chown(path: string | URL, uid: number | null, gid: number | null): Promise<void>;
  chownSync(path: string | URL, uid: number | null, gid: number | null): void;

  copyFile(
    fromPath: string | URL,
    toPath: string | URL,
  ): Promise<void>;

  copyFileSync(
    fromPath: string | URL,
    toPath: string | URL,
  ): void;

  create(path: string | URL): Promise<Deno.FsFile>;
  createSync(path: string | URL): Deno.FsFile;

  link(oldpath: string | URL, newpath: string | URL): Promise<void>;
  linkSync(oldpath: string | URL, newpath: string | URL): void;

  lstat(path: string | URL): Promise<Deno.FileInfo>;
  lstatSync(path: string | URL): Deno.FileInfo;

  makeTempDir(options?: Deno.MakeTempOptions): Promise<string>;
  makeTempDirSync(options?: Deno.MakeTempOptions): string;

  makeTempFile(options?: Deno.MakeTempOptions): Promise<string>;
  makeTempFileSync(options?: Deno.MakeTempOptions): string;

  mkdir(path: string | URL, options?: { recursive?: boolean; mode?: number }): Promise<void>;
  mkdirSync(path: string | URL, options?: { recursive?: boolean; mode?: number }): void;

  open(path: string | URL, options?: Deno.OpenOptions): Promise<Deno.FsFile>;
  openSync(path: string | URL, options?: Deno.OpenOptions): Deno.FsFile;

  readDir(path: string | URL): AsyncIterable<Deno.DirEntry>;
  readDirSync(path: string | URL): Iterable<Deno.DirEntry>;

  readFile(path: string | URL, options?: { signal?: AbortSignal }): Promise<Uint8Array>;
  readFileSync(path: string | URL): Uint8Array;

  readLink(path: string | URL): Promise<string>;
  readLinkSync(path: string | URL): string;

  readTextFile(path: string | URL, options?: { signal?: AbortSignal }): Promise<string>;
  readTextFileSync(path: string | URL): string;

  realPath(path: string | URL): Promise<string>;
  realPathSync(path: string | URL): string;

  remove(path: string | URL, options?: { recursive?: boolean }): Promise<void>;
  removeSync(path: string | URL, options?: { recursive?: boolean }): void;

  rename(oldpath: string | URL, newpath: string | URL): Promise<void>;
  renameSync(oldpath: string | URL, newpath: string | URL): void;

  stat(path: string | URL): Promise<Deno.FileInfo>;
  statSync(path: string | URL): Deno.FileInfo;

  symlink(
    oldpath: string | URL,
    newpath: string | URL,
    options?: { type?: "file" | "dir" },
  ): Promise<void>;
  symlinkSync(
    oldpath: string | URL,
    newpath: string | URL,
    options?: { type?: "file" | "dir" },
  ): void;

  truncate(name: string, len?: number): Promise<void>;
  truncateSync(name: string, len?: number): void;

  // TODO: umask

  utime(path: string | URL, atime: number | Date, mtime: number | Date): Promise<void>;
  utimeSync(path: string | URL, atime: number | Date, mtime: number | Date): void;

  watchFs(
    paths: string | string[],
    options?: { recursive?: boolean },
  ): AsyncIterable<Deno.FsEvent>;

  writeFile(
    path: string | URL,
    data: Uint8Array | ReadableStream<Uint8Array>,
    options?: Deno.WriteFileOptions,
  ): Promise<void>;
  writeFileSync(path: string | URL, data: Uint8Array, options?: Deno.WriteFileOptions): void;

  writeTextFile(
    path: string | URL,
    data: string | ReadableStream<string>,
    options?: Deno.WriteFileOptions,
  ): Promise<void>;
  writeTextFileSync(path: string | URL, data: string, options?: Deno.WriteFileOptions): void;
}
