class Person {
    constructor(name, dpi, dateBirth, address, companies = {}) {
        this.name = name;
        this.dpi = dpi;
        this.dateBirth = dateBirth;
        this.address = address;
        this.companies = companies;
        this.key = `${name.toLowerCase()}-${dpi}`;
        this.recommendations = [];
        this.recommendationsDecoded = [];
        this.conversations = [];
    }
    encryptConversation(conversation) {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(conversation);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }


    decryptConversation(encryptedData) {
        let parts = encryptedData.split(':');
        let iv = Buffer.from(parts.shift(), 'hex');
        let encryptedText = Buffer.from(parts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY2, 'hex'), iv);
        console.log(decipher);
        let decrypted = decipher.update(encryptedText);
        console.log(decrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        console.log(decrypted);
        return decrypted.toString();
    }

}
module.exports = Person;