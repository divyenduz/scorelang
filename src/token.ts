const tokens = {
  UNDEFINED: "UNDEFINED" as const,

  TEAM_NAME: "TEAM_NAME" as const,
  TEAM_SCORE: "TEAM_SCORE" as const,
  SCORE_SEPARATOR: "-" as const,
  GAME_SEPARATOR: ";" as const,
  ILLEGAL: "ILLEGAL" as const,
  EOF: "EOF" as const,
};

export type Token = {
  type: keyof typeof tokens;
  value: string;
};

export { tokens };
