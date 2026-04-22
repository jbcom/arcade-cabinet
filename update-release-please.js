const fs = require("node:fs");

const pkgs = [
  "apps/docs",
  "apps/cosmic-gardener",
  "apps/bioluminescent-sea",
  "apps/protocol-snw",
  "apps/titan-mech",
  "apps/enchanted-forest",
  "apps/voxel-realms",
  "apps/realmwalker",
  "apps/reach-for-the-sky",
  "apps/primordial-ascent",
  "packages/cosmic-gardener",
  "packages/bioluminescent-sea",
  "packages/gridizen",
  "packages/protocol-snw",
  "packages/entropy-edge",
  "packages/titan-mech",
  "packages/enchanted-forest",
  "packages/otterly-chaotic",
  "packages/voxel-realms",
  "packages/shared",
  "packages/sim-soviet",
  "packages/realmwalker",
  "packages/reach-for-the-sky",
  "packages/mega-track",
  "packages/primordial-ascent",
];

const config = {
  packages: {},
};
const manifest = {};

for (const pkg of pkgs) {
  config.packages[pkg] = {
    "release-type": "node",
    "changelog-path": "CHANGELOG.md",
  };
  manifest[pkg] = "0.1.0";
}
manifest["."] = "0.1.0"; // root

fs.writeFileSync("release-please-config.json", JSON.stringify(config, null, 2));
fs.writeFileSync(".release-please-manifest.json", JSON.stringify(manifest, null, 2));
