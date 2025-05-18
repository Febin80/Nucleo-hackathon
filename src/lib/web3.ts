import { ethers } from 'ethers';
import DenunciaAnonima from '../contracts/DenunciaAnonima.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const getContract = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Por favor instala MetaMask');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, DenunciaAnonima.abi, signer);
};

export const crearDenuncia = async (tipoAcoso: string, ipfsHash: string) => {
  try {
    const contract = await getContract();
    const tx = await contract.crearDenuncia(tipoAcoso, ipfsHash);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Error al crear denuncia:', error);
    throw new Error('Error al crear denuncia en blockchain');
  }
};

export const obtenerDenuncia = async (id: number) => {
  try {
    const contract = await getContract();
    const denuncia = await contract.obtenerDenuncia(id);
    return denuncia;
  } catch (error) {
    console.error('Error al obtener denuncia:', error);
    throw new Error('Error al obtener denuncia de blockchain');
  }
};

export const obtenerDenunciasPorDenunciante = async (address: string) => {
  try {
    const contract = await getContract();
    const ids = await contract.obtenerDenunciasPorDenunciante(address);
    return ids;
  } catch (error) {
    console.error('Error al obtener denuncias del denunciante:', error);
    throw new Error('Error al obtener denuncias del denunciante');
  }
};

export const conectarWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Por favor instala MetaMask');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    console.error('Error al conectar wallet:', error);
    throw new Error('Error al conectar wallet');
  }
}; 