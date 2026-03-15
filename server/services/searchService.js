import Product from '../models/Product.js';
import natural from 'natural';

// Initialize tokenizer and string distance calculators for fuzzy matching
const tokenizer = new natural.WordTokenizer();
const stopwords = natural.stopwords;
const stemmer = natural.PorterStemmer;

// Dictionary map to capture synonymous variations
const SYNONYMS = {
    'tshirt': ['t-shirt', 'tee', 't shirt', 'tees'],
    't-shirt': ['tshirt', 'tee', 't shirt', 'tees'],
    'tee': ['tshirt', 't-shirt', 't shirt', 'tees'],
    'shirt': ['shirts', 'oxford', 'dress shirt', 'formal shirt'],
    'kurta': ['kurti', 'kurtas', 'kurtis'],
    'kurti': ['kurta', 'kurtas', 'kurtis'],
    'pant': ['pants', 'trouser', 'trousers', 'bottoms', 'chinos'],
    'trouser': ['pant', 'pants', 'trousers', 'bottoms'],
    'chino': ['chinos', 'pant', 'pants'],
    'jacket': ['jackets', 'coat', 'blazer'],
    'dress': ['dresses', 'gown', 'frock'],
    'saree': ['sari', 'sarees'],
    'sari': ['saree', 'sarees'],
    'silk': ['silky', 'satin'],
    'cotton': ['cottony', 'organic cotton'],
    'denim': ['jeans', 'jean'],
    'jean': ['jeans', 'denim'],
    'white': ['ivory', 'cream', 'off-white', 'off white'],
    'black': ['dark', 'ebony'],
    'blue': ['navy', 'azure', 'indigo'],
    'red': ['crimson', 'maroon', 'burgundy'],
    'men': ['mens', 'male', 'gents'],
    'women': ['womens', 'female', 'ladies', 'womans'],
    'kids': ['kid', 'child', 'children', 'boys', 'girls', 'boy', 'girl', 'infant', 'junior']
};

const KNOWN_COLORS = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'grey', 'gray', 'orange', 'brown', 'navy', 'maroon', 'gold', 'silver', 'beige', 'peach', 'cream', 'ivory', 'tan', 'khaki', 'crimson', 'burgundy', 'azure', 'indigo', 'olive', 'lime', 'magenta', 'cyan', 'teal'];

// Map to identify specific category intents from tokens
const CATEGORY_MAP = {
    'men': 'Men',
    'mens': 'Men',
    'male': 'Men',
    'women': 'Women',
    'womens': 'Women',
    'female': 'Women',
    'ladies': 'Women',
    'kids': 'Kids',
    'kid': 'Kids',
    'child': 'Kids',
    'children': 'Kids',
    'boy': 'Kids',
    'boys': 'Kids',
    'girl': 'Kids',
    'girls': 'Kids',
    'infant': 'Kids'
};

/**
 * Builds the MongoDB query object from request parameters
 */
const buildFilterQuery = (queryParams) => {
    const { category, subCategory, minPrice, maxPrice, size, color, fabric } = queryParams;
    let query = {};

    if (category) {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (subCategory) {
        query.subCategory = { $regex: new RegExp(`^${subCategory}$`, 'i') };
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
    let searchTerm = q.trim();

    // --- Price Phrase Interception ---
    // Look for phrases like "under 1000", "below 500", "less than 2000"
    const maxPriceMatch = searchTerm.match(/(?:under|below|less than)\s+(\d+)/i);
    if (maxPriceMatch && maxPriceMatch[1]) {
        const val = parseInt(maxPriceMatch[1], 10);
        if (!filterQuery.price) filterQuery.price = {};
        filterQuery.price.$lte = val;
        // Remove the phrase from the search term so we don't fuzzy search for the word "under"
        searchTerm = searchTerm.replace(maxPriceMatch[0], '').trim();
    }

    // Look for phrases like "over 1000", "above 500", "more than 2000"
    const minPriceMatch = searchTerm.match(/(?:over|above|more than)\s+(\d+)/i);
    if (minPriceMatch && minPriceMatch[1]) {
        const val = parseInt(minPriceMatch[1], 10);
        if (!filterQuery.price) filterQuery.price = {};
        filterQuery.price.$gte = val;
        // Remove the phrase from the search term
        searchTerm = searchTerm.replace(minPriceMatch[0], '').trim();
    }

    // e.g., for "shirt men", we want documents that match BOTH "shirt" and "men"
    // anywhere across the designated fields.
    let baseTokens = tokenizer.tokenize(searchTerm.toLowerCase()) || [];
    if (baseTokens.length === 0) baseTokens = [searchTerm.toLowerCase()]; // Fallback if tokenizer stripped everything

    // Special handling for compound words that shouldn't be split
    const compoundWords = ['t-shirt', 'off-white', 'off white', 'sky blue', 'light blue', 'dark blue'];
    const lowerSearchTerm = searchTerm.toLowerCase();
    const foundCompound = compoundWords.find(cw => lowerSearchTerm.includes(cw));
    
    // Filter out common english stop-words ("for", "with", "the", etc.)
    const filteredTokens = baseTokens.filter(t => !stopwords.includes(t));

    // If filtering removed everything (e.g., they literally searched "for"), just use original
    if (filteredTokens.length > 0) {
        baseTokens = filteredTokens;
    }

    // Extract colors mentioned in the search term
    const requestedColors = baseTokens.filter(t => KNOWN_COLORS.includes(t));

    // Extract intended categories mentioned in the search term
    const requestedCategories = [...new Set(baseTokens.map(t => CATEGORY_MAP[t]).filter(Boolean))];

    // Enhance tokens with Synonyms and Stems
    let expandedTokenGroups = baseTokens.map(token => {
        const group = new Set([token]);

        // Add stem (e.g., "shirts" -> "shirt")
        group.add(stemmer.stem(token));

        // Add synonyms if they exist
        if (SYNONYMS[token]) {
            SYNONYMS[token].forEach(syn => group.add(syn));
        }

        // Return as An OR Block Regex String
        // We use word boundaries more loosely to catch partial matches
        // e.g., 'shirt' will match 'shirts', 'T-Shirt', etc.
        return `(${Array.from(group).join('|')})`;
    });

    // Combine tokens into a regex that requires ALL token groups to appear somewhere in the string
    // e.g., ["(\bshirt|\bshirts)", "(\bmen|\bmens|\bmale)"] -> "(?=.*(\bshirt|\bshirts))(?=.*(\bmen|\bmens|\bmale))"
    const strictRegexPattern = expandedTokenGroups.map(groupMatch => `(?=.*${groupMatch})`).join('');

    // --- Hard-Filter Conflicting Categories ---
    // If user explicitly searched for "Men", we should never return "Kids" or "Women" even if they match other keywords.
    const allKnownCategories = ['Men', 'Women', 'Kids'];
    let categoryFilterMatch = {};
    if (requestedCategories.length > 0) {
        // e.g., requestedCategories = ['Men'], so conflictingCategories = ['Women', 'Kids']
        const conflictingCategories = allKnownCategories.filter(c => !requestedCategories.includes(c));
        if (conflictingCategories.length > 0) {
            categoryFilterMatch = {
                category: { $nin: conflictingCategories } // Must NOT be in the conflicting list
            };
        }
    }

    // Execute aggregation
    const pipeline = [
        // 1. First layer: Filter by standard categories/prices if provided
        { $match: filterQuery },
        
        // 1.5. Second layer: Hard-exclude conflicting inferred categories (e.g. drop Kids if Men was requested)
        { $match: categoryFilterMatch },

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
                        {
                            $reduce: {
                                input: { $ifNull: ["$colors", []] },
                                initialValue: "",
                                in: { $concat: ["$$value", " ", "$$this"] }
                            }
                        }
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
        // Provide a massive boost if a specific color requested in the search exists in the product's colors array
        {
            $addFields: {
                colorBoostScore: {
                    $cond: [
                        {
                            $and: [
                                { $gt: [requestedColors.length, 0] },
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: { $ifNull: ["$colors", []] },
                                                    as: "c",
                                                    cond: {
                                                        $in: [{ $toLower: "$$c" }, requestedColors]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        500, // +500 points if the color matches
                        0
                    ]
                }
            }
        },
        // Provide a massive boost if a specific category requested in the search matches the product's category
        {
            $addFields: {
                categoryBoostScore: {
                    $cond: [
                        {
                            $and: [
                                { $gt: [requestedCategories.length, 0] },
                                { $in: ["$category", requestedCategories] }
                            ]
                        },
                        1000, // +1000 points for exact demographic category match
                        0
                    ]
                }
            }
        },
        {
            $addFields: {
                rankingScore: {
                    $add: [
                        "$exactMatchScore",
                        "$colorBoostScore",
                        "$categoryBoostScore",
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
            if (!p || !p._id) {
                console.error('searchService: Invalid product or missing _id', p);
                return null;
            }
            p.id = p._id.toString();
            p._id = undefined;
            p.colorImages = p.colorImages || [];
            return p;
        }).filter(p => p !== null);

        // Generate Autocomplete Text Suggestions dynamically
        // e.g., user types "men" -> Suggest "Mens Shirts", "Mens T-Shirts"
        let textSuggestions = [];
        if (products.length > 0 && queryParams.autocomplete) {
            const suggestionSet = new Set();
            products.slice(0, 10).forEach(p => {
                 if (p.category && p.subCategory) {
                     suggestionSet.add(`${p.category} ${p.subCategory}`);
                 }
            });
            textSuggestions = Array.from(suggestionSet).slice(0, 5);
        }

        return { products, total, page: pageNum, limit: limitNum, suggestion: null, textSuggestions };
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
        // 5. Provide Color Boost for relaxed matches too
        {
            $addFields: {
                colorBoostScore: {
                    $cond: [
                        {
                            $and: [
                                { $gt: [requestedColors.length, 0] },
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: { $ifNull: ["$colors", []] },
                                                    as: "c",
                                                    cond: {
                                                        $in: [{ $toLower: "$$c" }, requestedColors]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        500, // +500 points if the color matches
                        0
                    ]
                }
            }
        },
        // 6. Provide Category/Demographic Boost for relaxed matches too
        {
            $addFields: {
                categoryBoostScore: {
                    $cond: [
                        {
                            $and: [
                                { $gt: [requestedCategories.length, 0] },
                                { $in: ["$category", requestedCategories] }
                            ]
                        },
                        1000, // +1000 points for exact demographic category match
                        0
                    ]
                }
            }
        },
        // 7. Final Ranking for Relaxed searches
        {
            $addFields: {
                rankingScore: {
                    $add: [
                        "$keywordDensity",
                        "$colorBoostScore",
                        "$categoryBoostScore",
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

        let textSuggestions = [];
        if (products.length > 0 && queryParams.autocomplete) {
            const suggestionSet = new Set();
            products.slice(0, 10).forEach(p => {
                 if (p.category && p.subCategory) {
                     suggestionSet.add(`${p.category} ${p.subCategory}`);
                 }
            });
            textSuggestions = Array.from(suggestionSet).slice(0, 5);
        }

        return { products, total, page: pageNum, limit: limitNum, suggestion: null, textSuggestions };
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
        const namePart = p.name || '';
        const catPart = p.category || '';
        const subCatPart = p.subCategory || '';
        const combined = `${namePart} ${catPart} ${subCatPart}`.toLowerCase().trim();
        if (!combined) return;

        const words = tokenizer.tokenize(combined) || [];

        // Check each word in our DB against the user's typo tokens
        baseTokens.forEach(searchToken => {
            if (!searchToken) return;
            words.forEach(dbWord => {
                if (!dbWord) return;
                try {
                    const similarity = natural.JaroWinklerDistance(searchToken, dbWord);
                    if (similarity > highestJaro && similarity < 1.0) { // <1.0 means it wasn't an exact match
                        highestJaro = similarity;
                        bestMatch = dbWord;
                    }
                } catch (e) {
                    // Ignore jaro errors on weird symbols
                }
            });
        });
    });

    if (bestMatch && highestJaro > 0.75) {
        suggestion = bestMatch;
    }

    // Return empty array, but provide the "did you mean" suggestion
    return { products: [], total: 0, page: pageNum, limit: limitNum, suggestion, textSuggestions: [] };
};
