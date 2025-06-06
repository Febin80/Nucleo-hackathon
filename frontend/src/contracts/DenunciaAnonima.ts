import { AbiItem } from 'web3-utils'

export const DenunciaAnonimaABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "denunciante", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "tipoAcoso", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "indexed": false, "internalType": "bytes", "name": "proof", "type": "bytes" },
      { "indexed": false, "internalType": "uint256[]", "name": "publicSignals", "type": "uint256[]" }
    ],
    "name": "DenunciaCreada",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_tipoAcoso", "type": "string" },
      { "internalType": "string", "name": "_ipfsHash", "type": "string" },
      { "internalType": "bytes", "name": "_proof", "type": "bytes" },
      { "internalType": "uint256[]", "name": "_publicSignals", "type": "uint256[]" }
    ],
    "name": "crearDenuncia",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "denuncias",
    "outputs": [
      { "internalType": "address", "name": "denunciante", "type": "address" },
      { "internalType": "string", "name": "tipoAcoso", "type": "string" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "proof", "type": "bytes" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "denunciasPorDenunciante",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
          { "internalType": "uint256[]", "name": "publicSignals", "type": "uint256[]" }
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
    "inputs": [
      { "internalType": "address", "name": "_denunciante", "type": "address" }
    ],
    "name": "obtenerDenunciasPorDenunciante",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
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