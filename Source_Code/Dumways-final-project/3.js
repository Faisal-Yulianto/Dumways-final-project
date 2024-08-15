function drawimage(size) {
    if (size % 2 === 0) {
        return;
    }

    for (let i = 0; i < size; i++) {
        let row = '';
        for (let j = 0; j < size; j++) {
            if (i === j || i + j === size - 1) {
                row += '*';
            } else if (i < size / 2 && j < size / 2 || i > size / 2 && j > size / 2) {
                row += (i + j) % 2 === 0 ? '*' : '#';
            } else {
                row += (i + j) % 2 === 0 ? '#' : '*';
            }
        }
        console.log(row);
    }
}
drawimage(5);
drawimage(7);








  


