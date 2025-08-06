import { ethers } from "hardhat";

console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Definida" : "No definida");

async function main() {
  console.log("Desplegando contrato DenunciaAnonima con funcionalidad de privacidad...");

  const DenunciaAnonima = await ethers.getContractFactory("DenunciaAnonima");
  const denunciaAnonima = await DenunciaAnonima.deploy();

  // Esperar a que se despliegue
  await denunciaAnonima.waitForDeployment();

  const contractAddress = await denunciaAnonima.getAddress();
  console.log("Contrato DenunciaAnonima desplegado en:", contractAddress);
  
  // Verificar que las nuevas funciones están disponibles
  console.log("Verificando funciones del contrato...");
  try {
    const total = await denunciaAnonima.totalDenuncias();
    console.log("✅ totalDenuncias() funciona. Total actual:", total.toString());
    
    const totalPublicas = await denunciaAnonima.totalDenunciasPublicas();
    console.log("✅ totalDenunciasPublicas() funciona. Total actual:", totalPublicas.toString());
    
    console.log("✅ Contrato desplegado correctamente con todas las funciones de privacidad");
  } catch (error) {
    console.error("❌ Error al verificar funciones del contrato:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 