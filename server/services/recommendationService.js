import natural from 'natural';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

/**
 * Calculate similarity score between two products
 * @param {Object} target - The product we are looking at
 * @param {Object} candidate - The product we are comparing against
 * @returns {Number} - The similarity score
 */
const calculateSimilarity = (target, candidate) => {
    let score = 0;

    // 1. Category Hierarchy (High Weight)
    if (target.category === candidate.category) {
        score += 5;
        if (target.subCategory === candidate.subCategory) {
            score += 15; // Boost significantly for same specific type
        }
    }

    // 2. Attributes (Medium Weight)
    if (target.fabric && candidate.fabric && target.fabric === candidate.fabric) score += 3;
    if (target.pattern && candidate.pattern && target.pattern === candidate.pattern) score += 3;
    if (target.occasion && candidate.occasion && target.occasion === candidate.occasion) score += 3;
    if (target.fit && candidate.fit && target.fit === candidate.fit) score += 2;

    // 3. Color Similarity (Intersection)
    const targetColors = new Set(target.colors || []);
    const candidateColors = new Set(candidate.colors || []);
    const commonColors = [...targetColors].filter(x => candidateColors.has(x));
    score += commonColors.length * 2;

    // 4. Content-Based Filtering (Text Similarity for Name/Description)
    // Simple Jaccard Index on tokenized name for performance + relevance
    const targetTokens = new Set(tokenizer.tokenize((target.name + ' ' + target.description).toLowerCase()));
    const candidateTokens = new Set(tokenizer.tokenize((candidate.name + ' ' + candidate.description).toLowerCase()));

    const intersection = new Set([...targetTokens].filter(x => candidateTokens.has(x)));
    const union = new Set([...targetTokens, ...candidateTokens]);

    if (union.size > 0) {
        const jaccardIndex = intersection.size / union.size;
        score += jaccardIndex * 5; // Weighted
    }

    // 5. Price Proximity (Optional: Penalize large differences)
    // logic: if price is within 30% range, give small boost
    const priceDiffRatio = Math.abs(target.price - candidate.price) / target.price;
    if (priceDiffRatio < 0.3) score += 2;

    return score;
};

export const getRecommendations = async (targetProduct, allProducts, limit = 4) => {
    const scoredProducts = allProducts.map(product => {
        // Skip self is handled by caller usually, but safe to check id
        if (product._id.toString() === targetProduct._id.toString()) return null;

        return {
            product,
            score: calculateSimilarity(targetProduct, product.toObject())
        };
    }).filter(Boolean); // Remove nulls

    // Sort by name descending
    return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.product); // Return just the products
};
