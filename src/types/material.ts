export interface MaterialProps {
  [key: string]: string;
}

export interface Material {
  name: string;
  density: number;
  profile: string;
  props: MaterialProps;
  archived?: boolean;
}

export type MatchStatus = "MEETS" | "CLOSE" | "NO";

export interface MatchDetail {
  label: string;
  required: number;
  actual: number | string;
  ok: boolean;
}

export interface MatchResult {
  score: number;
  status: MatchStatus;
  details: MatchDetail[];
}

export interface MaterialMatchResult extends MatchResult {
  mat: Material;
}

export interface MatchCriteria {
  tensile?: string;
  elong?: string;
  hdt?: string;
  izod?: string;
  modulus?: string;
  shore?: string;
}
