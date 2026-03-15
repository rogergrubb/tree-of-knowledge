export interface TreeNode {
  path: string
  label: string
  description?: string
  children?: TreeNode[]
}

export const KNOWLEDGE_TREE: TreeNode[] = [
  {
    path: 'natural-sciences', label: 'Natural Sciences',
    description: 'Understanding the universe through observation and experiment',
    children: [
      { path: 'physics', label: 'Physics', description: 'Matter, energy, and fundamental forces', children: [
        { path: 'quantum-mechanics', label: 'Quantum Mechanics', description: 'The behavior of matter at atomic and subatomic scales' },
        { path: 'classical-mechanics', label: 'Classical Mechanics', description: 'Motion, forces, and energy in everyday-scale systems' },
        { path: 'thermodynamics', label: 'Thermodynamics', description: 'Heat, energy transfer, and entropy' },
        { path: 'electromagnetism', label: 'Electromagnetism', description: 'Electric and magnetic fields and their interactions' },
        { path: 'relativity', label: 'Relativity', description: 'Space, time, and gravity at extreme scales' },
        { path: 'astrophysics', label: 'Astrophysics', description: 'Physics of stars, galaxies, and the cosmos' },
        { path: 'particle-physics', label: 'Particle Physics', description: 'Fundamental particles and their interactions' },
        { path: 'optics', label: 'Optics', description: 'The behavior and properties of light' },
      ]},
      { path: 'chemistry', label: 'Chemistry', description: 'How substances combine, react, and transform', children: [
        { path: 'organic-chemistry', label: 'Organic Chemistry', description: 'Carbon-based compounds and their reactions' },
        { path: 'inorganic-chemistry', label: 'Inorganic Chemistry', description: 'Non-carbon compounds and metals' },
        { path: 'biochemistry', label: 'Biochemistry', description: 'Chemistry of living organisms' },
        { path: 'physical-chemistry', label: 'Physical Chemistry', description: 'Physical principles underlying chemical systems' },
        { path: 'analytical-chemistry', label: 'Analytical Chemistry', description: 'Methods for identifying and quantifying substances' },
      ]},
      { path: 'biology', label: 'Biology', description: 'Living organisms and life processes', children: [
        { path: 'genetics', label: 'Genetics', description: 'Heredity, genes, and DNA' },
        { path: 'evolution', label: 'Evolution', description: 'How species change over time' },
        { path: 'ecology', label: 'Ecology', description: 'Organisms and their environments' },
        { path: 'microbiology', label: 'Microbiology', description: 'Microscopic organisms' },
        { path: 'neuroscience', label: 'Neuroscience', description: 'The brain and nervous system' },
        { path: 'cell-biology', label: 'Cell Biology', description: 'Structure and function of cells' },
        { path: 'zoology', label: 'Zoology', description: 'The study of animals' },
        { path: 'botany', label: 'Botany', description: 'The study of plants' },
        { path: 'marine-biology', label: 'Marine Biology', description: 'Life in oceans and aquatic environments' },
      ]},
      { path: 'earth-science', label: 'Earth Science', description: 'Understanding our planet\'s systems', children: [
        { path: 'geology', label: 'Geology', description: 'Earth\'s rocks, minerals, and structure' },
        { path: 'meteorology', label: 'Meteorology', description: 'Weather and atmospheric science' },
        { path: 'oceanography', label: 'Oceanography', description: 'The world\'s oceans' },
        { path: 'astronomy', label: 'Astronomy', description: 'Stars, planets, and the universe' },
        { path: 'climate-science', label: 'Climate Science', description: 'Earth\'s climate systems and change' },
        { path: 'paleontology', label: 'Paleontology', description: 'Fossils and ancient life' },
      ]},
    ],
  },
  {
    path: 'technology', label: 'Technology',
    description: 'Tools, systems, and innovations that shape our world',
    children: [
      { path: 'computer-science', label: 'Computer Science', description: 'Computation, algorithms, and information', children: [
        { path: 'artificial-intelligence', label: 'Artificial Intelligence', description: 'Machines that learn and reason' },
        { path: 'algorithms', label: 'Algorithms', description: 'Step-by-step computational procedures' },
        { path: 'programming', label: 'Programming', description: 'Writing instructions for computers' },
        { path: 'cybersecurity', label: 'Cybersecurity', description: 'Protecting digital systems and data' },
        { path: 'databases', label: 'Databases', description: 'Storing and organizing data' },
        { path: 'networking', label: 'Networking', description: 'Computer networks and communication' },
        { path: 'web-development', label: 'Web Development', description: 'Building websites and web applications' },
      ]},
      { path: 'engineering', label: 'Engineering', description: 'Designing and building solutions', children: [
        { path: 'mechanical-engineering', label: 'Mechanical Engineering', description: 'Machines and mechanical systems' },
        { path: 'electrical-engineering', label: 'Electrical Engineering', description: 'Electrical systems and electronics' },
        { path: 'civil-engineering', label: 'Civil Engineering', description: 'Infrastructure and construction' },
        { path: 'aerospace-engineering', label: 'Aerospace Engineering', description: 'Aircraft and spacecraft' },
        { path: 'biomedical-engineering', label: 'Biomedical Engineering', description: 'Engineering for healthcare' },
        { path: 'chemical-engineering', label: 'Chemical Engineering', description: 'Industrial chemical processes' },
      ]},
      { path: 'energy', label: 'Energy', description: 'Powering civilization', children: [
        { path: 'solar-energy', label: 'Solar Energy', description: 'Energy from sunlight' },
        { path: 'nuclear-energy', label: 'Nuclear Energy', description: 'Atomic power generation' },
        { path: 'wind-energy', label: 'Wind Energy', description: 'Wind turbine power' },
        { path: 'batteries', label: 'Batteries', description: 'Energy storage technology' },
      ]},
    ],
  },
  {
    path: 'medicine', label: 'Medicine',
    description: 'The science and practice of healing',
    children: [
      { path: 'anatomy', label: 'Anatomy', description: 'Structure of the human body' },
      { path: 'pharmacology', label: 'Pharmacology', description: 'How drugs affect the body' },
      { path: 'pathology', label: 'Pathology', description: 'The study of disease' },
      { path: 'surgery', label: 'Surgery', description: 'Operative medical procedures' },
      { path: 'public-health', label: 'Public Health', description: 'Population-level health and prevention' },
      { path: 'immunology', label: 'Immunology', description: 'The immune system and its function' },
      { path: 'psychiatry', label: 'Psychiatry', description: 'Mental health and disorders' },
      { path: 'cardiology', label: 'Cardiology', description: 'The heart and cardiovascular system' },
      { path: 'neurology', label: 'Neurology', description: 'Nervous system disorders' },
      { path: 'oncology', label: 'Oncology', description: 'Cancer diagnosis and treatment' },
      { path: 'pediatrics', label: 'Pediatrics', description: 'Children\'s health and medicine' },
    ],
  },
  {
    path: 'humanities', label: 'Humanities',
    description: 'Human culture, expression, and experience',
    children: [
      { path: 'history', label: 'History', description: 'The study of past events and civilizations', children: [
        { path: 'ancient-history', label: 'Ancient History', description: 'Civilizations of the ancient world' },
        { path: 'medieval-history', label: 'Medieval History', description: 'The Middle Ages' },
        { path: 'modern-history', label: 'Modern History', description: 'The modern era' },
        { path: 'american-history', label: 'American History', description: 'History of the United States' },
        { path: 'world-wars', label: 'World Wars', description: 'The global conflicts of the 20th century' },
      ]},
      { path: 'literature', label: 'Literature', description: 'Written works and literary analysis' },
      { path: 'linguistics', label: 'Linguistics', description: 'The scientific study of language' },
      { path: 'art-history', label: 'Art History', description: 'Visual arts through the ages' },
      { path: 'religious-studies', label: 'Religious Studies', description: 'The world\'s religions and belief systems' },
      { path: 'philosophy', label: 'Philosophy', description: 'Fundamental questions about existence and knowledge', children: [
        { path: 'ethics', label: 'Ethics', description: 'What is right and what is good' },
        { path: 'metaphysics', label: 'Metaphysics', description: 'The nature of reality' },
        { path: 'epistemology', label: 'Epistemology', description: 'What can we know and how' },
        { path: 'logic', label: 'Logic', description: 'Principles of valid reasoning' },
        { path: 'aesthetics', label: 'Aesthetics', description: 'The nature of beauty and art' },
      ]},
    ],
  },
  {
    path: 'social-sciences', label: 'Social Sciences',
    description: 'Understanding human society and behavior',
    children: [
      { path: 'psychology', label: 'Psychology', description: 'The mind and human behavior' },
      { path: 'sociology', label: 'Sociology', description: 'Society, social structures, and institutions' },
      { path: 'economics', label: 'Economics', description: 'Production, distribution, and consumption of goods' },
      { path: 'political-science', label: 'Political Science', description: 'Government, power, and political systems' },
      { path: 'anthropology', label: 'Anthropology', description: 'Human cultures and societies' },
      { path: 'geography', label: 'Geography', description: 'Earth\'s landscapes, peoples, and places' },
      { path: 'education', label: 'Education', description: 'Teaching, learning, and educational systems' },
    ],
  },
  {
    path: 'arts', label: 'Arts',
    description: 'Creative expression and human imagination',
    children: [
      { path: 'visual-arts', label: 'Visual Arts', description: 'Painting, sculpture, and visual expression' },
      { path: 'music', label: 'Music', description: 'Sound organized into melody, harmony, and rhythm' },
      { path: 'film', label: 'Film', description: 'Cinema and moving pictures' },
      { path: 'theater', label: 'Theater', description: 'Live performance and dramatic arts' },
      { path: 'dance', label: 'Dance', description: 'Movement as artistic expression' },
      { path: 'architecture', label: 'Architecture', description: 'Designing buildings and spaces' },
      { path: 'photography', label: 'Photography', description: 'Capturing images with light' },
      { path: 'graphic-design', label: 'Graphic Design', description: 'Visual communication and layout' },
    ],
  },
  {
    path: 'mathematics', label: 'Mathematics',
    description: 'The universal language of pattern, quantity, and structure',
    children: [
      { path: 'algebra', label: 'Algebra', description: 'Symbols, equations, and abstract structures' },
      { path: 'calculus', label: 'Calculus', description: 'Change, limits, and continuous mathematics' },
      { path: 'statistics', label: 'Statistics', description: 'Data, probability, and inference' },
      { path: 'geometry', label: 'Geometry', description: 'Shape, space, and spatial relationships' },
      { path: 'number-theory', label: 'Number Theory', description: 'Properties of integers and prime numbers' },
      { path: 'topology', label: 'Topology', description: 'Properties preserved under continuous deformation' },
      { path: 'linear-algebra', label: 'Linear Algebra', description: 'Vectors, matrices, and linear transformations' },
    ],
  },
]

export function findNode(tree: TreeNode[], pathSegments: string[]): TreeNode | null {
  if (pathSegments.length === 0) return null
  const [first, ...rest] = pathSegments
  const node = tree.find(n => n.path === first)
  if (!node) return null
  if (rest.length === 0) return node
  if (!node.children) return null
  return findNode(node.children, rest)
}

function flattenTreeHelper(nodes: TreeNode[], parentPath: string = ''): string[] {
  const urls: string[] = []
  for (const node of nodes) {
    const fullPath = parentPath ? `${parentPath}/${node.path}` : node.path
    urls.push(fullPath)
    if (node.children) urls.push(...flattenTreeHelper(node.children, fullPath))
  }
  return urls
}

export function flattenAllPaths(): string[] {
  return flattenTreeHelper(KNOWLEDGE_TREE)
}
