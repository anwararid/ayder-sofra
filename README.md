# Ayder Sofra Professional
Firebase restaurant management system: Admin, Garson, Mutfak, Fırın, Izgara.

1. Firebase Authentication -> Email/Password -> Enable.
2. Firestore Database -> Create database.
3. Put your Web App config in firebase-config.js.
4. Publish firestore.rules.
5. Create first Authentication user, then create `users/{UID}`:
`{ "name":"Admin", "email":"your@email.com", "role":"admin" }`
6. Add menu documents to `menu`, for example:
`{ "name":"Adana Kebap", "price":250, "department":"izgara", "active":true }`
7. Deploy to Firebase Hosting or another static host.

Important: the Firebase config file contains public web-app configuration; Firestore Rules and Authentication are what protect the data.
