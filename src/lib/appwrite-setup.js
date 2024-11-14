const axios = require('axios');
require('dotenv').config();

const api = axios.create({
    baseURL: process.env.APPWRITE_ENDPOINT,
    headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
        'Content-Type': 'application/json'
    }
});

const setup = async () => {
    try {
        console.log('Criando collection licenses...');
        
        // Criar collection
        const collection = await api.post(`/databases/${process.env.APPWRITE_DATABASE_ID}/collections`, {
            collectionId: process.env.APPWRITE_COLLECTION_ID,
            name: 'Licenses',
            permissions: [
                "create(\"any\")",
                "read(\"any\")",
                "update(\"any\")",
                "delete(\"any\")"
            ]
        });
        
        console.log('Collection criada:', collection.data);

        // Criar atributos
        console.log('Criando atributos...');
        
        const attributes = [
            {
                key: 'email',
                type: 'string',
                size: 255,
                required: true
            },
            {
                key: 'serial',
                type: 'string',
                size: 255,
                required: true
            },
            {
                key: 'paymentId',
                type: 'string',
                size: 255,
                required: true
            },
            {
                key: 'createdAt',
                type: 'datetime',
                required: true
            },
            {
                key: 'active',
                type: 'boolean',
                required: true
            }
        ];

        for (const attr of attributes) {
            console.log(`Criando atributo ${attr.key}...`);
            if (attr.type === 'boolean') {
                await api.post(`/databases/${process.env.APPWRITE_DATABASE_ID}/collections/licenses/attributes/boolean`, {
                    key: attr.key,
                    required: attr.required
                });
            } else {
                await api.post(`/databases/${process.env.APPWRITE_DATABASE_ID}/collections/licenses/attributes/${attr.type}`, {
                    key: attr.key,
                    size: attr.size,
                    required: attr.required
                });
            }
        }

        // Criar índices
        console.log('Criando índices...');
        
        const indexes = [
            {
                key: 'email_index',
                type: 'key',
                attributes: ['email'],
                orders: ['ASC']
            },
            {
                key: 'serial_index',
                type: 'key',
                attributes: ['serial'],
                orders: ['ASC']
            },
            {
                key: 'active_index',
                type: 'key',
                attributes: ['active'],
                orders: ['ASC']
            }
        ];

        for (const index of indexes) {
            console.log(`Criando índice ${index.key}...`);
            await api.post(`/databases/${process.env.APPWRITE_DATABASE_ID}/collections/licenses/indexes`, {
                key: index.key,
                type: index.type,
                attributes: index.attributes,
                orders: index.orders
            });
        }

        console.log('Setup concluído com sucesso!');

    } catch (error) {
        console.error('Erro durante o setup:', error);
        if (error.response) {
            console.error('Detalhes do erro:', error.response.data);
        }
    }
};

setup();
