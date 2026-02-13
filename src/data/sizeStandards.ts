export const SIZE_STANDARDS = {
    Alpha: {
        label: 'Standard (XS, S, M...)',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
    },
    Numeric: {
        label: 'Numeric (28, 30, 32...)',
        sizes: ['26', '28', '30', '32', '34', '36', '38', '40', '42']
    },
    Kids: {
        label: 'Kids (Age based)',
        sizes: ['0-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y']
    },
    Saree: {
        label: 'Saree (One Size)',
        sizes: ['Free Size']
    },
    Innerwear: {
        label: 'Innerwear (XS, S, M...)',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    MenInnerwear: {
        label: 'Men Innerwear (S, M / 70, 75...)',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '70', '75', '80', '85', '90', '95', '100']
    }
} as const;

export type SizeType = keyof typeof SIZE_STANDARDS;

export const getSizeOptions = (type: SizeType) => {
    return SIZE_STANDARDS[type]?.sizes || [];
};
