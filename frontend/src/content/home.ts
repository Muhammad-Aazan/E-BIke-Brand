import { brand } from '@/config/brand';

export const metrics = [
  { value: '220', unit: 'MI', caption: 'Go further.' },
  { value: '2.9', unit: 'SEC', caption: '0–60. Feel everything.' },
  { value: '105', unit: 'KW', caption: 'Power, without the noise.' },
  { value: '30', unit: 'MIN', caption: '20–80% DC charging.' },
];

export const principles = [
  { n: '01', title: 'Power in its purest form', text: '105 kW of instant, linear power. A belt drive that trades maintenance for miles.' },
  { n: '02', title: 'Built around you', text: 'A low centre of gravity, adjustable suspension, and a riding position that feels instinctive.' },
  { n: '03', title: 'Connected. Not distracted.', text: 'Navigation, ride modes, and charge status. The information you need, nothing you don’t.' },
];

export const stories = [
  { meta: 'ROUTES / 6 MIN READ', title: 'The long way home.', text: 'A quiet morning on California’s Pacific Coast Highway.', src: '/images/home/journal-1-d.png', mobileSrc: '/images/home/journal-1-m.png' },
  { meta: 'CRAFT / 4 MIN READ', title: 'Made with intention.', text: `Inside the atelier. Meet the hands behind your ${brand.name}.`, src: '/images/home/journal-2-d.png', mobileSrc: '/images/home/journal-2-m.png' },
  { meta: 'OWNERSHIP / 5 MIN READ', title: 'Your first electric mile.', text: 'Everything you need to know. Nothing you don’t.', src: '/images/home/journal-3-d.png', mobileSrc: '/images/home/journal-3-m.png' },
];

// Sample testimonial copied from the Figma design – replace with a real, verifiable quote before launch.
export const quote = {
  lines: ['“It doesn’t ask you to forget', 'everything you love about riding.'],
  last: 'It reminds you why you started.”',
  by: `ELLIOT HAYES · ${brand.upper} OWNER, ${brand.city.toUpperCase()}`,
};
