function generateESN(selectedModel, from, to) {
    const esns = [];
    const facility = '2';
    const year = '4';
    const dayOfYear = new Date().toISOString().slice(5, 10).split('-').reduce((a, b) => a + parseInt(b), 0).toString().padStart(3, '0');

    for (let serial = from; serial <= to; serial++) {
        // Generate the serial part, starting from 0000 and incrementing
        const serialPart = serial.toString().padStart(4, '0');
        // Combine the parts to form the ESN
        const esn = selectedModel.substring(0, 3) + facility + year + dayOfYear + serialPart;
        esns.push(esn);
    }

    
    return esns;
    
}

module.exports = generateESN;
