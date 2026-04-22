import fs from "node:fs";

const pkgs = [
  "apps/docs",
  "apps/bioluminescent-sea",
  "apps/cosmic-gardener",
  "apps/enchanted-forest",
  "apps/entropy-edge",
  "apps/gridizen",
  "apps/mega-track",
  "apps/otterly-chaotic",
  "apps/primordial-ascent",
  "apps/protocol-snw",
  "apps/reach-for-the-sky",
  "apps/realmwalker",
  "apps/sim-soviet",
  "apps/titan-mech",
  "apps/voxel-realms",
  "packages/bioluminescent-sea",
  "packages/cosmic-gardener",
  "packages/enchanted-forest",
  "packages/entropy-edge",
  "packages/gridizen",
  "packages/mega-track",
  "packages/otterly-chaotic",
  "packages/primordial-ascent",
  "packages/protocol-snw",
  "packages/reach-for-the-sky",
  "packages/realmwalker",
  "packages/shared",
  "packages/sim-soviet",
  "packages/titan-mech",
  "packages/voxel-realms",
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

fs.writeFileSync("release-please-config.json", `${JSON.stringify(config, null, 2)}\n`);
fs.writeFileSync(".release-please-manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
