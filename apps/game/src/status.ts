export const STATUS = {
  installed: true,
  app: true,
  simulationHeadless: true,
  inputAdapters: true,
  ci: false
} as const;

export type StatusKey = keyof typeof STATUS;
