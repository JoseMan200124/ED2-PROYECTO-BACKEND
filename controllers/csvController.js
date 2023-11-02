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
            const person = new Person(data.name, data.dpi, data.datebirth, data.address);

            switch (row.operation) {
                case 'INSERT':
                    db.insert(person);
                    break;
                case 'DELETE':
                    db.delete(`${data.name}-${data.dpi}`);
                    break;
                case 'PATCH':
                    db.update(person);
                    break;
            }
        })
        .on('end', () => {
            console.log('Se procesaron todos los datos.');
            callback(db.data);
        });
};

exports.getConversationsByDPI = (req, res) => {
    const { dpi } = req.params;

    if (!dpi) {
        return res.status(400).send('No se proporcionó un DPI.');
    }

    const person = req.db.search(dpi);
    if (person && person.conversations.length > 0) {
        const decryptedConversations = person.conversations.map(encryptedConv => person.decryptConversation(encryptedConv));
        res.json(decryptedConversations);
    } else {
        res.status(404).send(`No se encontraron conversaciones para el DPI ${dpi}.`);
    }
};

exports.uploadCsv = (req, res) => {
    console.log("ENTREEEE");
    console.log(req.file);
    if (!req.file) {
        return res.status(400).send('No se proporcionó un archivo CSV.');
    }

    const db = new Database();
    req.db = db;

    processCsvFile(db, req.file.path, (finalData) => {
        fs.unlink(req.file.path, err => {
            if (err) console.error("Error al eliminar el archivo:", err);
        });

        res.json(finalData);
    });
}
