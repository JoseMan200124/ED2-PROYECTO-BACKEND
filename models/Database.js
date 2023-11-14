const Huffman = require('./huffman');
const path = require('path');
const fs = require('fs'); // Importar el módulo 'fs'

class Database {
    constructor() {
        this.data = [];
        this.dpiHuffman = new Huffman();
        this.recommendationHuffman = new Huffman();
        this.companyHuffmans = {};
    }

    getCompanyHuffman(companyName) {
        if (!this.companyHuffmans[companyName]) {
            this.companyHuffmans[companyName] = new Huffman();
        }
        return this.companyHuffmans[companyName];
    }
    encodeDPI(dpi){
        return this.dpiHuffman.encode(dpi);
    }
    decodeDPI(encodedDPI){
        return this.dpiHuffman.decode(encodedDPI);
    }

    search(k) {
        const keyLower = k.toLowerCase();

        const foundPerson = this.data.find(person => {
            const personKeyLower = person.dpi;

            return personKeyLower === keyLower;
        });

        return foundPerson;
    }

    insert(person) {
        const index = this.data.findIndex(p => p.key === person.key);

        // Codificando DPI usando Huffman para cada empresa
        const encodedCompanies = {};
        person.companies.forEach(company => {
            const huffman = this.getCompanyHuffman(company);
            const encodedDPI = huffman.encode(person.dpi);
            encodedCompanies[company] = encodedDPI;
        });

        person.companies = encodedCompanies;

        if (index !== -1) {
            this.data[index] = person;
        } else {
            this.data.push(person);
        }
    }

    displayByName(nameKey) {
        const person = this.data.find(p => p.key === nameKey);
        if (person) {

            Object.keys(person.companies).forEach(company => {

            });
        } else {
            console.log(`No se encontró a la persona con nombre clave: ${nameKey}`);
        }
    }
    displayRecommendations(dpi) {
        const person = this.search(dpi);
        if (person && person.recommendations.length > 0) {
            console.log(`Cartas de recomendación para ${person.name}:`);
            person.recommendationsDecoded.forEach((encodedRec, index) => {
                console.log(`Carta #${index + 1}:`);
                console.log(encodedRec);

            });
        } else {
            console.log(`No se encontraron cartas de recomendación para el DPI ${dpi}.`);
        }
    }
    displayConversations(dpi) {
        const person = this.search(dpi);
        if (person && person.conversations.length > 0) {
            console.log(`Conversaciones para ${person.name}:`);
            person.conversations.forEach((encryptedConv, index) => {
                console.log(`Conversación #${index + 1}:`);
                console.log(person.decryptConversation(encryptedConv));
            });
        } else {
            console.log(`No se encontraron conversaciones para el DPI ${dpi}.`);
        }
    }
    loadRecommendations(person) {
        let i = 1;
        while (true) {
            const filePath = path.join(__dirname, `inputs/cartas/REC-${person.dpi}-${i}.txt`);
            if (fs.existsSync(filePath)) {
                console.log("ESTE ES EL PATH DEL ARCHIVO ======");
                console.log(filePath);
                const content = fs.readFileSync(filePath, 'utf8');
                const normalizedContent = content.replace(/\r\n/g, '\n');
                console.log(normalizedContent);
                const encoded = this.recommendationHuffman.encode(normalizedContent);
                const decoded = this.recommendationHuffman.decode(encoded);
                console.log(person);
                person.recommendations.push(encoded);
                person.recommendationsDecoded.push(decoded);

                i++;
            } else {
                break;
            }
        }
        console.log(person);
    }
    loadConversations(person) {

        let i = 1;
        while (true) {

            const filePath = path.join(__dirname, `inputs/conversaciones/CONV-${person.dpi}-${i}.txt`);
            console.log("RUTAS DE CONVERSACIONES =======");
            console.log(filePath);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const encryptedContent = person.encryptConversation(content);
                person.conversations.push(encryptedContent);
                i++;
            } else {
                break;
            }
        }
    }

    delete(k) {
        const keyLower = k.toLowerCase();
        const index = this.data.findIndex(person => person.key.toLowerCase() === keyLower);
        if (index !== -1) {
            this.data.splice(index, 1);
        }
    }

    searchByName(name) {
        const nameLower = name.toLowerCase();
        return this.data.filter(person => person.name.toLowerCase() === nameLower);
    }


    toJSONL() {
        return this.data.map(person => JSON.stringify(person)).join('\n');
    }

}
module.exports = Database;