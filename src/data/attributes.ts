export type AttributeType = 'fit' | 'pattern' | 'borderType' | 'occasion' | 'fabric';

export interface AttributeOption {
    value: string;
    label: string;
}

export const FIT_OPTIONS = {
    MEN: ['Slim', 'Regular', 'Relaxed'],
    WOMEN_TOP: ['Slim', 'Regular', 'A-line'],
    ALL: ['Slim', 'Regular', 'Relaxed', 'A-line'] // Union of all for filtering
};

export const PATTERN_OPTIONS = {
    MEN: ['Solid', 'Checked', 'Striped', 'Printed'],
    WOMEN_TOP: ['Solid', 'Floral', 'Printed', 'Embroidery'],
    SAREES: ['Plain', 'Printed', 'Embroidered', 'Jacquard'],
    KIDS: ['Cartoon', 'Printed', 'Solid'],
    ALL: ['Solid', 'Checked', 'Striped', 'Printed', 'Floral', 'Embroidery', 'Plain', 'Embroidered', 'Jacquard', 'Cartoon']
};

export const BORDER_TYPE_OPTIONS = ['Zari', 'Thread', 'Self', 'Contrast'];
export const OCCASION_OPTIONS = ['Casual', 'Party', 'Wedding', 'Festive', 'Formal'];

export const FABRIC_OPTIONS = {
    MEN: ['Cotton', 'Linen', 'Denim', 'Polyester'],
    WOMEN_TOP: ['Cotton', 'Rayon', 'Georgette'],
    SAREES: ['Silk', 'Cotton', 'Chiffon'],
    KIDS: ['Soft Cotton', 'Hosiery', 'Cotton'],
    ALL: ['Cotton', 'Linen', 'Denim', 'Polyester', 'Rayon', 'Georgette', 'Silk', 'Chiffon', 'Soft Cotton', 'Hosiery']
};

// Helper to determine which attributes and options apply to a specific category/subcategory
export const getProductAttributes = (category: string, subCategory: string = '') => {
    const cat = category.toLowerCase();
    const sub = subCategory.toLowerCase();

    const attributes = {
        fit: { show: false, options: [] as string[] },
        pattern: { show: false, options: [] as string[] },
        borderType: { show: false, options: [] as string[] },
        occasion: { show: false, options: [] as string[] },
        fabric: { show: false, options: [] as string[] },
    };

    // 1. Fit
    if (cat === 'men') {
        attributes.fit = { show: true, options: FIT_OPTIONS.MEN };
    } else if (cat === 'women') {
        if (sub.includes('saree') || sub === 'sarees') {
            attributes.fit.show = false;
        } else {
            attributes.fit = { show: true, options: FIT_OPTIONS.WOMEN_TOP };
        }
    } else if (cat === 'kids') {
        attributes.fit.show = false;
    }

    // 2. Pattern
    attributes.pattern.show = true;
    if (cat === 'men') {
        attributes.pattern.options = PATTERN_OPTIONS.MEN;
    } else if (cat === 'women') {
        if (sub.includes('saree') || sub === 'sarees') {
            attributes.pattern.options = PATTERN_OPTIONS.SAREES;
        } else {
            attributes.pattern.options = PATTERN_OPTIONS.WOMEN_TOP;
        }
    } else if (cat === 'kids') {
        attributes.pattern.options = PATTERN_OPTIONS.KIDS;
    } else {
        attributes.pattern.options = PATTERN_OPTIONS.ALL;
    }

    // 3. Border Type & Occasion (Specific to Sarees per request, but can be broader if needed)
    if (cat === 'women' && (sub.includes('saree') || sub === 'sarees')) {
        attributes.borderType = { show: true, options: BORDER_TYPE_OPTIONS };
        attributes.occasion = { show: true, options: OCCASION_OPTIONS };
    }

    // Occasion is often useful for Kids/Men too (Ethnic wear), adding if 'ethnic' or 'lehenga' involved
    if (sub.includes('ethnic') || sub.includes('lehenga') || sub.includes('kurta') || sub.includes('party')) {
        attributes.occasion = { show: true, options: OCCASION_OPTIONS };
    }

    // 4. Fabric
    attributes.fabric.show = true;
    if (cat === 'men') {
        attributes.fabric.options = FABRIC_OPTIONS.MEN;
    } else if (cat === 'women') {
        if (sub.includes('saree') || sub === 'sarees') {
            attributes.fabric.options = FABRIC_OPTIONS.SAREES;
        } else {
            attributes.fabric.options = FABRIC_OPTIONS.WOMEN_TOP;
        }
    } else if (cat === 'kids') {
        attributes.fabric.options = FABRIC_OPTIONS.KIDS;
    } else {
        attributes.fabric.options = FABRIC_OPTIONS.ALL;
    }

    return attributes;
};
