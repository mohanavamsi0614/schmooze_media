import express from 'express';
import dotenv from 'dotenv';
import { connectToDatabase } from './db.js';
import cors from 'cors';
import { ideaValidationChain } from './agent.js';
import { ObjectId } from 'mongodb';
dotenv.config();

let db;

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors())
app.get('/', (req, res) => {
    res.send('Schmooze Media Backend is running');
});
app.get("/ideas", async (req, res) => {
    try {
        const ideas = await db.collection('ideas').find({}).toArray();
        res.json(ideas);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});
app.post("/idea", async (req, res) => {
    try {
        const {idea} = req.body;
        const newIdea = await ideaValidationChain.invoke({ idea });
        const result = await db.collection('ideas').insertOne({prompt: idea,response: newIdea});
        res.status(201).json({ message: 'Idea added successfully', id: result.insertedId,response: newIdea } );
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add idea' });
    }
});
app.get("/idea/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const idea = await db.collection('ideas').findOne({ _id: new ObjectId(id) });
        if (!idea) {
            return res.status(404).json({ error: 'Idea not found' });
        }
        res.json(idea);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch idea' });
    }
});
app.delete("/idea/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('ideas').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Idea not found' });
        }
        res.json({ message: 'Idea deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete idea' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectToDatabase().then((res) => {
        db = res;
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    }
    );
});