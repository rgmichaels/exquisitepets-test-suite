module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'src/support/**/*.ts',
      'src/steps/**/*.ts'
    ],
    paths: ['features/**/*.feature'],
    publishQuiet: true,
    format: ['progress', 'json:artifacts/cucumber-report.json'],
    worldParameters: {}
  }
};
