import { databases, Query } from "@/lib/appwrite";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email } = req.body;

    try {
        // Buscar licença mais recente do usuário
        const response = await databases.listDocuments(
            'video_reels_db',
            'licenses',
            [
                Query.equal('email', email),
                Query.orderDesc('createdAt'),
                Query.limit(1)
            ]
        );

        if (response.documents.length > 0) {
            const license = response.documents[0];
            
            // Se encontrou uma licença ativa
            if (license.active) {
                return res.status(200).json({
                    status: 'success',
                    serial: license.serial
                });
            }
        }

        // Se não encontrou licença ativa
        return res.status(200).json({
            status: 'pending'
        });

    } catch (error) {
        console.error('Erro ao verificar licença:', error);
        return res.status(500).json({
            status: 'failed',
            error: error.message
        });
    }
}
