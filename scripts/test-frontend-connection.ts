import { ethers } from "hardhat";

async function main() {
  console.log("Probando conexión del frontend...");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Simular lo que hace el frontend
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  const DenunciaAnonimaABI = [
    {
      "inputs": [
        { "internalType": "uint256", "name": "_denunciaId", "type": "uint256" }
      ],
      "name": "obtenerDenuncia",
      "outputs": [
        {
          "components": [
            { "internalType": "address", "name": "denunciante", "type": "address" },
            { "internalType": "string", "name": "tipoAcoso", "type": "string" },
            { "internalType": "string", "name": "ipfsHash", "type": "string" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "internalType": "bytes", "name": "proof", "type": "bytes" },
            { "internalType": "uint256[]", "name": "publicSignals", "type": "uint256[]" },
            { "internalType": "bool", "name": "esPublica", "type": "bool" }
          ],
          "internalType": "struct DenunciaAnonima.Denuncia",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalDenuncias",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const contract = new ethers.Contract(contractAddress, DenunciaAnonimaABI, provider);

  try {
    console.log("Obteniendo total de denuncias...");
    const total = await contract.totalDenuncias();
    console.log(`Total: ${total}`);

    if (Number(total) > 0) {
      console.log("Obteniendo primera denuncia...");
      const denuncia = await contract.obtenerDenuncia(0);
      console.log("Denuncia obtenida:", {
        denunciante: denuncia.denunciante,
        tipoAcoso: denuncia.tipoAcoso,
        ipfsHash: denuncia.ipfsHash,
        timestamp: new Date(Number(denuncia.timestamp) * 1000).toLocaleString(),
        esPublica: denuncia.esPublica
      });
    }

    console.log("✅ El frontend debería poder conectarse correctamente");
  } catch (error) {
    console.error("❌ Error al conectar:", error);
  }
}

main().catch(console.error);