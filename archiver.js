// Huffman Encoding
function buildFrequencyTable(text) {
    const frequencyTable = {};
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char in frequencyTable) {
            frequencyTable[char]++;
        } else {
            frequencyTable[char] = 1;
        }
    }
    return frequencyTable;
}

function buildHuffmanTree(frequencyTable) {
    const nodes = Object.keys(frequencyTable).map((char) => ({
        character: char,
        frequency: frequencyTable[char],
        left: null,
        right: null,
    }));
    if (nodes.length === 0) {
        return null;
    }
    while (nodes.length > 1) {
        nodes.sort((a, b) => {
            if (a.character === null && b.character === null) {
                return 0;
            } else if (a.character === null) {
                return -1;
            } else if (b.character === null) {
                return 1;
            } else {
                return a.frequency - b.frequency || a.character === b.character ? 0 : a.character.localeCompare(b.character);
            }
        });
        // Define newNode
        const newNode = {
            character: null,
            frequency: nodes[nodes.length - 2].frequency + nodes[nodes.length - 1].frequency,
            left: nodes.pop(),
            right: nodes.pop(),
        };
        nodes.push(newNode);
    }
    return nodes[0];
}


// Build Huffman Codes
function buildHuffmanCodes(huffmanTree) {
    const huffmanCodes = {};
    if (huffmanTree === null) {
        return huffmanCodes;
    }
    function traverseTree(node, code) {
        if (node.character !== null) {
            huffmanCodes[node.character] = code;
        } else {
            traverseTree(node.left, code + '0');
            traverseTree(node.right, code + '1');
        }
    }
    traverseTree(huffmanTree, '');
    return huffmanCodes;
}

function encodeFile(text, huffmanCodes) {
    let encodedText = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        encodedText += huffmanCodes[char];
    }
    return encodedText;
}

function isLeaf(node) {
    return !node.left && !node.right;
}

function decodeFile(encodedText, huffmanTree) {
    let decodedText = "";
    let currentNode = huffmanTree;
    for (let i = 0; i < encodedText.length; i++) {
        const bit = encodedText[i];
        if (bit === "0") {
            currentNode = currentNode.left;
        } else {
            currentNode = currentNode.right;
        }
        if (isLeaf(currentNode)) {
            decodedText += currentNode.character;
            currentNode = huffmanTree;
        }
    }
    return decodedText;
}

const fs = require("fs");
fs.readFile('file.txt', 'utf8', (err, filename) => {
    if (err) {
        console.error(err);
        return;
    }
    const frequencyTable = buildFrequencyTable(filename);
    const huffmanTree = buildHuffmanTree(frequencyTable);
    const huffmanCodes = buildHuffmanCodes(huffmanTree);
    const encodedText = encodeFile(filename, huffmanCodes);
    fs.writeFile("encoded.txt", encodedText, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("File has been encoded and saved as encoded.txt");
    });
    const decodedText = decodeFile(encodedText, huffmanTree);
    fs.writeFile("decoded.txt", decodedText, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("File has been decoded and saved as decoded.txt");
    })
});
