import Product from '../models/Product.js';
import natural from 'natural';

// Initialize tokenizer and string distance calculators for fuzzy matching
const tokenizer = new natural.WordTokenizer();
const stopwords = natural.stopwords;
const stemmer = natural.PorterStemmer;

// Dictionary map to capture synonymous variations
const SYNONYMS = {
    'tshirt': ['t-shirt', 'tee', 't shirt'],
    't-shirt': ['tshirt', 'tee', 't shirt'],
    'tee': ['tshirt', 't-shirt', 't shirt'],
    'kurta': ['kurti', 'kurtas', 'kurtis'],
    'kurti': ['kurta', 'kurtas', 'kurtis'],
    'pant': ['pants', 'trouser', 'trousers', 'bottoms'],
    'trouser': ['pant', 'pants', 'trousers', 'bottoms'],
    'sari': ['saree', 'sarees'],
    'saree': ['sari', 'sarees'],
    'men': ['mens', 'male', 'boy', 'boys'],
    'women': ['womens', 'female', 'girl', 'girls', 'ladies'],
    'kids': ['kid', 'child', 'children', 'boys', 'girls']
};

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

    // e.g., for "shirt men", we want documents that match BOTH "shirt" and "men"
    // anywhere across the designated fields.
    let baseTokens = tokenizer.tokenize(searchTerm.toLowerCase()) || [searchTerm.toLowerCase()];

    // Filter out common english stop-words ("for", "with", "the", etc.)
    const filteredTokens = baseTokens.filter(t => !stopwords.includes(t));

    // If filtering removed everything (e.g., they literally searched "for"), just use original
    if (filteredTokens.length > 0) {
        baseTokens = filteredTokens;
    }

    // Enhance tokens with Synonyms and Stems
    let expandedTokenGroups = baseTokens.map(token => {
        const group = new Set([token]);

        // Add stem (e.g., "shirts" -> "shirt")
        group.add(stemmer.stem(token));

        // Add synonyms if they exist
        if (SYNONYMS[token]) {
            SYNONYMS[token].forEach(syn => group.add(syn));
        }

        // Return as An OR Block Regex String: "(token1|stem1|synonym1)"
        return `(${Array.from(group).join('|')})`;
    });

    // Combine tokens into a regex that requires ALL token groups to appear somewhere in the string
    // e.g., ["(shirt|shirts)", "(men|mens|male)"] -> "(?=.*(shirt|shirts))(?=.*(men|mens|male))"
    const strictRegexPattern = expandedTokenGroups.map(groupMatch => `(?=.*${groupMatch})`).join('');

    // Execute aggregation
    const pipeline = [
        // 1. First layer: Filter by standard categories/prices if provided
        { $match: filterQuery },

        // 2. Create a giant string of all text fields to search against
        {
            $addFields: {
                searchString: {
                    $concat: [
                        { $ifNull: ["$name", ""] }, " ",
                        { $ifNull: ["$category", ""] }, " ",
                        { $ifNull: ["$subCategory", ""] }, " ",
                        { $ifNull: ["$description", ""] }, " ",
                        { $ifNull: ["$fabric", ""] }, " ",
                        { $ifNull: ["$color", ""] }
                    ]
                }
            }
        },

        // 3. Match the strict regex against the concatenated string
        {
            $match: {
                searchString: { $regex: new RegExp(strictRegexPattern, 'i') }
            }
        },

        // 4. Score the matches
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

    // Get Total Count for STRICT matches
    const countResult = await Product.aggregate([...pipeline, { $count: 'total' }]);
    total = countResult.length > 0 ? countResult[0].total : 0;

    // If we have STRICT results, fetch them paginated
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
    // SCENARIO 3: Strict Match Failed. Dynamic Query Relaxing (Amazon Fallback)
    // -------------------------------------------------------------
    // If the user typed "blue cotton men casual printed shirt" and we don't have that exact item,
    // we drop the requirement that ALL tokens must match, and instead search for ANY token.
    // We then rank the products by Keyword Density (how many of the tokens they matched).

    // Regex requiring ANY of the tokens to match somewhere
    // e.g., ["(shirt|shirts)", "(men|mens)"] -> "((shirt|shirts)|(men|mens))"
    const relaxedRegexPattern = expandedTokenGroups.join('|');

    const relaxedPipeline = [
        ...pipeline.slice(0, 2), // Keep match and searchString generation
        // 3. Match the relaxed regex against the concatenated string
        {
            $match: {
                searchString: { $regex: new RegExp(relaxedRegexPattern, 'i') }
            }
        },
        // 4. Calculate Density Score (how many of the user's base tokens were found)
        {
            $addFields: {
                keywordDensity: {
                    $add: expandedTokenGroups.map(groupRegex => ({
                        $cond: [
                            { $regexMatch: { input: "$searchString", regex: new RegExp(groupRegex, 'i') } },
                            100, // +100 points for every keyword fulfilled
                            0
                        ]
                    }))
                }
            }
        },
        // 5. Final Ranking for Relaxed searches
        {
            $addFields: {
                rankingScore: {
                    $add: [
                        "$keywordDensity",
                        { $multiply: ["$purchaseCount", 0.1] },
                        { $multiply: ["$viewCount", 0.01] }
                    ]
                }
            }
        },
        { $sort: { rankingScore: -1 } }
    ];

    // Get Total Count for Relaxed matches
    const relaxedCountResult = await Product.aggregate([...relaxedPipeline, { $count: 'total' }]);
    total = relaxedCountResult.length > 0 ? relaxedCountResult[0].total : 0;

    if (total > 0) {
        products = await Product.aggregate([
            ...relaxedPipeline,
            { $skip: skip },
            { $limit: limitNum }
        ]);

        products = products.map(p => {
            p.id = p._id.toString();
            p._id = undefined;
            p.colorImages = p.colorImages || [];
            return p;
        });

        return { products, total, page: pageNum, limit: limitNum, suggestion: null };
    }

    // -------------------------------------------------------------
    // SCENARIO 4: No results found at all. Attempt Typo Correction
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
