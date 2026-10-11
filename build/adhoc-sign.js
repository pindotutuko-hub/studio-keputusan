// Ad-hoc code signing for macOS builds without an Apple Developer ID.
// Unsigned Electron apps are rejected outright on recent macOS (Apple Silicon requires at least an
// ad-hoc signature; otherwise Gatekeeper/XProtect may report "Malware Blocked"). This hook signs the
// packed .app with an ad-hoc identity ("-") after packing, before the DMG is created.
const { execFileSync } = require('child_process');
const path = require('path');
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  console.log(`  • ad-hoc signing ${app}`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
  execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', app], { stdio: 'inherit' });
};
