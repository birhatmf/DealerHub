# Bayi App (Dealer Management System)

Modern ve kapsamlı bir Bayi Yönetim Sistemi. Next.js 16, Prisma ve Tailwind CSS kullanılarak geliştirilmiştir.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Bayi+App+Dashboard)

## 🚀 Özellikler

###  Admin Paneli (ROOT)
*   **Dashboard:** Toplam satış, tahsilat, bekleyen ödeme ve sipariş durumlarını grafiksel olarak görüntüleme.
*   **Mağaza Yönetimi:** Yeni mağaza oluşturma, düzenleme ve silme.
*   **Ürün Yönetimi:** Tüm mağazaların ürünlerini görüntüleme ve yönetme.
*   **Sipariş Yönetimi:** Tüm siparişleri görüntüleme, durum güncelleme ve detaylı inceleme.
*   **Müşteri Yönetimi:** Tüm müşterileri listeleme.
*   **Yönetici Yönetimi:** Yeni admin kullanıcıları oluşturma ve yetkilendirme.

###  Mağaza Paneli (STORE)
*   **Dashboard:** Mağazaya özel satış istatistikleri ve özet raporlar.
*   **Ürün Yönetimi:** Stok takibi, fiyat yönetimi ve ürün ekleme/düzenleme.
*   **Sipariş Oluşturma:** Müşteriler için hızlı sipariş oluşturma (Sepet mantığı).
*   **Sipariş Takibi:** Sipariş durumlarını güncelleme (Hazırlanıyor, Kargoda vb.).
*   **Müşteri Yönetimi:** Müşteri veritabanı oluşturma ve yönetme.
*   **Ayarlar:** Satış sözleşmesi, varsayılan notlar ve banka/IBAN bilgilerini özelleştirme.
*   **Yazdırma:** Sipariş detaylarını ve sözleşmeleri yazdırma özelliği.

##  Teknolojiler

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Dil:** [TypeScript](https://www.typescriptlang.org/)
*   **Veritabanı:** [SQLite](https://www.sqlite.org/) (Prisma ORM ile)
*   **Kimlik Doğrulama:** [NextAuth.js v5](https://authjs.dev/) (Beta)
*   **Stil:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Bileşenleri:** [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
*   **Form Yönetimi:** React Hook Form & Zod

##  Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/kullaniciadi/bayi-app.git
    cd bayi-app
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Çevresel Değişkenleri Ayarlayın:**
    `.env` dosyasını oluşturun ve aşağıdaki değerleri ekleyin:
    ```env
    DATABASE_URL="file:./dev.db"
    AUTH_SECRET="gizli-anahtariniz-buraya" # `npx auth secret` ile oluşturabilirsiniz
    ```

4.  **Veritabanını Hazırlayın:**
    ```bash
    npx prisma db push
    ```

5.  **Admin Kullanıcısını Oluşturun:**
    ```bash
    npx tsx prisma/seed.ts
    ```
    *Varsayılan Admin:* `admin` / `admin123`

6.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```
    Tarayıcınızda `http://localhost:3000` adresine gidin.

##  Kullanım

### Varsayılan Giriş Bilgileri
*   **Kullanıcı Adı:** `admin`
*   **Şifre:** `admin123`

Giriş yaptıktan sonra Admin panelinden yeni mağazalar oluşturabilir ve bu mağazalar için kullanıcı adı/şifre belirleyebilirsiniz.

##  Proje Yapısı

```
bayi-app/
├── app/
│   ├── (admin)/      # Admin paneli sayfaları
│   ├── (store)/      # Mağaza paneli sayfaları
│   ├── actions/      # Server Actions (Veritabanı işlemleri)
│   └── api/          # API rotaları (Auth vb.)
├── components/       # Tekrar kullanılabilir UI bileşenleri
├── lib/              # Yardımcı fonksiyonlar ve Prisma istemcisi
├── prisma/           # Veritabanı şeması ve seed dosyaları
└── public/           # Statik dosyalar
```

##  Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.
