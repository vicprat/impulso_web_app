import { Client } from '@notionhq/client'

// Initialize Notion client
export const notion = new Client({
  auth: process.env.NEXT_PUBLIC_NOTION_API_KEY,
})

// Page IDs
export const PAGES = {
  HOME: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_HOME as string,
  MEMBERSHIP: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_MEMBERSHIP as string,
  SERVICES: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_SERVICES as string,
  TERMS: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_TERMS as string,
}

export function getRichTextPlain(richText: any[]): string {
  return richText?.map((t) => t.plain_text).join('') || ''
}
export function getFileUrl(property: any): string {
  if (!property) return ''

  if (property.type === 'url') {
    return property.url || ''
  }

  if (property.type === 'files') {
    const file = property.files?.[0]
    if (!file) return ''
    return file.type === 'external' ? file.external.url : file.file.url
  }

  return ''
}

export async function getChildDatabases(pageId: string) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
  })

  return response.results.filter((block: any) => block.type === 'child_database')
}

export async function queryDatabase(databaseId: string) {
  const db = (await notion.databases.retrieve({ database_id: databaseId })) as any
  const dataSourceId = db.data_sources?.[0]?.id

  if (!dataSourceId) {
    throw new Error(`Data source not found for database ${databaseId}`)
  }

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
  })

  return response.results
}
