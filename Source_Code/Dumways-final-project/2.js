let array = [20, 12, 35, 11, 17, 9, 58, 23, 69, 21];

function bubbleSort(array) {
    let n = array.length;   
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (array[j] > array[j + 1]) {
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
        }
    }

    return array;
}

let hasil = bubbleSort(array);
console.log(hasil);
