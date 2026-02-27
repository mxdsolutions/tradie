import {
    WrenchScrewdriverIcon,
    BoltIcon,
    HomeModernIcon,
    PaintBrushIcon,
    SparklesIcon,
    BuildingStorefrontIcon,
    ExclamationTriangleIcon,
} from 'react-native-heroicons/outline';

export const TRADE_CATEGORIES = [
    { id: 'Plumbing', icon: WrenchScrewdriverIcon, requiredLicenses: ['Plumbing License'] },
    { id: 'Electrical', icon: BoltIcon, requiredLicenses: ['Electrical Contractor License'] },
    { id: 'Carpentry', icon: HomeModernIcon, requiredLicenses: ['Carpentry Trade License or Builder License'] },
    { id: 'Painting', icon: PaintBrushIcon, requiredLicenses: ['Painting Contractor License'] },
    { id: 'Landscaping', icon: SparklesIcon, requiredLicenses: ['Structural Landscaping License (if applicable)'] },
    { id: 'Tiling', icon: BuildingStorefrontIcon, requiredLicenses: ['Wall and Floor Tiling License'] },
    { id: 'Roofing', icon: HomeModernIcon, requiredLicenses: ['Roof Plumbing/Tiling License'] },
    { id: 'Fencing', icon: BuildingStorefrontIcon, requiredLicenses: ['Fencing License (if required)'] },
    { id: 'Concreting', icon: WrenchScrewdriverIcon, requiredLicenses: ['Concreting License'] },
    { id: 'Demolition', icon: ExclamationTriangleIcon, requiredLicenses: ['Demolition License'] },
    { id: 'Cleaning', icon: SparklesIcon, requiredLicenses: [] }, // Often no specific trade license
    { id: 'General', icon: WrenchScrewdriverIcon, requiredLicenses: [] },
];

export const AUSTRALIAN_STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
