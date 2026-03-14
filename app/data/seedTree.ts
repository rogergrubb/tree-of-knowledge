import { KnowledgeNode } from '../lib/ai'

export const ROOT_DATA: KnowledgeNode[] = [
  {name:"Logic & Reasoning",icon:"🧩",hue:38,sat:40,desc:"The bedrock of all knowledge — principles of valid thought",children:[
    {name:"Formal Logic",desc:"Symbolic systems of deduction and proof"},
    {name:"Critical Thinking",desc:"Evaluating claims, evidence, and sources"},
    {name:"Argumentation",desc:"Building and analyzing persuasive arguments"}
  ]},
  {name:"Mathematics",icon:"∑",hue:38,sat:40,desc:"The universal language of pattern, quantity, and structure",children:[
    {name:"Arithmetic",desc:"Numbers, operations, and their properties"},
    {name:"Algebra",desc:"Symbols, equations, and abstract structures"},
    {name:"Geometry",desc:"Shape, space, and spatial relationships"},
    {name:"Calculus",desc:"Change, limits, and continuous mathematics"},
    {name:"Statistics",desc:"Data, uncertainty, and inference"},
    {name:"Topology",desc:"Properties preserved under deformation"}
  ]},
  {name:"Philosophy",icon:"💭",hue:38,sat:40,desc:"Fundamental questions about existence, truth, and value",children:[
    {name:"Metaphysics",desc:"What is the nature of reality?"},
    {name:"Epistemology",desc:"What can we know and how?"},
    {name:"Ethics",desc:"What is right and what is good?"},
    {name:"Aesthetics",desc:"What is beauty?"},
    {name:"Philosophy of Science",desc:"How does science work?"}
  ]},
  {name:"Language",icon:"🗣",hue:38,sat:40,desc:"The tool that makes all knowledge transmissible",children:[
    {name:"Linguistics",desc:"Structure and rules of language"},
    {name:"Semiotics",desc:"Signs, symbols, and meaning"},
    {name:"Rhetoric",desc:"The art of persuasion"}
  ]}
]

export const BRANCH_DATA: KnowledgeNode[] = [
  {name:"Natural Sciences",hue:150,sat:55,icon:"🔬",desc:"Understanding the universe through observation and experiment",children:[
    {name:"Physics",icon:"⚛",desc:"Matter, energy, and fundamental forces",children:[
      {name:"Classical Mechanics",desc:"Forces and motion of everyday objects",children:[{name:"Statics",desc:"Forces on bodies at rest"},{name:"Dynamics",desc:"Motion, acceleration, and momentum"},{name:"Fluid Mechanics",desc:"Fluids at rest and in motion"}]},
      {name:"Quantum Mechanics",desc:"The strange world of atoms and particles",children:[{name:"Particle Physics",desc:"The tiniest building blocks of matter"},{name:"Quantum Computing",desc:"Computers using quantum effects"},{name:"Quantum Field Theory",desc:"QM meets special relativity"}]},
      {name:"Thermodynamics",desc:"Heat, energy, and entropy"},
      {name:"Electromagnetism",desc:"Electricity, magnetism, and light"},
      {name:"Relativity",desc:"Spacetime, gravity, and the speed of light"},
      {name:"Astrophysics",desc:"Physics of the cosmos",children:[{name:"Cosmology",desc:"Origin of the universe"},{name:"Stellar Evolution",desc:"Life of stars"},{name:"Exoplanets",desc:"Worlds around other stars"}]}
    ]},
    {name:"Chemistry",icon:"🧪",desc:"How substances combine, react, and transform",children:[
      {name:"Organic Chemistry",desc:"Carbon compounds — the chemistry of life"},
      {name:"Inorganic Chemistry",desc:"Metals, minerals, and non-carbon"},
      {name:"Biochemistry",desc:"Chemistry inside living things"},
      {name:"Materials Science",desc:"Designing useful new materials"}
    ]},
    {name:"Biology",icon:"🧬",desc:"The science of living things",children:[
      {name:"Genetics",desc:"DNA and heredity",children:[{name:"Genomics",desc:"Reading and mapping genomes"},{name:"Gene Editing",desc:"CRISPR precision modification"},{name:"Epigenetics",desc:"Gene expression changes"}]},
      {name:"Evolution",desc:"How species change over time"},
      {name:"Ecology",desc:"Organisms and environments"},
      {name:"Neuroscience",desc:"Brain and nervous system",children:[{name:"Cognitive Science",desc:"How the mind thinks"},{name:"Neuroplasticity",desc:"The brain rewiring itself"}]},
      {name:"Microbiology",desc:"Tiny organisms"},
      {name:"Botany",desc:"Plant biology"},
      {name:"Zoology",desc:"Animal biology"}
    ]},
    {name:"Earth Science",icon:"🌍",desc:"Our planet's systems",children:[
      {name:"Geology",desc:"Rocks and tectonics"},{name:"Oceanography",desc:"The oceans"},{name:"Meteorology",desc:"Weather and storms"},{name:"Climate Science",desc:"Global warming"},{name:"Paleontology",desc:"Fossils and ancient life"}
    ]},
    {name:"Astronomy",icon:"🔭",desc:"Beyond Earth",children:[
      {name:"Solar System",desc:"Sun, planets, moons"},{name:"Stars & Galaxies",desc:"Cosmic structures"},{name:"Cosmology",desc:"Big Bang and beyond"}
    ]}
  ]},
  {name:"Technology",hue:250,sat:50,icon:"💻",desc:"Building tools, machines, and systems",children:[
    {name:"Computer Science",icon:"🖥",desc:"Computation and information",children:[
      {name:"Programming",desc:"Writing instructions for computers"},
      {name:"Artificial Intelligence",desc:"Machines that think and learn",children:[{name:"Machine Learning",desc:"Learning from data"},{name:"NLP",desc:"Understanding language"},{name:"Computer Vision",desc:"Seeing and interpreting"},{name:"Agentic AI",desc:"Autonomous AI systems"}]},
      {name:"Cybersecurity",desc:"Protecting systems and data"},
      {name:"Data Science",desc:"Extracting insights from data"},
      {name:"Web Development",desc:"Building websites and apps"}
    ]},
    {name:"Engineering",icon:"🔧",desc:"Designing and building",children:[
      {name:"Civil",desc:"Roads, bridges, buildings"},{name:"Mechanical",desc:"Machines and engines"},{name:"Electrical",desc:"Circuits and power"},{name:"Aerospace",desc:"Aircraft and spacecraft"},{name:"Biomedical",desc:"Medical devices"}
    ]},
    {name:"Energy",icon:"⚡",desc:"Powering civilization",children:[
      {name:"Solar",desc:"Energy from sunlight"},{name:"Wind",desc:"Turbine power"},{name:"Nuclear",desc:"Atomic energy"},{name:"Batteries",desc:"Energy storage"}
    ]},
    {name:"Space Tech",icon:"🚀",desc:"Beyond Earth",children:[
      {name:"Rocketry",desc:"Propulsion and launch"},{name:"Satellites",desc:"Orbital systems"},{name:"Exploration",desc:"Moon, Mars, beyond"}
    ]}
  ]},
  {name:"Medicine",hue:320,sat:50,icon:"❤",desc:"Understanding, preventing, and treating disease",children:[
    {name:"Human Body",icon:"🫀",desc:"How our bodies work",children:[{name:"Anatomy",desc:"Body structure"},{name:"Physiology",desc:"How systems function"},{name:"Immunology",desc:"Body defenses"}]},
    {name:"Medical Practice",icon:"🏥",desc:"Diagnosis and treatment",children:[{name:"Surgery",desc:"Operative treatment"},{name:"Cardiology",desc:"Heart health"},{name:"Oncology",desc:"Cancer treatment"},{name:"Pediatrics",desc:"Children's health"}]},
    {name:"Mental Health",icon:"🧠",desc:"Mind and wellbeing",children:[{name:"Anxiety & Depression",desc:"Common challenges"},{name:"Addiction & Recovery",desc:"Overcoming dependence"},{name:"Therapy",desc:"Evidence-based support"}]},
    {name:"Public Health",icon:"🌡",desc:"Population health",children:[{name:"Epidemiology",desc:"Disease tracking"},{name:"Nutrition",desc:"Food and health"},{name:"Global Health",desc:"Worldwide challenges"}]},
    {name:"Pharmacology",icon:"💊",desc:"Medicines and drugs",children:[{name:"Drug Discovery",desc:"Finding treatments"},{name:"Vaccines",desc:"Preventing disease"}]}
  ]},
  {name:"Humanities",hue:25,sat:60,icon:"📖",desc:"Human experience — stories, ideas, and cultures",children:[
    {name:"History",icon:"📜",desc:"Story of civilization",children:[{name:"Ancient",desc:"Egypt, Greece, Rome"},{name:"Medieval",desc:"Knights and plagues"},{name:"Modern",desc:"Revolutions to present"},{name:"Archaeology",desc:"Digging up the past"}]},
    {name:"Literature",icon:"✒",desc:"Great written works",children:[{name:"Poetry",desc:"Rhythm and image"},{name:"Fiction",desc:"Imagined worlds"},{name:"Mythology",desc:"Origin stories"},{name:"Drama",desc:"Plays and performance"}]},
    {name:"Religion",icon:"☸",desc:"Spiritual traditions",children:[{name:"Christianity",desc:"Teachings of Jesus"},{name:"Islam",desc:"Following the Prophet"},{name:"Buddhism",desc:"Path to enlightenment"},{name:"Hinduism",desc:"Dharma and karma"}]},
    {name:"Languages",icon:"🌐",desc:"Human communication",children:[{name:"Language Families",desc:"How languages relate"},{name:"Etymology",desc:"Where words come from"},{name:"Translation",desc:"Bridging languages"}]}
  ]},
  {name:"Arts",hue:42,sat:75,icon:"🎨",desc:"Human imagination made real",children:[
    {name:"Visual Arts",icon:"🖼",desc:"Art you see",children:[{name:"Painting",desc:"Pigment on surfaces"},{name:"Sculpture",desc:"3D art"},{name:"Photography",desc:"Capturing light"},{name:"Digital Art",desc:"Tech-created art"}]},
    {name:"Music",icon:"🎵",desc:"Organized sound",children:[{name:"Theory",desc:"Scales and chords"},{name:"Instruments",desc:"Piano, guitar, more"},{name:"Composition",desc:"Writing music"},{name:"Production",desc:"Recording and mixing"}]},
    {name:"Performing",icon:"🎭",desc:"Live performance",children:[{name:"Theater",desc:"Acting and stagecraft"},{name:"Dance",desc:"Movement as art"},{name:"Film",desc:"Moving pictures"}]},
    {name:"Design",icon:"✏",desc:"Applied creativity",children:[{name:"Graphic",desc:"Visual communication"},{name:"Architecture",desc:"Buildings and spaces"},{name:"Fashion",desc:"Wearable art"},{name:"Games",desc:"Interactive entertainment"}]}
  ]},
  {name:"Social Sciences",hue:140,sat:45,icon:"👥",desc:"How humans behave, organize, and trade",children:[
    {name:"Psychology",icon:"🧠",desc:"Mind and behavior",children:[{name:"Cognition",desc:"Thinking and learning"},{name:"Development",desc:"Growth across lifespan"},{name:"Social",desc:"Influence and groups"},{name:"Wellness",desc:"Mental health"}]},
    {name:"Economics",icon:"📈",desc:"Resources and markets",children:[{name:"Markets",desc:"Supply and demand"},{name:"Money & Banking",desc:"Currency systems"},{name:"Global Trade",desc:"International exchange"},{name:"Personal Finance",desc:"Budgeting and investing"}]},
    {name:"Government",icon:"⚖",desc:"Power and governance",children:[{name:"Democracy",desc:"Government by the people"},{name:"Law",desc:"Rules and justice"},{name:"International Relations",desc:"Between nations"},{name:"Human Rights",desc:"Universal rights"}]},
    {name:"Sociology",icon:"🏘",desc:"Society and culture",children:[{name:"Culture",desc:"Shared beliefs"},{name:"Cities",desc:"Urbanization"},{name:"Education",desc:"Teaching systems"}]},
    {name:"Geography",icon:"🗺",desc:"Places and landscapes",children:[{name:"Physical",desc:"Mountains and rivers"},{name:"Human",desc:"Where people live"},{name:"Cartography",desc:"Mapmaking"}]}
  ]}
]

export const SEED_TREE: KnowledgeNode = {
  name: "All Knowledge",
  desc: "The totality of human understanding",
  children: [
    { name: "Foundations (Roots)", children: ROOT_DATA, desc: "The deep roots from which all knowledge grows", isRoot: true },
    ...BRANCH_DATA
  ]
}
