import express from 'express';
import { GoogleGenAI } from '@google/genai';
import Product from '../models/Product.js';
import { performSmartSearch } from '../services/searchService.js';

const router = express.Router();

let ai;
try {
    // Initialize Gemini client. It will automatically use process.env.GEMINI_API_KEY
    ai = new GoogleGenAI({});
} catch (error) {
    console.warn('Could not initialize GoogleGenAI. Is GEMINI_API_KEY set?', error.message);
}

router.post('/', async (req, res) => {
    try {
        console.log('[CHAT] Route called');
        const { messages } = req.body;
        console.log('[CHAT] Messages received:', messages?.length);

        if (!messages || !Array.isArray(messages)) {
            console.log('[CHAT] Invalid messages format');
            return res.status(400).json({ message: 'Messages array is required' });
        }

        if (!ai) {
            console.log('[CHAT] AI not initialized');
            return res.status(503).json({ message: 'AI service is not configured (missing API key)' });
        }

        // Extract the latest user message to find relevant products
        const lastUserMsg = messages.filter(m => m.role === 'user').pop();
        const searchQuery = lastUserMsg ? lastUserMsg.content : '';
        console.log('[CHAT] Search query:', searchQuery);

        // Only fetch top 15 relevant products to prevent exceeding Gemini Token Quota
        console.log('[CHAT] Calling performSmartSearch...');
        const searchResult = await performSmartSearch({ q: searchQuery, limit: 15 });
        console.log('[CHAT] Search result received, products:', searchResult?.products?.length);
        const products = searchResult.products;

        const productContext = products.map(p =>
            `- [ID: ${p.id || p._id}] **${p.name}** (${p.category || 'N/A'}): ${p.price > 0 ? `₹${p.price}` : 'Free'}${p.originalPrice ? ` (Discounted from ₹${p.originalPrice})` : ''}. ` +
            `Available Sizes: ${(p.sizes || []).filter(s => typeof s !== 'object' ? true : s.size).map(s => typeof s === 'object' ? s.size : s).join(', ') || 'N/A'}. ` +
            `Available Colors: ${(p.colors || []).join(', ') || 'N/A'}. ` +
            `Stock Level: ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}`
        ).join('\n');

        const systemPrompt = `You are a friendly and helpful AI shopping assistant for an online dress shop named Varnam Silks.

Your job is to help customers browse products, choose the right dress, and answer questions about the store.

Guidelines:
1. Greet customers politely and ask how you can help them.
2. Help users find dresses based on Category, Type, Size, Color, and Price range.
3. Suggest popular or trending products if the user is unsure.
4. Provide product details like material, price, available sizes, and offers.
5. Help customers with: Order tracking, Return and refund policy, Shipping information, Payment methods.
6. If the user wants to buy something, guide them to add the item to cart and proceed to checkout by providing a link to the product.
7. Always respond in simple and friendly language.
8. If a question is unrelated to the store, politely redirect the conversation back to shopping.
9. If the user asks for fashion advice, recommend outfits based on trends, season, and occasions like casual wear, party wear, or office wear.

Store Information:
- Store Name: Varnam Silks
- Delivery: 3-5 business days
- Return Policy: 7-day return available if unused and in original condition
- Payment Methods: UPI, Debit Card, Credit Card, Cash on Delivery

Available Products in Store:
${productContext}

Please use the provided product list to make accurate recommendations. 

CRITICAL INSTRUCTION REGARDING LINKS AND RESULTS: 
1. You absolutely CAN and MUST provide clickable markdown links to products when mentioning them.
2. The format is strictly: \`[Product Name](/product/PRODUCT_ID)\`.
Example: "Here is the link to the [White Silk Saree](/product/65a3b21c...)"
3. DO NOT say you cannot provide a link. You are fully capable of generating this markdown format.
4. Format your recommendations clearly. Use bullet points for multiple items. Use **bold** for product names and prices.
5. If a user asks for something not in the list, apologize and say it's currently unavailable. DO NOT make up products. Format your response in Markdown where appropriate, but keep it conversational.`;

        const formattedContents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
        console.log('[CHAT] Formatted contents ready');

        console.log('[CHAT] Calling Gemini API...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedContents,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7
            }
        });
        console.log('[CHAT] Gemini API response received');

        if (!response?.text) {
            console.error('[CHAT] Invalid response from Gemini API:', response);
            return res.status(500).json({ message: 'Failed to get response from AI model' });
        }

        console.log('[CHAT] Sending success response');
        res.json({ message: response.text });
    } catch (error) {
        const errorMsg = error?.message || String(error);
        const errorStatus = error?.status || error?.response?.status || 500;
        
        console.error('[CHAT] ERROR caught:', {
            status: errorStatus,
            message: errorMsg,
            code: error?.code,
            stack: error?.stack
        });
        
        // Handle Gemini API Rate Limits gracefully
        if (errorStatus === 429 || errorMsg?.includes('429') || errorMsg?.includes('quota')) {
            console.error('[CHAT] Rate limit detected');
            return res.status(429).json({ 
                message: "I'm experiencing very high traffic right now! Please try again in a few minutes." 
            });
        }
        
        // Handle authentication/API key issues
        if (errorStatus === 401 || errorStatus === 403 || errorMsg?.includes('API') || errorMsg?.includes('key')) {
            console.error('[CHAT] API Authentication Issue - Check GEMINI_API_KEY');
            return res.status(503).json({ message: 'AI service authentication failed. Please check server configuration.' });
        }

        console.error('[CHAT] Returning generic error response');
        res.status(errorStatus).json({ 
            message: 'Failed to process chat request. Please try again later.' 
        });
    }
});

export default router;
