const TECHNIQUE_CATEGORIES = [
  {
    keywords: ['acrílico', 'acrilico'],
    name: 'Acrílico',
  },
  {
    keywords: ['óleo', 'oleo'],
    name: 'Óleo',
  },
  {
    keywords: ['fotografía', 'fotografia'],
    name: 'Fotografía',
  },
  {
    keywords: ['grabado', 'impronta de grabado', 'linograbado', 'xilografía', 'xilografia'],
    name: 'Grabado',
  },
  {
    keywords: ['escultura', 'bronce', 'acero', 'cerámica', 'ceramica', 'resina', 'fibra de vidrio'],
    name: 'Escultura',
  },
  {
    keywords: ['acuarela'],
    name: 'Acuarela',
  },
  {
    keywords: ['mixta', 'técnicas mixtas', 'tecnicas mixtas'],
    name: 'Mixta',
  },
  {
    keywords: ['grafito', 'lápiz', 'lapiz'],
    name: 'Grafito',
  },
  {
    keywords: ['pastel', 'gis pastel'],
    name: 'Pastel',
  },
  {
    keywords: ['carboncillo'],
    name: 'Carboncillo',
  },
  {
    keywords: ['tinta', 'tinta china'],
    name: 'Tinta',
  },
  {
    keywords: ['serigrafía', 'serigrafia'],
    name: 'Serigrafía',
  },
  {
    keywords: ['giclée', 'giclee'],
    name: 'Giclée',
  },
  {
    keywords: ['collage'],
    name: 'Collage',
  },
  {
    keywords: ['gouache'],
    name: 'Gouache',
  },
  {
    keywords: ['litografía', 'litografia'],
    name: 'Litografía',
  },
  {
    keywords: ['encausto'],
    name: 'Encausto',
  },
  {
    keywords: ['sanguina'],
    name: 'Sanguina',
  },
  {
    keywords: ['gráfica digital', 'grafica digital', 'impresión digital', 'impresion digital'],
    name: 'Gráfica Digital',
  },
  {
    keywords: ['aerosol', 'aerografía', 'aerografia', 'airbrush'],
    name: 'Aerosol',
  },
  {
    keywords: ['esmalte', 'esmalte automotriz'],
    name: 'Esmalte',
  },
] as const

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function normalizeTechniqueCategory(techniqueName: string): string | null {
  const normalized = normalizeText(techniqueName)
  const matches: { category: string; keywordLength: number; position: number }[] = []

  for (const category of TECHNIQUE_CATEGORIES) {
    for (const keyword of category.keywords) {
      const normalizedKeyword = normalizeText(keyword)
      const position = normalized.indexOf(normalizedKeyword)
      if (position !== -1) {
        matches.push({
          category: category.name,
          keywordLength: normalizedKeyword.length,
          position,
        })
      }
    }
  }

  if (matches.length === 0) return null

  matches.sort((a, b) => {
    if (a.keywordLength !== b.keywordLength) {
      return b.keywordLength - a.keywordLength
    }
    return a.position - b.position
  })

  return matches[0].category
}

export function expandCategoryToTechniques(category: string, allTechniques: string[]): string[] {
  const normalizedCategory = normalizeText(category)

  const categoryConfig = TECHNIQUE_CATEGORIES.find(
    (cat) => normalizeText(cat.name) === normalizedCategory
  )

  if (!categoryConfig) {
    return []
  }

  const matchingTechniques: string[] = []

  for (const technique of allTechniques) {
    const techniqueCategory = normalizeTechniqueCategory(technique)
    if (techniqueCategory && normalizeText(techniqueCategory) === normalizedCategory) {
      matchingTechniques.push(technique)
    }
  }

  return matchingTechniques
}

export function getTechniqueCategories(): string[] {
  return TECHNIQUE_CATEGORIES.map((cat) => cat.name)
}

export function getAllTechniquesForCategories(
  categories: string[],
  allTechniques: string[]
): string[] {
  const expandedTechniques = new Set<string>()

  for (const category of categories) {
    const techniques = expandCategoryToTechniques(category, allTechniques)
    techniques.forEach((tech) => expandedTechniques.add(tech))
  }

  return Array.from(expandedTechniques)
}
