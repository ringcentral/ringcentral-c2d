const gulp = require('gulp');
const path = require('path');
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
    path.resolve(__dirname, 'README.md'),
    path.resolve(__dirname, 'dist/README.md'),
  );
  await fs.copy(
    path.resolve(__dirname, 'lib/themes/theme.scss'),
    path.resolve(__dirname, 'dist/lib/themes/theme.scss'),
  );
  await fs.copy(
    path.resolve(__dirname, 'lib/RingCentralC2DWidget/styles.scss'),
    path.resolve(__dirname, 'dist/lib/RingCentralC2DWidget/styles.scss'),
  );
  await fs.copy(
    path.resolve(__dirname, 'lib/global.d.ts'),
    path.resolve(__dirname, 'dist/lib/global.d.ts'),
  );
  await fs.copy(
    path.resolve(__dirname, 'lib/icons/c2d.svg'),
    path.resolve(__dirname, 'dist/lib/icons/c2d.svg'),
  );
  await fs.copy(
    path.resolve(__dirname, 'lib/icons/c2sms.svg'),
    path.resolve(__dirname, 'dist/lib/icons/c2sms.svg'),
  );
  await fs.copy(
    path.resolve(__dirname, 'lib/icons/roundIcon.png'),
    path.resolve(__dirname, 'dist/lib/icons/roundIcon.png'),
  );
}

async function generatePackage() {
  const packageInfo = JSON.parse(
    await fs.readFile(path.resolve(__dirname, 'package.json')),
  );
  delete packageInfo.scripts;
  delete packageInfo.devDependencies;
  packageInfo.module = 'index.js';
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
