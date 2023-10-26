const fs = require('fs');
// Определение исходного файла, с которым программа будет работать
const dataFile = 'data.txt';

// Запуск программы
startProgramm(dataFile);

// Класс для хранения узлов древа
class Node {
    constructor(character, priority) {
        this.character = character;
        this.priority = priority;
        this.left = null;
        this.right = null;
    }
}

// Функция для сохранения архивированных
// и разархивированных данных в текстовый файл
function makeFile(name, content){
    fs.writeFile(name, content, (err) => {
        if (err){
            console.error(err);
            return;
        }
        console.log(`Файл ${name} был успешно создан.`);
    });
}

// Функция для определения прироитетов у символов
// Возвращает словарь-таблицу прироритетов
function getPriorities(data) {
    const priorityTable = {};
    
    for (let i = 0; i < data.length; i++) {
        const char = data[i];

        if (char in priorityTable) {
            priorityTable[char]++;
        } else {
            priorityTable[char] = 1;
        }
    }
    
    return priorityTable;
}

// Функция на сохранение данных древа в файл
function saveHuffmanTree(tree, filename) {
    const treeData = JSON.stringify(tree);
    
    fs.writeFileSync(filename, treeData);
    console.log(`Древо было успешно сохранено в файл ${filename}`);
}


// Функция для построение древа
// Возращает объект класса Node
function makeHuffmanTree(frequencies) {
    const priorityQueue = Object.keys(frequencies).map(
        (character) => new Node(character, frequencies[character]));
    
    while (priorityQueue.length > 1) {
        priorityQueue.sort((a, b) => a.priority - b.priority);

        const left = priorityQueue.shift();
        const right = priorityQueue.shift();
        const mergedNode = new Node(null, left.priority + right.priority);

        mergedNode.left = left;
        mergedNode.right = right;

        priorityQueue.push(mergedNode);
    }
    
    // Сохранение древа в отдельный текстовый файл для
    // последующей разархивации закодированного файла
    saveHuffmanTree(priorityQueue[0], 'huffman_tree.txt');

    return priorityQueue[0];
}

// Функция, использующаяся при архивации данных, 
// для определения бинарных кодов у каждого символа
function getCode(node, character, code = '') {
    if (node.character === character) {
        return code;
    }
    if (node.left) {
        const leftCode = getCode(node.left, character, code + '0');
        if (leftCode) {
            return leftCode;
        }
    }
    if (node.right) {
        const rightCode = getCode(node.right, character, code + '1');
        if (rightCode) {
            return rightCode;
        }
    }

    return '';
}

// Функция архивации, результат представляет из себя
// строку с бинарным кодом
function archiveFile(data, tree, filename) {
    const archivedData = data.split('').map(
        (character) => getCode(tree, character)).join('');
    
    makeFile(filename, archivedData)
}

// Функция разархивации, результат должен
// быть идентичен исходному файлу до архивации
function unarchiveFile(data, tree, filename) {
    const archivedData = data;
    const unarchivedData = [];
    
    let currentNode = tree;
    for (let i = 0; i < archivedData.length; i++) {
        if (archivedData[i] === '0') {
            currentNode = currentNode.left;
        } else {
            currentNode = currentNode.right;
        }
        if (!currentNode.left && !currentNode.right) {
            unarchivedData.push(currentNode.character);
            currentNode = tree;
        }
    }
    
    makeFile(filename, unarchivedData.join(''));
}

// Основная программа, умещенная в одну функцию
function startProgramm(filename){
    // Чтение исходного файла
    fs.readFile(filename, 'utf8', (err, content) => {
        if (err) {
            console.error(err);
            return;
        }
        
        // Получаем приоритеты
        const priorities = getPriorities(content);
        // Создаём древо Хаффмана и сохраняем его в отдельный файл
        const huffmanTree = makeHuffmanTree(priorities);

        // Архивируем файл с помощью древа, результат
        // сохраняем в archived.txt
        archiveFile(content, huffmanTree, 'archived.txt');
        
        // Чтение файла archived.txt
        fs.readFile('archived.txt', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            
            // Загружаем древо Хаффмана из файла huffman_tree.txt
            tree = JSON.parse(fs.readFileSync('huffman_tree.txt', 'utf8'));

            // Разархивируем archived.txt и выгружаем результат
            // в unarchived.txt
            unarchiveFile(data, tree, 'unarchived.txt');
        });
    });
}