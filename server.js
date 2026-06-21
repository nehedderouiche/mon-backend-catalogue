const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- MIDDLEWARES ---
app.use(cors()); 
app.use(express.json({ limit: '20mb' })); 

// --- CONNEXION BASE DE DONNÉES ---
// Utilise la variable d'environnement sur Render, sinon utilise la chaîne de secours locale
const dbURI = process.env.MONGODB_URI || "mongodb+srv://nehedderouiche52_db_user:azerty123@cluster0.g8fsuyw.mongodb.net/CatalogueDB?retryWrites=true&w=majority";

mongoose.connect(dbURI)
    .then(() => console.log("✅ Connecté avec succès à MongoDB Atlas"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB :", err));

// --- MODÈLE DE DONNÉES ---
const Article = mongoose.model('Article', new mongoose.Schema({
    code: { type: String, required: true },
    nom: { type: String, required: true },
    prix: Number,
    type: String,
    image: String 
}));

// --- API ROUTES ---
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/articles/add', async (req, res) => {
    try {
        const { code, nom } = req.body;
        const dejaPresent = await Article.findOne({ $or: [{ code }, { nom }] });
        
        if (dejaPresent) {
            return res.status(400).json({ message: "Cet article est déjà disponible !" });
        }
        
        const nouvelArticle = new Article(req.body);
        await nouvelArticle.save();
        res.status(201).json(nouvelArticle);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/articles/update/:id', async (req, res) => {
    try {
        const articleModifie = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(articleModifie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/articles/delete/:id', async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Article supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVEUR ACTIF SUR LE PORT ${PORT}`);
});