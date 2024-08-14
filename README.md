# Credit Scoring API

API Credit Scoring dibangun menggunakan menggunakan Node.js(v18.8.0). Pastikan Node Js telah terinstal di laptop/komputer anda.
Aplikasi ini menggunakan PostgreSQL(PgAdmin4), link download PgAdmin4 [disini](https://sbp.enterprisedb.com/getfile.jsp?fileid=1258649).
Setelah PgAdmin4 didownload, buat database dengan nama "aicreditsscoring".

## Cara menjalankan aplikasi
1. Clone repository, setelah itu buka projek di code editor anda.
2. Di dalam root directory, buat file .env untuk menyimpan nilai konfigurasi yang dibutuhkan
3. Copy nilai berikut ke file .env:
```
# Ganti "admin" dengan password postgresql anda
DATABASE_URL=postgresql://postgres:admin@localhost:5432/aicreditscoring
# Isi dengan URL ml-api
ML_API=

#tidak perlu diubah
ADMIN_PASSWORD=superadmin
ACCESS_TOKEN_SECRET=yJOQ6H74WZi5DblmdYsv7uRorz13DcVs
REFRESH_TOKEN_SECRET=VDWvIm5rT4iBx7G7eFCN9MPO93EH7NzU
```
4. Buka terminal di root project, kemudian jalankan `npm install` untuk menginstall dependensi aplikasi.
5. Setelah itu, jalankan `npx prisma migrate dev` untuk membuat skema tabel di database 'aicreditscoring'
6. Jalankan `npm run seed` untuk membuat akun admin untuk keperluan autentikasi dengan :
```
email = admin@gmail.com
password = superadmin
```
7. Terakhir, jalankan `npm run start` untuk menjalankan aplikasi.
8. Server aplikasi akan berjalan di port 80, buka [http://localhost:80](http://localhost:80) di browser.
9. Jika tidak ada eror dan tampil `Cannot GET /` maka aplikasi berhasil dijalankan

Untuk Dokumentasi API ada pada link berikut:
- [creditscoring-docs](https://creditscoring-docs.vercel.app/)
