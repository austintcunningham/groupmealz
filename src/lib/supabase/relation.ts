type NamedRelation = { name: string } | { name: string }[] | null | undefined;

export function getRelationName(relation: NamedRelation): string | undefined {
  if (!relation) return undefined;
  if (Array.isArray(relation)) return relation[0]?.name;
  return relation.name;
}
