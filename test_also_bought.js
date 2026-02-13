
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function test() {
    try {
        // 1. Get all products and find a Saree
        const res = await axios.get(`${API_URL}/products`);
        const products = res.data;

        if (products.length === 0) return console.log('No products found');

        const saree = products.find(p => p.subCategory === 'Sarees');
        const jeans = products.find(p => p.subCategory === 'Jeans' && p.category === 'Men');

        if (saree) {
            console.log(`\nTesting: ${saree.name} (${saree.subCategory})`);
            const recs = await axios.get(`${API_URL}/products/${saree.id}/also-bought`);
            console.log('Users Also Bought:');
            recs.data.forEach((p, i) => console.log(`${i + 1}. ${p.name} (${p.subCategory})`));
        }

        if (jeans) {
            console.log(`\nTesting: ${jeans.name} (${jeans.subCategory})`);
            const recs = await axios.get(`${API_URL}/products/${jeans.id}/also-bought`);
            console.log('Users Also Bought:');
            recs.data.forEach((p, i) => console.log(`${i + 1}. ${p.name} (${p.subCategory})`));
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

test();
