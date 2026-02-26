import Product from '../models/Product.js';
import natural from 'natural';

// Initialize tokenizer and string distance calculators for fuzzy matching
const tokenizer = new natural.WordTokenizer();

/**
 * Builds the MongoDB query object from request parameters
 */
const buildFilterQuery = (queryParams) => {
    const { category, minPrice, maxPrice, size, color, fabric } = queryParams;
    let query = {};

    if (category) {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (fabric) {
        query.fabric = { $regex: new RegExp(`^${fabric}$`, 'i') };
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (size) {
        // Intersect logic: find a sizes array element that matches the size
        // AND has colors with stock > 0
        query.sizes = {
            $elemMatch: {
                size: { $regex: new RegExp(`^${size}$`, 'i') },
                'colors.stock': { $gt: 0 }
            }
        };
    }

    if (color) {
        // Intersect logic: color must exist and be in stock (or generally listed)
        // We look at the top level colors array
        query.colors = { $regex: new RegExp(`^${color}$`, 'i') };
    }

    return query;
};

/**
 * Executes a smart search against the Product database
 */
export const performSmartSearch = async (queryParams) => {
    const { q = '', page = 1, limit = 12 } = queryParams;

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // Build standard filters (Price, Category, Size, etc.)
    const filterQuery = buildFilterQuery(queryParams);

    let products = [];
    let total = 0;
    let suggestion = null;

    // -------------------------------------------------------------
    // SCENARIO 1: Empty search query. Just apply filters / pagination
    // -------------------------------------------------------------
    if (!q.trim()) {
        total = await Product.countDocuments(filterQuery);
        products = await Product.find(filterQuery)
            .sort({ purchaseCount: -1, viewCount: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        return { products, total, page: pageNum, limit: limitNum, suggestion: null };
    }

    // -------------------------------------------------------------
    // SCENARIO 2: Text search is provided
    // -------------------------------------------------------------
    const searchTerm = q.trim();

    // 1. First, try an Aggregation Pipeline that scores and sorts
    // We break the search term into tokens to build a flexible regex for partial matching
    const tokens = tokenizer.tokenize(searchTerm.toLowerCase()) || [searchTerm.toLowerCase()];
    // e.g. "red saree" -> ["red", "saree"] -> (?=.*red)(?=.*saree)
    const regexPattern = tokens.map(t => `(?=.*${t})`).join('');

    const textQuery = {
        $or: [
            { name: { $regex: regexPattern, $options: 'i' } },
            { category: { $regex: regexPattern, $options: 'i' } },
            { subCategory: { $regex: regexPattern, $options: 'i' } },
            { description: { $regex: regexPattern, $options: 'i' } }
        ]
    };

    // Combine text query with filters
    const combinedQuery = { ...filterQuery, ...textQuery };

    // Execute aggregation
    const pipeline = [
        { $match: combinedQuery },
        // Add a field to score the matches. 
        {
            $addFields: {
                exactMatchScore: {
                    $cond: [
                        {
                            $or: [
                                { $regexMatch: { input: { $ifNull: ["$name", ""] }, regex: new RegExp(`^${searchTerm}$`, 'i') } },
                                { $regexMatch: { input: { $ifNull: ["$category", ""] }, regex: new RegExp(`^${searchTerm}$`, 'i') } }
                            ]
                        },
                        100, // Exact Match
                        10  // Partial Match
                    ]
                }
            }
        },
        {
            $addFields: {
                rankingScore: {
                    $add: [
                        "$exactMatchScore",
                        { $multiply: ["$purchaseCount", 0.1] },
                        { $multiply: ["$viewCount", 0.01] }
                    ]
                }
            }
        },
        { $sort: { rankingScore: -1 } }
    ];

    // Get Total Count
    const countResult = await Product.aggregate([...pipeline, { $count: 'total' }]);
    total = countResult.length > 0 ? countResult[0].total : 0;

    // If we have results, fetch them paginated
    if (total > 0) {
        products = await Product.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: limitNum }
        ]);

        // Map `_id` to `id` exactly as the standard routes do
        products = products.map(p => {
            p.id = p._id.toString();
            p._id = undefined;
            p.colorImages = p.colorImages || [];
            return p;
        });

        return { products, total, page: pageNum, limit: limitNum, suggestion: null };
    }

    // -------------------------------------------------------------
    // SCENARIO 3: No results found. Attempt Typo Correction (Fuzzy)
    // -------------------------------------------------------------

    // Fetch all meaningful terms from DB to check against (Cached or quick fetch)
    // For smaller DBs, this is fine. For larger, we'd cache this dictionary.
    const allProducts = await Product.find({}, 'name category subCategory string');

    let bestMatch = null;
    let highestJaro = 0.5; // Threshold for Jaro-Winkler similarity (0 to 1)

    allProducts.forEach(p => {
        const words = tokenizer.tokenize((p.name + " " + p.category + " " + p.subCategory).toLowerCase());

        // Check each word in our DB against the user's typo tokens
        tokens.forEach(searchToken => {
            words.forEach(dbWord => {
                const similarity = natural.JaroWinklerDistance(searchToken, dbWord);
                if (similarity > highestJaro && similarity < 1.0) { // <1.0 means it wasn't an exact match
                    highestJaro = similarity;
                    bestMatch = dbWord;
                }
            });
        });
    });

    if (bestMatch && highestJaro > 0.8) {
        suggestion = bestMatch;
    }

    // Return empty array, but provide the "did you mean" suggestion
    return { products: [], total: 0, page: pageNum, limit: limitNum, suggestion };
};
