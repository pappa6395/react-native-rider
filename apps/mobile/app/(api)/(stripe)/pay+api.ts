import { Stripe } from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { payment_method_id, payment_intent_id, customer_id, client_secret } = body;
   
        if (!payment_method_id || !payment_intent_id || !customer_id || !client_secret) {
            return new Response(JSON.stringify({
                error: 'Please enter a valid email address',
                status: 400,
            }))
        }

        const paymentMethod = await stripe.paymentMethods.attach(
            payment_method_id,
            { customer: customer_id }
        )

        const result = await stripe.paymentIntents.confirm(
            payment_intent_id,
            { payment_method: paymentMethod.id }
        );

        return new Response(JSON.stringify({
            success: true,
            message: "Payment Successfully",
            result: result,
        }));
    } catch (err) {
        console.error("Error paying",err);
        return new Response(JSON.stringify({
            error: 'An error occurred while processing the payment',
            status: 500,
        }));
    }
    
}