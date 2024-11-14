import { Client, Databases, ID, Query } from "appwrite";

// Configurações do Appwrite
const APPWRITE_ENDPOINT = 'https://appwrite-backend.felvieira.com.br/v1';
const APPWRITE_PROJECT_ID = '67336cb10029a804c3d5';
const APPWRITE_API_KEY = '63c62c9c205f389ebfb185d974702f71afd9a7bdbbbe45c0713558076dfda6c5d82d82c7cc6cb288f872ba277de7afc6373ee4bfcd0ec62166d8216e7000e9a8e0111003b68e416338986e02af386e3ad5a16e21e67f353a222cd89ef09d5581b84d08e634e22c0a7c44b062ebca3b46e1472676f92598ff9b092f7909accc44';

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// No cliente, usamos setSession() para autenticação
// Não precisamos da API key no cliente, ela só é usada no servidor
const databases = new Databases(client);

// Funções de licença e serial
export const generateSerial = (email) => {
    return `VRG-${ID.unique().split('-')[0].toUpperCase()}`;
};

export const createLicense = async (email, paymentId) => {
    const serial = generateSerial(email);
    
    return await databases.createDocument(
        'video_reels_db',
        'licenses',
        ID.unique(),
        {
            email,
            serial,
            paymentId,
            createdAt: new Date().toISOString(),
            active: true
        }
    );
};

export const verifyLicense = async (email, serial) => {
    try {
        const response = await databases.listDocuments(
            'video_reels_db',
            'licenses',
            [
                Query.equal('email', email),
                Query.equal('serial', serial),
                Query.equal('active', true)
            ]
        );

        return response.documents.length > 0;
    } catch (error) {
        console.error('Erro ao verificar licença:', error);
        return false;
    }
};

export const deactivateLicense = async (email, serial) => {
    try {
        const response = await databases.listDocuments(
            'video_reels_db',
            'licenses',
            [
                Query.equal('email', email),
                Query.equal('serial', serial)
            ]
        );

        if (response.documents.length > 0) {
            const license = response.documents[0];
            return await databases.updateDocument(
                'video_reels_db',
                'licenses',
                license.$id,
                {
                    active: false
                }
            );
        }

        throw new Error('Licença não encontrada');
    } catch (error) {
        console.error('Erro ao desativar licença:', error);
        throw error;
    }
};

export { client, databases, Query }; 