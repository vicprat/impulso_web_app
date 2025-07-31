import { makeAdminApiRequest } from './shopifyAdmin'

interface WebhookConfig {
  topic: string
  address: string
  format: 'JSON' | 'XML'
}

interface WebhookResponse {
  webhook: {
    id: string
    topic: string
    address: string
    format: string
  }
}

interface WebhookSubscriptionCreateResponse {
  data?: {
    webhookSubscriptionCreate?: {
      userErrors?: { field: string[]; message: string }[]
      webhookSubscription?: any
    }
  }
}

interface WebhookListResponse {
  data?: {
    webhookSubscriptions?: {
      edges?: { node: any }[]
    }
  }
}

interface WebhookSubscriptionDeleteResponse {
  data?: {
    webhookSubscriptionDelete?: {
      userErrors?: { field: string[]; message: string }[]
      deletedWebhookSubscriptionId?: string
    }
  }
}

export class ShopifyWebhookService {
  private static readonly WEBHOOKS: WebhookConfig[] = [
    {
      topic: 'products/update',
      address: `${process.env.NEXTAUTH_URL}/api/webhooks/shopify/products`,
      format: 'JSON',
    },
    {
      topic: 'inventory_levels/update',
      address: `${process.env.NEXTAUTH_URL}/api/webhooks/shopify/inventory`,
      format: 'JSON',
    },
    {
      topic: 'orders/create',
      address: `${process.env.NEXTAUTH_URL}/api/webhooks/shopify`,
      format: 'JSON',
    },
  ]

  static async setupWebhooks(): Promise<void> {
    try {
      console.log('🔄 Configurando webhooks de Shopify...')

      for (const webhookConfig of this.WEBHOOKS) {
        await this.createWebhook(webhookConfig)
      }

      console.log('✅ Webhooks configurados exitosamente')
    } catch (error) {
      console.error('❌ Error configurando webhooks:', error)
      throw error
    }
  }

  private static async createWebhook(config: WebhookConfig): Promise<void> {
    const mutation = `
      mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          webhookSubscription {
            id
            topic
            endpoint {
              __typename
              ... on WebhookHttpEndpoint {
                callbackUrl
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      topic: config.topic,
      webhookSubscription: {
        callbackUrl: config.address,
        format: config.format,
      },
    }

    try {
      const response: WebhookSubscriptionCreateResponse =
        await makeAdminApiRequest(mutation, variables)

      const userErrors =
        response.data?.webhookSubscriptionCreate?.userErrors || []

      if (userErrors.length > 0) {
        console.warn(`⚠️ Advertencias al crear webhook ${config.topic}:`, userErrors)
      } else {
        console.log(`✅ Webhook ${config.topic} configurado`)
      }
    } catch (error) {
      console.error(`❌ Error creando webhook ${config.topic}:`, error)
      throw error
    }
  }

  static async listWebhooks(): Promise<any[]> {
    const query = `
      query {
        webhookSubscriptions(first: 50) {
          edges {
            node {
              id
              topic
              endpoint {
                __typename
                ... on WebhookHttpEndpoint {
                  callbackUrl
                }
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `

    try {
      const response: WebhookListResponse = await makeAdminApiRequest(query)
      return (
        response.data?.webhookSubscriptions?.edges?.map((edge: any) => edge.node) ||
        []
      )
    } catch (error) {
      console.error('❌ Error listando webhooks:', error)
      throw error
    }
  }

  static async deleteWebhook(webhookId: string): Promise<void> {
    const mutation = `
      mutation webhookSubscriptionDelete($id: ID!) {
        webhookSubscriptionDelete(input: { id: $id }) {
          deletedWebhookSubscriptionId
          userErrors {
            field
            message
          }
        }
      }
    `

    try {
      const response: WebhookSubscriptionDeleteResponse =
        await makeAdminApiRequest(mutation, { id: webhookId })

      const userErrors =
        response.data?.webhookSubscriptionDelete?.userErrors || []

      if (userErrors.length > 0) {
        console.warn('⚠️ Advertencias al eliminar webhook:', userErrors)
      } else {
        console.log(`✅ Webhook ${webhookId} eliminado`)
      }
    } catch (error) {
      console.error('❌ Error eliminando webhook:', error)
      throw error
    }
  }

  static async cleanupOldWebhooks(): Promise<void> {
    try {
      const webhooks = await this.listWebhooks()
      const appUrl = process.env.NEXTAUTH_URL

      for (const webhook of webhooks) {
        const callbackUrl = webhook.endpoint?.callbackUrl
        if (callbackUrl && callbackUrl.startsWith(appUrl)) {
          console.log(`🗑️ Eliminando webhook antiguo: ${webhook.topic}`)
          await this.deleteWebhook(webhook.id)
        }
      }
    } catch (error) {
      console.error('❌ Error limpiando webhooks antiguos:', error)
      throw error
    }
  }
} 