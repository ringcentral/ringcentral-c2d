const path = require('path');
const gulp = require('gulp');
const execa = require('execa');
const fs = require('fs-extra');

function runTSBuild() {
  return execa('yarn', ['tsc'], {
    stdio: 'inherit',
  });
}

function runWebpack() {
  return execa('yarn', ['webpack'], {
    stdio: 'inherit',
  });
}

function copyBuildFiles() {
  return fs.copy(
    path.resolve(__dirname, 'build/index.js'),
    path.resolve(__dirname, 'dist/build/index.js'),
  );
}

async function copyOtherFiles() {
  await fs.copy(
    path.resolve(__dirname, 'src/themes/theme.scss'),
    path.resolve(__dirname, 'dist/themes/theme.scss'),
  );
  await fs.copy(
    path.resolve(__dirname, 'src/widgets/BuiltinWidget/styles.scss'),
    path.resolve(__dirname, 'dist/widgets/BuiltinWidget/styles.scss'),
  );
  await fs.copy(
    path.resolve(__dirname, 'src/global.d.ts'),
    path.resolve(__dirname, 'dist/global.d.ts'),
  );
  await fs.copy(
    path.resolve(__dirname, 'README.md'),
    path.resolve(__dirname, 'dist/README.md'),
  );
  fs.cpSync(
    path.resolve(__dirname, 'src/assets/'),
    path.resolve(__dirname, 'dist/assets/'),
    { recursive: true },
  );
}

async function generatePackage() {
  const packageInfo = JSON.parse(
    await fs.readFile(path.resolve(__dirname, 'package.json')),
  );
  delete packageInfo.scripts;
  delete packageInfo.devDependencies;
  packageInfo.main = 'index.js';
  await fs.writeFile(
    path.resolve(__dirname, 'dist/package.json'),
    JSON.stringify(packageInfo, null, 2),
  );
}

gulp.task('release', async () => {
  await runWebpack();
  await runTSBuild();
  await copyBuildFiles();
  await copyOtherFiles();
  await generatePackage();
});
