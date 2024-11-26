import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe'; // Correct import for Stripe

// Load environment variables
dotenv.config();

// Initialize Stripe with the secret API key from .env
const stripeGateway = Stripe(process.env.stripe_api);
// console.log("Key                kjdfnglskjdgn"+stripeGateway);
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.sendFile("public/index.html", { root: '' });
});

// Stripe checkout route
app.post('/stripe-checkout', async (req, res) => {        
    const { items } = req.body;
    const lineItems = items.map(item => {
        const unitAmount = Math.round(item.price * 100); // Convert price to cents
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [item.image],
                },
                unit_amount: unitAmount,
            },
            quantity: item.quantity,
        };
    });
    // Create Stripe Checkout session
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/succsess.html`,
        // success_url: `${process.env.BASE_URL}/success.html`,
        cancel_url: `${process.env.BASE_URL}/cancel.html`,
        billing_address_collection: 'required'
    });
    // console.log(session);
    res.json(session);
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
