// src/components/Debug/GraphQLDebugger.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertCircle, Copy, Play } from 'lucide-react';
import { cartApi } from '@/modules/customer/cart-api';

export function GraphQLDebugger() {
  const [testResults, setTestResults] = useState<{
    connection?: { success: boolean; error?: string; endpoint?: string };
    introspection?: any;
    customerQuery?: any;
    loading: boolean;
  }>({ loading: false });

  const runConnectionTest = async () => {
    setTestResults({ loading: true });
    
    try {
      const connectionResult = await cartApi.testConnection();
      
      // Test introspection query
      let introspectionResult;
      try {
        const response = await fetch('/api/customer/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              query IntrospectionQuery {
                __schema {
                  queryType { name }
                  mutationType { name }
                  types {
                    name
                    kind
                    fields {
                      name
                      type { name }
                    }
                  }
                }
              }
            `
          }),
        });
        
        if (response.ok) {
          introspectionResult = await response.json();
        } else {
          introspectionResult = { error: `Status: ${response.status}` };
        }
      } catch (error) {
        introspectionResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
      
      // Test customer query
      let customerQueryResult;
      try {
        const response = await fetch('/api/customer/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            query: `
              query TestCustomer {
                customer {
                  id
                  email
                }
              }
            `
          }),
        });
        
        if (response.ok) {
          customerQueryResult = await response.json();
        } else {
          customerQueryResult = { error: `Status: ${response.status}` };
        }
      } catch (error) {
        customerQueryResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
      
      setTestResults({
        connection: connectionResult,
        introspection: introspectionResult,
        customerQuery: customerQueryResult,
        loading: false
      });
    } catch (error) {
      setTestResults({
        connection: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
        loading: false
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getAvailableTypes = () => {
    if (!testResults.introspection?.data?.__schema?.types) return [];
    
    return testResults.introspection.data.__schema.types
      .filter((type: any) => !type.name.startsWith('__'))
      .map((type: any) => ({
        name: type.name,
        kind: type.kind,
        fields: type.fields || []
      }));
  };

  const hasCartTypes = () => {
    const types = getAvailableTypes();
    return types.some((type: any) => 
      type.name === 'Cart' || 
      type.name === 'CartInput' || 
      type.name.includes('Cart')
    );
  };

  const hasShopifyTypes = () => {
    const types = getAvailableTypes();
    return types.some((type: any) => 
      type.name === 'Product' || 
      type.name === 'ProductVariant' || 
      type.name === 'Customer'
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            GraphQL Endpoint Debugger
          </CardTitle>
          <CardDescription>
            Debug your GraphQL endpoint to understand why cart operations are failing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runConnectionTest} disabled={testResults.loading} className="mb-4">
            <Play className="mr-2 h-4 w-4" />
            {testResults.loading ? 'Testing...' : 'Run Diagnostic Tests'}
          </Button>

          {testResults.connection && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="schema">Schema</TabsTrigger>
                <TabsTrigger value="queries">Test Queries</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid gap-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Endpoint:</strong> /api/customer/graphql
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center gap-2">
                    {testResults.connection.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Connection Status</span>
                    <Badge variant={testResults.connection.success ? "default" : "destructive"}>
                      {testResults.connection.success ? "Connected" : "Failed"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasShopifyTypes() ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Shopify Types Available</span>
                    <Badge variant={hasShopifyTypes() ? "default" : "destructive"}>
                      {hasShopifyTypes() ? "Yes" : "No"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasCartTypes() ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Cart Types Available</span>
                    <Badge variant={hasCartTypes() ? "default" : "destructive"}>
                      {hasCartTypes() ? "Yes" : "No"}
                    </Badge>
                  </div>

                  {testResults.connection.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <strong>Error:</strong> {testResults.connection.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="schema" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Available Types</h3>
                  <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded">
                    <pre className="text-sm">
                      {JSON.stringify(getAvailableTypes(), null, 2)}
                    </pre>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => copyToClipboard(JSON.stringify(getAvailableTypes(), null, 2))}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Schema
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="queries" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Customer Query Test</h3>
                  <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded">
                    <pre className="text-sm">
                      {JSON.stringify(testResults.customerQuery, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Introspection Query</h3>
                  <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded">
                    <pre className="text-sm">
                      {JSON.stringify(testResults.introspection, null, 2)}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="solutions" className="space-y-4">
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Problem:</strong> Your GraphQL endpoint doesn't have Shopify cart types.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Possible Solutions:</h3>
                    
                    <div className="p-4 border rounded">
                      <h4 className="font-semibold">1. Use Shopify Storefront API Directly</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Connect directly to Shopify's GraphQL endpoint instead of your custom one.
                      </p>
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <code>
                          https://your-shop.myshopify.com/api/2024-01/graphql.json
                        </code>
                      </div>
                    </div>

                    <div className="p-4 border rounded">
                      <h4 className="font-semibold">2. Update Your Backend</h4>
                      <p className="text-sm text-gray-600">
                        Your <code>/api/customer/graphql</code> endpoint needs to proxy to Shopify or implement cart schema.
                      </p>
                    </div>

                    <div className="p-4 border rounded">
                      <h4 className="font-semibold">3. Custom Cart Implementation</h4>
                      <p className="text-sm text-gray-600">
                        Implement your own cart logic that matches your current GraphQL schema.
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Next Steps:</strong> Check your backend GraphQL resolver and ensure it implements Shopify's cart schema or proxies requests to Shopify.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}