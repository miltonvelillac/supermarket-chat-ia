import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load config
dotenv.config();

// Load express
const app = express();
const PORT = 3000;

app.use("/", express.static('public'));
app.use(express.json());

let conversations = {};

app.post("/api/chatbot", async (req, res) => {
  const { userId, message } = req.body;
  if (!message) return res.status(404).json({ error: 'Message is emtpy' });
  const context = `
    You are a support assistant for the supermarket "My suppermarket"
    business information:
      - Location: fake street 123
      - Opening hours: Monday - Saturday from 8 to 21, Sunday from 9 to 18
      - Products: Bread, Milk, Eggs, Cheese, Spaghetti, Fruits, Lettuces, Beef, Chicken (we only have this products)
      - Payment methods: Cash, Credit card
      You can only answer questions about this supermarket, any other questions are prohibited
  `;

  if (!conversations[userId]) {
    conversations[userId] = [];
  }

  conversations[userId].push({ role: "user", content: message });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: context },
        { role: "system", content: "You must answer as briefly and directly as possible, using the minimum possible tokens and the same language as the user" },
        ...conversations[userId],
        // { role: "tool"}, // se usa cuando el modelo interactua con herramientas externas como apis o data bases, we could send json object with info
        // { role: "assistant" }, // it's usefull to represent the previous responses, in this case it remember previous answers and keep the context, without this role there is not a memory
      ],
      max_tokens: 200
    });

    const reply = response.choices[0].message.content;

    conversations[userId].push({ role: "assistant", content: reply }) // This gives memory to the IA
    if (conversations[userId].length > 12) {
      // This is for avoiding to have a huge conversation data
      conversations[userId] = conversations[userId].slice(-10);
    }
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error generating the response " });
  }
});

app.listen(PORT, () => {
  console.log('hello', process.env.PORT)
  console.log(`App runing in port ${PORT}`);
})
