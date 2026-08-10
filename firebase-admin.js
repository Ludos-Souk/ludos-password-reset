const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY não configurada.");
}

const app = getApps()[0] || initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, "\n")
    })
});

module.exports = {
    auth: getAuth(app),
    db: getFirestore(app)
};
