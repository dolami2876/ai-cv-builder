import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        // Verify webhook signature (automatically reads from CLERK_WEBHOOK_SIGNING_SECRET env var)
        const evt = await verifyWebhook(req);

        // Log received webhook
        const { id } = evt.data;
        const eventType = evt.type;
        console.log(`📥 Received webhook with ID ${id} and event type: ${eventType}`);

        // Connect to MongoDB
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Handle different event types
        if (evt.type === 'user.created') {
            const { id, email_addresses } = evt.data;
            
            // Get primary email
            const primaryEmail = email_addresses?.find((email: any) => email.id === evt.data.primary_email_address_id)?.email_address 
                || email_addresses?.[0]?.email_address 
                || '';

            // Use findOneAndUpdate with upsert to handle duplicate key errors
            const user = await User.findOneAndUpdate(
                { clerkId: id },
                {
                    clerkId: id,
                    email: primaryEmail,
                    credits: 5, // Free 5 credits
                    lastFreeCreditReset: new Date(),
                    isPremium: false,
                    paymentHistory: [],
                },
                { 
                    upsert: true, // Create if doesn't exist
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

            console.log(`✅ User created/updated in MongoDB: ${id} (${primaryEmail})`);
        } 
        else if (evt.type === 'user.updated') {
            const { id, email_addresses } = evt.data;
            
            // Get primary email
            const primaryEmail = email_addresses?.find((email: any) => email.id === evt.data.primary_email_address_id)?.email_address 
                || email_addresses?.[0]?.email_address 
                || '';

            // Update user in MongoDB
            const user = await User.findOneAndUpdate(
                { clerkId: id },
                { 
                    email: primaryEmail,
                },
                { 
                    new: true,
                    upsert: false // Don't create if doesn't exist
                }
            );

            if (user) {
                console.log(`✅ User updated in MongoDB: ${id} (${primaryEmail})`);
            } else {
                console.log(`⚠️ User not found for update: ${id}`);
            }
        } 
        else if (evt.type === 'user.deleted') {
            const { id } = evt.data;

            // Delete user from MongoDB
            const result = await User.findOneAndDelete({ clerkId: id });

            if (result) {
                console.log(`✅ User deleted from MongoDB: ${id}`);
            } else {
                console.log(`⚠️ User not found for deletion: ${id}`);
            }
        } else {
            console.log(`ℹ️ Unhandled event type: ${eventType}`);
        }

        return new Response('Webhook received', { status: 200 });
    } catch (err: any) {
        console.error('❌ Error processing webhook:', err);
        console.error('Error details:', {
            message: err?.message,
            stack: err?.stack,
            name: err?.name
        });
        
        // Return 500 for internal errors, 400 for verification errors
        const statusCode = err?.message?.includes('verification') || err?.message?.includes('signature') ? 400 : 500;
        return new Response(`Error processing webhook: ${err?.message || 'Unknown error'}`, { status: statusCode });
    }
}
