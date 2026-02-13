export interface NavItem {
    label: string;
    href: string;
    children?: NavItem[];
}

export interface MegaMenuColumn {
    title: string;
    items: NavItem[];
}

export interface MegaMenuItem {
    label: string;
    href: string;
    columns?: MegaMenuColumn[];
}

export const NAV_ITEMS: MegaMenuItem[] = [
    {
        label: 'Men',
        href: '/shop?category=men',
        columns: [
            {
                title: 'Topwear',
                items: [
                    { label: 'Shirts', href: '/shop?category=men&sub=shirts' },
                    { label: 'T-Shirts', href: '/shop?category=men&sub=t-shirts' },
                    { label: 'Kurtas', href: '/shop?category=men&sub=kurtas' },
                ],
            },
            {
                title: 'Bottomwear',
                items: [
                    { label: 'Jeans', href: '/shop?category=men&sub=jeans' },
                    { label: 'Trousers', href: '/shop?category=men&sub=trousers' },
                    { label: 'Track Pants', href: '/shop?category=men&sub=track-pants' },
                ],
            },
            {
                title: 'Ethnic Wear',
                items: [
                    { label: 'Kurta Sets', href: '/shop?category=men&sub=kurta-sets' },
                    { label: 'Dhoti', href: '/shop?category=men&sub=dhoti' },
                ],
            },
            {
                title: 'Innerwear & Sleepwear',
                items: [
                    { label: 'All Innerwear', href: '/shop?category=men&sub=innerwear' }
                ],
            },
        ],
    },
    {
        label: 'Women',
        href: '/shop?category=women',
        columns: [
            {
                title: 'Topwear',
                items: [
                    { label: 'Tops', href: '/shop?category=women&sub=tops' },
                    { label: 'Kurtis', href: '/shop?category=women&sub=kurtis' },
                    { label: 'Blouses', href: '/shop?category=women&sub=blouses' },
                ],
            },
            {
                title: 'Bottomwear',
                items: [
                    { label: 'Jeans', href: '/shop?category=women&sub=jeans' },
                    { label: 'Palazzos', href: '/shop?category=women&sub=palazzos' },
                    { label: 'Leggings', href: '/shop?category=women&sub=leggings' },
                    { label: 'Skirts', href: '/shop?category=women&sub=skirts' },
                ],
            },
            {
                title: 'Ethnic Wear',
                items: [
                    { label: 'Sarees', href: '/shop?category=women&sub=sarees' },
                    { label: 'Silk Sarees', href: '/shop?category=women&sub=silk-sarees' },
                    { label: 'Cotton Sarees', href: '/shop?category=women&sub=cotton-sarees' },
                    { label: 'Designer Sarees', href: '/shop?category=women&sub=designer-sarees' },
                    { label: 'Wedding Sarees', href: '/shop?category=women&sub=wedding-sarees' },
                    { label: 'Salwar Suits', href: '/shop?category=women&sub=salwar-suits' },
                    { label: 'Lehenga', href: '/shop?category=women&sub=lehenga' },
                ],
            },
            {
                title: 'Dresses',
                items: [
                    { label: 'Casual Dresses', href: '/shop?category=women&sub=casual-dresses' },
                    { label: 'Party Wear', href: '/shop?category=women&sub=party-wear' },
                ],
            },
            {
                title: 'Dupattas & Shawls',
                items: [
                    { label: 'All Dupattas', href: '/shop?category=women&sub=dupattas' },
                ]
            },
            {
                title: 'Lingerie & Sleepwear',
                items: [
                    { label: 'Bras', href: '/shop?category=women&sub=bras' },
                    { label: 'Panties', href: '/shop?category=women&sub=panties' },
                    { label: 'Sleepwear', href: '/shop?category=women&sub=sleepwear' },
                ]
            },

        ],
    },
    {
        label: 'Kids',
        href: '/shop?category=kids',
        columns: [
            {
                title: 'Boys',
                items: [
                    { label: 'T-Shirts', href: '/shop?category=kids&sub=boys-t-shirts' },
                    { label: 'Ethnic Wear', href: '/shop?category=kids&sub=boys-ethnic' },
                    { label: 'Shorts', href: '/shop?category=kids&sub=boys-shorts' },
                    { label: 'Shirts', href: '/shop?category=kids&sub=boys-shirts' },
                    { label: 'Innerwear', href: '/shop?category=kids&sub=boys-innerwear' },
                ],
            },
            {
                title: 'Girls',
                items: [
                    { label: 'Dresses & Skirts', href: '/shop?category=kids&sub=girls-dresses-skirts' },
                    { label: 'Ethnic Wear', href: '/shop?category=kids&sub=girls-ethnic' },
                    { label: 'T-shirts & Tops', href: '/shop?category=kids&sub=girls-t-shirts-tops' },
                    { label: 'Innerwear', href: '/shop?category=kids&sub=girls-innerwear' },
                ],
            },
            {
                title: 'Baby Boys',
                items: [
                    { label: 'Combos Sets', href: '/shop?category=kids&sub=baby-boys-combos' },
                    { label: 'T-Shirts', href: '/shop?category=kids&sub=baby-boys-t-shirts' },
                    { label: 'Innerwear', href: '/shop?category=kids&sub=baby-boys-innerwear' },
                ],
            },
            {
                title: 'Baby Girls',
                items: [
                    { label: 'Combos Sets', href: '/shop?category=kids&sub=baby-girls-combos' },
                    { label: 'Dresses & Gowns', href: '/shop?category=kids&sub=baby-girls-dresses-gowns' },
                    { label: 'Innerwear', href: '/shop?category=kids&sub=baby-girls-innerwear' },
                ]
            }
        ],
    },
];
