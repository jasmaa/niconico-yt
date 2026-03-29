module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "html"],
};
