import { create } from 'ipfs-http-client';

const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const added = await client.add(file);
    return added.path;
  } catch (error) {
    console.error('Error al subir archivo a IPFS:', error);
    throw new Error('Error al subir archivo a IPFS');
  }
};

export const uploadJSONToIPFS = async (data: any): Promise<string> => {
  try {
    const added = await client.add(JSON.stringify(data));
    return added.path;
  } catch (error) {
    console.error('Error al subir JSON a IPFS:', error);
    throw new Error('Error al subir JSON a IPFS');
  }
};

export const getFromIPFS = async (hash: string): Promise<any> => {
  try {
    const stream = client.cat(hash);
    let data = '';
    for await (const chunk of stream) {
      data += chunk.toString();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al obtener datos de IPFS:', error);
    throw new Error('Error al obtener datos de IPFS');
  }
}; 