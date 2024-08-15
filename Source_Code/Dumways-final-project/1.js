let A = 4550;
let B = 5330;
let C = 8653;

function hitungBarang(kualitas, qty) {
    let harga, diskon, total;
    if (kualitas === A) {
        harga = A * qty;
        if (qty > 13) {
            diskon = 231 * qty;
        } else {
            diskon = 0;
        }
    } else if (kualitas === B) {
        harga = B * qty;
        if (qty > 7) {
            diskon = harga * 0.23; 
        } else {
            diskon = 0;
        }
    } else if (kualitas === C) {
        harga = C * qty;
        diskon = 0; 
    } else {
        console.log("Barang tidak ada");
        return;
    }

    total = harga - diskon;

    console.log("- Total harga barang : " + harga);
    console.log("- Potongan : " + diskon);
    console.log("- Total yang harus dibayar : " + total);
}
hitungBarang(A, 7);
