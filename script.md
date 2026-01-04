# DealerHub Multi-Image Support & Migration Prompt

I need you to implement multi-image support for the "DealerHub" project, replacing the single `imageUrl` field. Here is the step-by-step plan and the required code changes for the server environment.

## 1. Database Schema Update (`prisma/schema.prisma`)
Modify the schema to replace `imageUrl` with a `ProductImage` model.
*Note: Keep `imageUrl` temporarily as optional to allow data migration.*

```prisma
model Product {
  // ... existing fields
  description String?
  imageUrl    String? // Temporary: kept for migration
  images      ProductImage[] 
  // ...
}

model ProductImage {
  id        String   @id @default(cuid())
  url       String
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

## 2. Server Actions (`app/actions/product.ts`)
Update `createProduct` and `updateProduct` functions:
*   Use `formData.getAll('images')` to retrieve multiple files.
*   Loop through files, save them to `public/uploads`.
*   Save the file paths to the `ProductImage` table.

## 3. UI Updates
*   **Form (`components/product-form.tsx`)**: Change the file input to `<Input multiple name="images" ... />`.
*   **List Pages**: Update `app/(store)/store/products/page.tsx` and `app/(admin)/admin/products/page.tsx` to include `images: true` in the Prisma query and display `images[0].url` as the thumbnail.
*   **Print Views**: Update `app/(store)/store/orders/[id]/page.tsx` and `app/(admin)/admin/orders/[id]/page.tsx` to use `product.images[0]?.url` instead of `imageUrl` to fix print previews.

## 4. Product Detail Page
Create a new page at `app/(store)/store/products/[id]/page.tsx` that fetches the product with `include: { images: true }` and displays a gallery of all images.

## 5. Data Migration Script (`scripts/migrate-images.ts`)
Create a script to migrate existing `imageUrl` data to the new `ProductImage` table to prevent data loss.

```typescript
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({ where: { imageUrl: { not: null } } })
  for (const product of products) {
    if (product.imageUrl) {
        const existing = await prisma.productImage.findFirst({ where: { productId: product.id, url: product.imageUrl } })
        if (!existing) {
            await prisma.productImage.create({ data: { productId: product.id, url: product.imageUrl } })
        }
    }
  }
}
main()
```

## Execution Instructions
1.  Apply the Prisma schema changes and run `npx prisma db push` (Use `db push` for safe production update).
2.  Apply the code changes to validatd the UI and Actions.
3.  Run the migration script: `npx tsx scripts/migrate-images.ts`.
