const fs = require('fs');
const csv = require('csv-parser');
const Database = require('../models/Database');
const Person  = require('../models/Person');

const processCsvFile = (db, filePath, callback) => {
    fs.createReadStream(filePath)
        .pipe(csv({
            separator: ';',
            headers: ['operation', 'data']
        }))
        .on('data', (row) => {
            if (!row.data) {
                console.error('Entrada mal formada encontrada:', row);
                return;
            }

            const data = JSON.parse(row.data);
            const person = new Person(data.name, data.dpi, data.datebirth, data.address, data.companies);

            switch (row.operation) {
                case 'INSERT':
                    db.insert(person);
                    break;
                case 'DELETE':
                    db.delete(`${data.name}-${data.dpi}`);
                    break;
                case 'PATCH':
                    db.insert(person);
                    break;
            }
        })
        .on('end', () => {
            callback(db.data);
        });
};


exports.getConversationsByDPI = (req, res) => {
    const db = req.db;
    const { dpi } = req.params;

    if (!dpi) {
        return res.status(400).send('No se proporcionó un DPI.');
    }

    const person = db.search(dpi);

    console.log("ESTA ES LA PERSONA QUE ENCONTRÓ ========");
    console.log(person);
    if (person && person.conversations.length > 0) {
        const decryptedConversations = person.conversations.map(encryptedConv => person.decryptConversation(encryptedConv));
        console.log("ESTA ES LA CONVERSACIÓN =====");
        console.log(decryptedConversations);
        res.json(decryptedConversations);
    } else {
        res.status(404).send(`No se encontraron conversaciones para el DPI ${dpi}.`);
    }
};

exports.uploadCsv = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se proporcionó un archivo CSV.');
    }

    const db = req.db;

    processCsvFile(db, req.file.path, async (finalData) => {
        try {
            await fs.promises.unlink(req.file.path);
        } catch (err) {
            console.error("Error al eliminar el archivo:", err);
            return res.status(500).send("Error interno del servidor");
        }
        try {
            console.log("ESTE ES EL DATA DE DB ======");
            console.log(db);
            for (const person of db.data) {
                console.log("ENTE A CARTAS =====");
                await db.loadRecommendations(person);
                await db.loadConversations(person);
            }
        } catch (err) {
            console.error("Error al cargar recomendaciones:", err);
            return res.status(500).send("Error interno del servidor");
        }

        res.json(finalData);
    });
}
