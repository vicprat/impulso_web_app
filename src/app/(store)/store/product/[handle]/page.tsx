import { notFound } from 'next/navigation';
import { api } from '@/modules/shopify/api';
import {Client} from './Client';


export default async function Page({params}: {params: Promise<{ handle: string }>}) {
  const { handle } = await params;

  try {
    const productResponse = await api.getProductByHandle(handle);
    const product = productResponse.data;

    if (!product) {
      notFound();
    }

    return <Client product={product} />;
    
  } catch {
    notFound();
  }
}