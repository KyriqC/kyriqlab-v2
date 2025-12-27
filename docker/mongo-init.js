// mongo-init.js
db.createUser({
  user: "kyriq_admin",
  pwd: "KyriqLabSecure2025", // You will change this later or use env var approach
  roles: [
    { role: "readWrite", db: "kyriqlab" },
    { role: "dbAdmin", db: "kyriqlab" }
  ]
});
