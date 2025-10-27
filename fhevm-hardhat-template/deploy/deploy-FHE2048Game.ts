import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFHE2048Game: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("FHE2048Game", {
    from: deployer,
    log: true,
  });

  console.log(`FHE2048Game contract deployed at: ${deployed.address}`);
};

export default deployFHE2048Game;
deployFHE2048Game.tags = ["FHE2048Game"];

