import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function test() {
    try {
        const res = await axios.get(`${API_URL}/products`);
        const products = res.data;
        if (products.length === 0) return console.log('No products found');

        const target = products[0];
        console.log('Target:', target.name, 'Category:', target.category, 'Sub:', target.subCategory);

        const recRes = await axios.get(`${API_URL}/products/${target.id}/recommendations`);
        const recs = recRes.data;

        console.log('Recs:');
        recs.forEach((p, i) => console.log(`${i + 1}. ${p.name} (${p.subCategory})`));

    } catch (error) {
        console.error('Error:', error.message);
    }
}
test();
