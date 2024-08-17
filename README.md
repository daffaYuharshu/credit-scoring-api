# Credit Scoring API

API Credit Scoring dibangun menggunakan menggunakan Node.js(v18.8.0). Pastikan Node Js telah terinstal di laptop/komputer anda.
Aplikasi ini menggunakan PostgreSQL(PgAdmin4), link download PgAdmin4 melalui [tautan ini](https://sbp.enterprisedb.com/getfile.jsp?fileid=1258649).
Setelah PgAdmin4 didownload, buat database dengan nama "aicreditscoring".

## Cara menjalankan aplikasi
1. Clone repository, setelah itu buka repository ini di code editor anda.
2. Buka file src->services->report-service.js, lalu comment function generateReportPDF(Production) dan uncomment function generateReportPDF(Localhost) untuk dijalankan di localhost.
3. Di dalam root directory, buat file .env untuk menyimpan nilai konfigurasi yang dibutuhkan
4. Copy nilai berikut ke file .env:
```
# Ganti "admin" dengan password postgresql anda
DATABASE_URL=postgresql://postgres:admin@localhost:5432/aicreditscoring

# Isi dengan URL ml-api
ML_API=

# Isi dengan password akun admin yang anda inginkan
ADMIN_PASSWORD=

# Isi dengan nilai string acak
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```
4. Buka terminal di root project, kemudian jalankan `npm install` untuk menginstall dependensi aplikasi.
5. Setelah itu, jalankan `npx prisma migrate dev` untuk membuat skema tabel di database 'aicreditscoring'
6. Jalankan `npm run seed` untuk membuat akun admin untuk keperluan autentikasi dengan :
```
email = admin@gmail.com
password = (password admin yang telah anda tentukan)
```
7. Terakhir, jalankan `npm run start` untuk menjalankan aplikasi.
8. Server aplikasi akan berjalan di port 80, buka [http://localhost:80](http://localhost:80) di browser.
9. Jika tidak ada error dan tampil `Cannot GET /` maka aplikasi berhasil dijalankan

Untuk Dokumentasi API ada pada link berikut:
- [creditscoring-docs](https://creditscoring-docs.vercel.app/)
