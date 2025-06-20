const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DecentralizedWill = buildModule("DecentralizedWill", (m: any) => {
  const decentralizedWill = m.contract("DecentralizedWill");

  return { decentralizedWill };
});

module.exports = DecentralizedWill;
