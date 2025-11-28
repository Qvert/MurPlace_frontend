import protobuf from 'protobufjs'

let rootPromise = null

function loadRoot(){
  if (!rootPromise){
    // Vite serves files in project root; proto is at /protos/product.proto
    rootPromise = protobuf.load('/protos/product.proto')
  }
  return rootPromise
}

export async function decodeProductsBuffer(buffer){
  const root = await loadRoot()
  const ProductsResponse = root.lookupType('murplace.ProductsResponse')
  const message = ProductsResponse.decode(new Uint8Array(buffer))
  const obj = ProductsResponse.toObject(message, { longs: String, enums: String, bytes: String })
  return obj.products || []
}

export default { loadRoot, decodeProductsBuffer }
