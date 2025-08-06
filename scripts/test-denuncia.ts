import { ethers } from "hardhat";

async function main() {
  console.log("Creando denuncia de prueba...");

  // Obtener el contrato desplegado
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const DenunciaAnonima = await ethers.getContractFactory("DenunciaAnonima");
  const denunciaAnonima = DenunciaAnonima.attach(contractAddress);

  // Obtener signers
  const [owner, denunciante] = await ethers.getSigners();
  
  console.log("Owner:", owner.address);
  console.log("Denunciante:", denunciante.address);

  // Crear datos de prueba
  const tipoAcoso = "acoso_laboral";
  const ipfsHash = "QmTestHashDePrueba123456789";
  const proof = ethers.randomBytes(32);
  const publicSignals = [1, 2, 3];
  const esPublica = true;

  try {
    // Crear denuncia pública
    console.log("Creando denuncia pública...");
    const tx1 = await denunciaAnonima.connect(denunciante).crearDenuncia(
      tipoAcoso,
      ipfsHash,
      proof,
      publicSignals,
      esPublica
    );
    await tx1.wait();
    console.log("✅ Denuncia pública creada");

    // Crear denuncia privada
    console.log("Creando denuncia privada...");
    const tx2 = await denunciaAnonima.connect(denunciante).crearDenuncia(
      "acoso_sexual",
      "QmPrivateHashDePrueba987654321",
      proof,
      publicSignals,
      false // privada
    );
    await tx2.wait();
    console.log("✅ Denuncia privada creada");

    // Verificar totales
    const total = await denunciaAnonima.totalDenuncias();
    const totalPublicas = await denunciaAnonima.totalDenunciasPublicas();
    
    console.log(`\n📊 Estadísticas:`);
    console.log(`Total de denuncias: ${total}`);
    console.log(`Denuncias públicas: ${totalPublicas}`);
    console.log(`Denuncias privadas: ${Number(total) - Number(totalPublicas)}`);

    // Obtener denuncias
    console.log("\n📋 Obteniendo denuncias...");
    
    const denuncia0 = await denunciaAnonima.obtenerDenuncia(0);
    console.log("Denuncia 0 (pública):", {
      denunciante: denuncia0.denunciante,
      tipoAcoso: denuncia0.tipoAcoso,
      ipfsHash: denuncia0.ipfsHash,
      esPublica: denuncia0.esPublica
    });

    const denuncia1 = await denunciaAnonima.obtenerDenuncia(1);
    console.log("Denuncia 1 (privada):", {
      denunciante: denuncia1.denunciante,
      tipoAcoso: denuncia1.tipoAcoso,
      ipfsHash: denuncia1.ipfsHash,
      esPublica: denuncia1.esPublica
    });

    console.log("\n✅ Todas las pruebas completadas exitosamente");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});