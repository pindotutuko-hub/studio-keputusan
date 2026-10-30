// Ad-hoc code signing for macOS builds without an Apple Developer ID.
// Unsigned Electron apps are rejected outright on recent macOS (Apple Silicon requires at least an
// ad-hoc signature; otherwise Gatekeeper/XProtect may report "Malware Blocked"). This hook signs the
// packed .app with an ad-hoc identity ("-") after packing, before the DMG is created.
const { execFileSync } = require('child_process');
const path = require('path');
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;
  // Universal builds pack x64 and arm64 into "*-temp" folders first and merge them afterwards.
  // Signing those intermediates makes the merge fail (their _CodeSignature differs), so only sign
  // the final app.
  if (/-temp$/.test(context.appOutDir)) { console.log(`  • skip ad-hoc signing of intermediate ${context.appOutDir}`); return; }
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  console.log(`  • ad-hoc signing ${app}`);
  // Files downloaded by npm may carry macOS provenance/resource-fork metadata. It is not part of
  // the application and makes codesign reject an otherwise valid bundle.
  execFileSync('xattr', ['-cr', app], { stdio: 'inherit' });
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
  execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', app], { stdio: 'inherit' });
};
