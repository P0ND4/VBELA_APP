export type UnitValue =
  | ""
  | "UND"
  | "KG"
  | "G"
  | "MG"
  | "OZ"
  | "LB"
  | "L"
  | "ML"
  | "GAL"
  | "PT"
  | "FL OZ";

export const unitOptions: { label: string; value: UnitValue }[] = [
  { label: "Unidad", value: "UND" },
  { label: "Kilogramo", value: "KG" },
  { label: "Gramo", value: "G" },
  { label: "Miligramo", value: "MG" },
  { label: "Onza", value: "OZ" },
  { label: "Libra", value: "LB" },
  { label: "Litro", value: "L" },
  { label: "Mililitro", value: "ML" },
  { label: "Galón", value: "GAL" },
  { label: "Pinta", value: "PT" },
  { label: "Onza fluida", value: "FL OZ" },
];
