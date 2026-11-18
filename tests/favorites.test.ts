import assert from "node:assert/strict";
import { test } from "node:test";
import { groupProjects, readFavorites } from "../src/favorites";

test("starred projects keep their order, exclude unavailable projects, and tolerate invalid saved preferences", () => {
  const projects = ["a", "b", "c"].map((id) => ({
    id,
    name: id,
    url: "https://www.superconductor.com",
    workspace: { id: "w", name: "Workspace" },
  }));
  const saved = readFavorites('["c", "missing", "a", "c", null]');
  const { starred, other } = groupProjects(projects, saved);
  assert.deepEqual(
    starred.map((p) => p.id),
    ["c", "a"],
  );
  assert.deepEqual(
    other.map((p) => p.id),
    ["b"],
  );
  for (const invalid of [undefined, "broken", "{}"])
    assert.deepEqual(readFavorites(invalid), []);
});
