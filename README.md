# Ayder Sofra - Restaurant Management System

Türkçe, mobil uyumlu restoran sipariş sistemi.

## Sayfalar
- `login.html` — Personel giriş
- `index.html` — Garson
- `mutfak.html` — Mutfak
- `firin.html` — Fırın
- `izgara.html` — Izgara
- `yonetici.html` — Yönetici

## Firebase
1. Firebase projesinde Authentication > Sign-in method > Email/Password açın.
2. Firestore Database oluşturun.
3. Web uygulaması oluşturup `firebase-config.js` içindeki değerleri doldurun.
4. İlk yönetici hesabını Firebase Authentication'dan oluşturun.
5. Firestore'da `users/{UID}` belgesi oluşturun:
   `{ "email": "...", "name": "Yönetici", "role": "admin" }`
6. `yonetici.html` açıldığında 16 masa ve örnek ürünler otomatik oluşturulur.

## Firestore collections
- `users`
- `tables`
- `products`
- `orders`
- `settings`

## Hosting
GitHub Pages ile statik olarak çalışabilir; Firebase Firestore/Auth için Firebase projesi gerekir.
