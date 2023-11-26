const express = require('express');
const app = express();
const port = 5000;
const dotenv = require('dotenv');
const cors = require('cors');
const { DiscussServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
require('dotenv').config({ path: "./sample.env" });
const client = require('twilio')(accountSid, authToken);

const MODEL_NAME = "models/chat-bison-001";
const API_KEY = process.env.API_KEY;

const clients = new DiscussServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.post('/whatsapp', async (req, res) => {
    const message = req.body.Body;
    const senderId = req.body.From;
    console.log(message)
    console.log(senderId)
    
    try {
        await generate(message, senderId);
    } catch (error) {
        console.error('Error during message generation:', error);
    }

});

async function generate(promptString, senderId) {

    const context = "Questions based on return expectations, risk tolerance and  categories user based on their answer into 3 - passive investor, neutral and aggressive  and give investment planning strategies according to their category.";
    const examples = [
        {
            "input": {
                "content": "I'm 35 years old and thinking about retirement planning. What's the best strategy for someone my age?"
            },
            "output": {
                "content": "Great to hear you're planning ahead! Considering your age, a balanced approach is often effective. Can you share your expected retirement age, return expectations, and risk tolerance so I can provide more tailored advice?"
            }
        },
        {
            "input": {
                "content": "I'm aiming for a good return on my investments. What should I expect based on my age?"
            },
            "output": {
                "content": "It's essential to balance return expectations with risk. For someone in your age group, a moderate return around 7-9% may be realistic. However, let's discuss your risk tolerance to fine-tune this estimate. Are you more comfortable with a conservative, moderate, or aggressive investment approach?"
            }
        },
        {
            "input": {
                "content": "I'm not sure how much risk I can handle. How do I determine my risk tolerance?"
            },
            "output": {
                "content": "Understanding your risk tolerance is crucial. On a scale from 1 to 10, where 1 is very conservative and 10 is very aggressive, how would you rate your comfort level with potential fluctuations in the value of your investments?"
            }
        },
        {
            "input": {
                "content": "I've shared my age, return expectations, and risk tolerance. What category do I fall into?"
            },
            "output": {
                "content": "Based on your inputs, you fall into the [Passive/Neutral/Aggressive] investor category. This means our investment strategy will align with your risk tolerance and financial goals. Let's discuss specific investment options suitable for your category. Are you looking for short-term gains or a more long-term approach?"
            }
        },
        {
            "input": {
                "content": "Now that I know my investor category, what are my investment options?"
            },
            "output": {
                "content": "As a [Passive/Neutral/Aggressive] investor, we can explore a diversified portfolio with a mix of [low/medium/high]-risk assets. Consider [index funds/bonds/stocks] to align with your risk profile. Let's dive deeper into specific investment opportunities. Do you have any preferences or constraints?"
            }
        },
        {
            "input": {
                "content": "I'm unsure about when I should plan to retire. Any advice?"
            },
            "output": {
                "content": "Determining your ideal retirement age is a crucial step. Considering your current age, financial goals, and lifestyle aspirations, do you have a specific retirement age in mind, or would you like assistance in exploring different scenarios?"
            }
        },
        {
            "input": {
                "content": "I'm concerned about market conditions affecting my retirement savings. What should I do?"
            },
            "output": {
                "content": "Market conditions can be unpredictable. As a [Passive/Neutral/Aggressive] investor, your strategy already considers your risk tolerance. However, periodic reviews are essential. Would you prefer a more hands-on approach with regular check-ins, or do you prefer a set-it-and-forget-it approach with occasional adjustments?"
            }
        },
        {
            "input": {
                "content": "Should I prioritise building an emergency fund before focusing on retirement investments?"
            },
            "output": {
                "content": "Building an emergency fund is crucial for financial stability. As a [Passive/Neutral/Aggressive] investor, it's advisable to have 3-6 months' worth of living expenses in a liquid account. Once you have this in place, we can discuss optimising your retirement investments further. Have you already established an emergency fund?"
            }
        },
        {
            "input": {
                "content": "I'm interested in socially responsible investing. Can I incorporate that into my retirement plan?"
            },
            "output": {
                "content": "Absolutely! As a [Passive/Neutral/Aggressive] investor, we can align your portfolio with socially responsible investments. This may include funds that focus on environmental, social, or governance (ESG) factors. Would you like to prioritize socially responsible options in your portfolio, or are you open to a mix of traditional and socially responsible investments?"
            }
        },
        {
            "input": {
                "content": "How often should I review and adjust my retirement plan?"
            },
            "output": {
                "content": "Regular reviews are essential. As a [Passive/Neutral/Aggressive] investor, a yearly review is a good starting point. However, we can adjust the frequency based on your preference. Would you like more frequent check-ins, or are you comfortable with an annual review?"
            }
        },
        {
            "input": {
                "content": "I want to invest my $100,000 responsibly. How should I allocate it?"
            },
            "output": {
                "content": "That's a great approach! For socially responsible investing with $100,000, we can explore funds focused on environmental, social, or governance (ESG) factors. How important is it for you to align your investments with specific social or environmental values?"
            }
        },
        {
            "input": {
                "content": "I've got $100,000 to invest. Any specific recommendations on where to put it?"
            },
            "output": {
                "content": "Certainly! It depends on your goals and preferences. Are you interested in a mix of stocks and bonds, or do you have a preference for specific sectors or types of investments? Knowing your preferences will help us create a more tailored investment plan."
            }
        },
        {
            "input": {
                "content": "I have $100,000 and want to invest for the long term. What's the best strategy?"
            },
            "output": {
                "content": "Long-term investing is a smart approach. With a $100,000 capital, we might consider a growth-oriented strategy. How many years until you plan to access these funds? This will help us tailor the portfolio to match your investment horizon."
            }
        },
        {
            "input": {
                "content": "I'm not sure how to distribute my $100,000. What's the best allocation for someone with moderate risk tolerance?"
            },
            "output": {
                "content": "Understood. For someone with moderate risk tolerance, a balanced allocation might be suitable. We could consider putting 60% in a mix of diversified stocks and 40% in stable bonds. How does that sound to you, or would you prefer a different balance?"
            }
        },
        {
            "input": {
                "content": "I have $100,000 in capital. How should I allocate it for investments?"
            },
            "output": {
                "content": "Great! To start, let's consider a diversified approach. How comfortable are you with risk on a scale of 1 to 10, where 1 is low risk and 10 is high risk? This will help us determine the balance between stable and growth-oriented investments in your portfolio."
            }
        },
        {
            "input": {
                "content": "I consider myself a neutral investor. What investment strategy would be suitable for me?"
            },
            "output": {
                "content": "Being a neutral investor, a balanced approach that combines both growth and stability might be suitable. We can explore a diversified portfolio with a mix of stocks and bonds. Can you share your preferred balance between risk and stability? For example, on a scale of 1 to 10, where 1 is low risk and 10 is high risk, where do you feel comfortable?"
            }
        },
        {
            "input": {
                "content": "How should I consider my time horizon as a neutral investor?"
            },
            "output": {
                "content": "As a neutral investor, your time horizon is a critical factor. Considering your age and expected retirement age, we can tailor your investments to align with a moderate growth trajectory. Are you planning for short-term goals within the next 5 years, or are you primarily focused on long-term retirement planning?"
            }
        },
        {
            "input": {
                "content": "How should I diversify my investments as a neutral investor?"
            },
            "output": {
                "content": "Diversification is key for a neutral investor. We can consider a mix of asset classes such as stocks, bonds, and potentially other stable investments. Would you like to explore specific sectors or industries, or are you open to a well-diversified portfolio across various market segments?"
            }
        },
        {
            "input": {
                "content": "I want to make sure I'm comfortable with the level of risk. How do I review my risk tolerance as a neutral investor?"
            },
            "output": {
                "content": "Understanding your risk tolerance is crucial for a balanced portfolio. On a scale of 1 to 10, where 1 is very conservative and 10 is very aggressive, how would you rate your comfort level with potential fluctuations in the value of your investments? We can then fine-tune your portfolio to match your risk preferences."
            }
        },
        {
            "input": {
                "content": "I'm a bit concerned about market volatility. How should I navigate that as a neutral investor?"
            },
            "output": {
                "content": "Market volatility is a common concern. As a neutral investor, we can incorporate assets that historically show stability during market fluctuations. This might include a mix of both equity and fixed-income investments. Would you prefer a more conservative approach to minimize volatility, or are you open to a balanced strategy that includes both stable and growth-oriented assets?"
            }
        },
        {
            "input": {
                "content": "I consider myself a neutral investor. What investment strategy would be suitable for me?"
            },
            "output": {
                "content": "Being a neutral investor, a balanced approach that combines both growth and stability might be suitable. We can explore a diversified portfolio with a mix of stocks and bonds. For instance, with a capital of $100,000, we might consider allocating 60% to stocks and 40% to bonds. Can you share your preferred balance between risk and stability? For example, on a scale of 1 to 10, where 1 is low risk and 10 is high risk, where do you feel comfortable?"
            }
        },
        {
            "input": {
                "content": "How should I consider my time horizon as a neutral investor?"
            },
            "output": {
                "content": "As a neutral investor, your time horizon is a critical factor. Let's consider an investment horizon of 20 years until your expected retirement age. We can tailor your investments to align with a moderate growth trajectory. Are you planning for short-term goals within the next 5 years, or are you primarily focused on long-term retirement planning?"
            }
        },
        {
            "input": {
                "content": "How should I diversify my investments as a neutral investor?"
            },
            "output": {
                "content": "Diversification is key for a neutral investor. With a capital of $100,000, we might consider allocating $60,000 to a mix of diversified stocks and $40,000 to stable bonds. Would you like to explore specific sectors or industries, or are you open to a well-diversified portfolio across various market segments?"
            }
        },
        {
            "input": {
                "content": "I want to make sure I'm comfortable with the level of risk. How do I review my risk tolerance as a neutral investor?"
            },
            "output": {
                "content": "Understanding your risk tolerance is crucial for a balanced portfolio. On a scale of 1 to 10, where 1 is very conservative and 10 is very aggressive, how would you rate your comfort level with potential fluctuations in the value of your investments? With a balanced portfolio, we aim to minimize significant swings while still seeking reasonable growth."
            }
        },
        {
            "input": {
                "content": "I'm a bit concerned about market volatility. How should I navigate that as a neutral investor?"
            },
            "output": {
                "content": "Market volatility is a common concern. As a neutral investor, with a $100,000 portfolio, we can incorporate assets that historically show stability during market fluctuations. This might include a mix of both equity and fixed-income investments. For instance, $60,000 in diversified stocks and $40,000 in stable bonds. Would you prefer a more conservative approach to minimize volatility, or are you open to a balanced strategy that includes both stable and growth-oriented assets?"
            }
        }
    ];

    clients.generateMessage({
        // required, which model to use to generate the result
        model: MODEL_NAME,
        // optional, 0.0 always uses the highest-probability result
        temperature: 0.25,
        // optional, how many candidate results to generate
        candidateCount: 1,
        // optional, number of most probable tokens to consider for generation
        top_k: 40,
        maxOutputTokens: 256,
        // optional, for nucleus sampling decoding strategy
        top_p: 0.95,
        prompt: {
            // optional, sent on every request and prioritized over history
            context: context,
            // optional, examples to further finetune responses
            examples: examples,
            // required, alternating prompt/response messages
            messages: [{ content: promptString }],
        },
    }).then(result => {
        const generatedText = result;

        const author1Candidate = generatedText[0].candidates.find(candidate => candidate.author === "1");
        const author1Content = author1Candidate.content;

        sendReply(author1Content, senderId)

        console.log(author1Content);
    }).catch(error => {
        console.error('Error during message generation:', error);
    });
}

async function sendReply(generatedText, senderId) {
    await client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: generatedText,
            to: senderId
        })
        .then(message => console.log(message.sid));
}

app.listen(port, () => {
    console.log('RUNNING');
})
