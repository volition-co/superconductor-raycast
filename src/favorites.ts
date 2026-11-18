import type { Project } from "./api";

export function readFavorites(saved: string | undefined): string[] {
  try {
    const value: unknown = JSON.parse(saved ?? "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string"))]
      : [];
  } catch {
    return [];
  }
}

export function groupProjects(projects: Project[], favorites: string[]) {
  return {
    starred: favorites.flatMap(
      (id) => projects.find((project) => project.id === id) ?? [],
    ),
    other: projects.filter((project) => !favorites.includes(project.id)),
  };
}
