import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import {
  initAllowedPaths,
  addAllowedPath,
  isPathAllowed,
  validatePath,
  getAllowedPaths,
} from "../src/security";

describe("security.ts", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("initAllowedPaths", () => {
    it("should initialize from ALLOWED_PROJECT_DIRS environment variable", () => {
      process.env.ALLOWED_PROJECT_DIRS = "/path/one,/path/two,/path/three";

      initAllowedPaths();

      const allowed = getAllowedPaths();
      expect(allowed).toContain(path.resolve("/path/one"));
      expect(allowed).toContain(path.resolve("/path/two"));
      expect(allowed).toContain(path.resolve("/path/three"));
    });

    it("should trim whitespace from paths", () => {
      process.env.ALLOWED_PROJECT_DIRS = " /path/one , /path/two , /path/three ";

      initAllowedPaths();

      const allowed = getAllowedPaths();
      expect(allowed).toContain(path.resolve("/path/one"));
      expect(allowed).toContain(path.resolve("/path/two"));
      expect(allowed).toContain(path.resolve("/path/three"));
    });

    it("should skip empty paths", () => {
      process.env.ALLOWED_PROJECT_DIRS = "/path/one,,/path/two,  ,/path/three";

      initAllowedPaths();

      const allowed = getAllowedPaths();
      expect(allowed.length).toBeLessThanOrEqual(3);
      expect(allowed).toContain(path.resolve("/path/one"));
    });

    it("should initialize from DATA_DIR environment variable", () => {
      process.env.DATA_DIR = "/data/directory";

      initAllowedPaths();

      const allowed = getAllowedPaths();
      expect(allowed).toContain(path.resolve("/data/directory"));
    });

    it("should initialize from WORKSPACE_DIR environment variable", () => {
      process.env.WORKSPACE_DIR = "/workspace/directory";

      initAllowedPaths();

      const allowed = getAllowedPaths();
      expect(allowed).toContain(path.resolve("/workspace/directory"));
    });

    it("should handle all environment variables together", () => {
      process.env.ALLOWED_PROJECT_DIRS = "/projects/one,/projects/two";
      process.env.DATA_DIR = "/app/data";
      process.env.WORKSPACE_DIR = "/app/workspace";

      initAllowedPaths();

      const allowed = getAllowedPaths();
      expect(allowed).toContain(path.resolve("/projects/one"));
      expect(allowed).toContain(path.resolve("/projects/two"));
      expect(allowed).toContain(path.resolve("/app/data"));
      expect(allowed).toContain(path.resolve("/app/workspace"));
    });

    it("should handle missing environment variables gracefully", () => {
      delete process.env.ALLOWED_PROJECT_DIRS;
      delete process.env.DATA_DIR;
      delete process.env.WORKSPACE_DIR;

      expect(() => initAllowedPaths()).not.toThrow();
    });
  });

  describe("addAllowedPath", () => {
    it("should add a path to allowed list", () => {
      const testPath = "/new/allowed/path";

      addAllowedPath(testPath);

      const allowed = getAllowedPaths();
      expect(allowed).toContain(path.resolve(testPath));
    });

    it("should resolve relative paths to absolute", () => {
      const relativePath = "relative/path";

      addAllowedPath(relativePath);

      const allowed = getAllowedPaths();
      expect(allowed).toContain(path.resolve(relativePath));
    });

    it("should handle duplicate paths", () => {
      const testPath = "/duplicate/path";

      addAllowedPath(testPath);
      addAllowedPath(testPath);

      const allowed = getAllowedPaths();
      const count = allowed.filter((p) => p === path.resolve(testPath)).length;
      expect(count).toBe(1);
    });
  });

  describe("isPathAllowed", () => {
    it("should always return true (all paths allowed)", () => {
      expect(isPathAllowed("/any/path")).toBe(true);
      expect(isPathAllowed("/another/path")).toBe(true);
      expect(isPathAllowed("relative/path")).toBe(true);
      expect(isPathAllowed("/etc/passwd")).toBe(true);
      expect(isPathAllowed("../../../dangerous/path")).toBe(true);
    });

    it("should return true even for non-existent paths", () => {
      expect(isPathAllowed("/nonexistent/path/12345")).toBe(true);
    });

    it("should return true for empty string", () => {
      expect(isPathAllowed("")).toBe(true);
    });
  });

  describe("validatePath", () => {
    it("should resolve absolute paths", () => {
      const absPath = "/absolute/path/to/file.txt";
      const result = validatePath(absPath);
      expect(result).toBe(path.resolve(absPath));
    });

    it("should resolve relative paths", () => {
      const relPath = "relative/path/file.txt";
      const result = validatePath(relPath);
      expect(result).toBe(path.resolve(relPath));
    });

    it("should handle current directory", () => {
      const result = validatePath(".");
      expect(result).toBe(path.resolve("."));
    });

    it("should handle parent directory", () => {
      const result = validatePath("..");
      expect(result).toBe(path.resolve(".."));
    });

    it("should handle complex relative paths", () => {
      const complexPath = "../../some/nested/../path/./file.txt";
      const result = validatePath(complexPath);
      expect(result).toBe(path.resolve(complexPath));
    });

    it("should handle paths with spaces", () => {
      const pathWithSpaces = "/path with spaces/file.txt";
      const result = validatePath(pathWithSpaces);
      expect(result).toBe(path.resolve(pathWithSpaces));
    });

    it("should handle home directory expansion on Unix", () => {
      if (process.platform !== "win32") {
        const homePath = "~/documents/file.txt";
        const result = validatePath(homePath);
        expect(result).toBe(path.resolve(homePath));
      }
    });
  });

  describe("getAllowedPaths", () => {
    it("should return empty array initially", () => {
      const allowed = getAllowedPaths();
      expect(Array.isArray(allowed)).toBe(true);
    });

    it("should return array of added paths", () => {
      addAllowedPath("/path/one");
      addAllowedPath("/path/two");

      const allowed = getAllowedPaths();
      expect(allowed).toContain(path.resolve("/path/one"));
      expect(allowed).toContain(path.resolve("/path/two"));
    });

    it("should return copy of internal set", () => {
      addAllowedPath("/test/path");

      const allowed1 = getAllowedPaths();
      const allowed2 = getAllowedPaths();

      expect(allowed1).not.toBe(allowed2);
      expect(allowed1).toEqual(allowed2);
    });
  });

  describe("Path security disabled behavior", () => {
    it("should allow unrestricted access despite allowed paths list", () => {
      process.env.ALLOWED_PROJECT_DIRS = "/only/this/path";
      initAllowedPaths();

      // Should return true even for paths not in allowed list
      expect(isPathAllowed("/some/other/path")).toBe(true);
      expect(isPathAllowed("/completely/different/path")).toBe(true);
    });

    it("should validate paths without permission checks", () => {
      process.env.ALLOWED_PROJECT_DIRS = "/only/this/path";
      initAllowedPaths();

      // Should validate any path without throwing
      expect(() => validatePath("/some/other/path")).not.toThrow();
      expect(validatePath("/some/other/path")).toBe(
        path.resolve("/some/other/path")
      );
    });
  });
});
