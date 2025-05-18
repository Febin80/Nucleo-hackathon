import { ethers } from "hardhat";

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Definida" : "No definida");

async function main() {
  console.log("Desplegando contrato DenunciaAnonima...");

  const DenunciaAnonima = await ethers.getContractFactory("DenunciaAnonima");
  const denunciaAnonima = await DenunciaAnonima.deploy();

  await denunciaAnonima.deployed();

  console.log("Contrato DenunciaAnonima desplegado en:", denunciaAnonima.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 