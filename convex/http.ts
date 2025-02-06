import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

// Create a new HTTP router
const http = httpRouter();

// Svix is a service that provides webhook infrastructure. It helps developers manage webhooks by handling the delivery, retries, and security of webhook events. Svix ensures that webhook events are delivered reliably and securely to the intended recipients.

// In the context of the provided code, Svix is used to verify the integrity and authenticity of incoming webhook requests. The headers svix-id, svix-signature, and svix-timestamp are used to validate the request, ensuring that it comes from a trusted source and has not been tampered with.

// Define a route for handling Clerk webhooks
http.route({
    path: "/clerk-webhook", // The path for the webhook endpoint
    method: "POST", // The HTTP method for the endpoint
    handler: httpAction(async (ctx, request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if(!webhookSecret) {
            throw new Error("Environment variable CLERK_WEBHOOK_SECRET is not set"); // Throw an error if the secret is not set
        }
        // Get required headers from the request
        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");
        const svix_timestamp = request.headers.get("svix-timestamp");
        // Return a 400 response if any of the required headers are missing
        if(!svix_id || !svix_signature || !svix_timestamp) {
            return new Response("Missing required svix headers", { status: 400 });
        }

        // Parse the request payload
        const payload = await request.json();
        const body = JSON.stringify(payload);

        // Initialize the webhook with the secre
        const webhook = new Webhook(webhookSecret);
        let evt: WebhookEvent; // Declare a variable for the webhook event

        try{
            evt = webhook.verify(body, {
                "svix-id": svix_id,
                "svix-signature": svix_signature,
                "svix-timestamp": svix_timestamp,
            }) as WebhookEvent;
        } catch(err){
            console.error(`Failed to verify webhook: ${err}`);
            return new Response("Failed to verify webhook", { status: 400 });
        }

        const eventType = evt.type;
        if(eventType === "user.created"){
            const {id, email_addresses, first_name, last_name, image_url} = evt.data;

            const email = email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();

            try{
                await ctx.runMutation(api.users.syncUser, {
                    clerkId: id,
                    email,
                    name,
                    image: image_url,
                })
            } catch(err){
                console.error(`Failed to create user in convex: ${err}`);
                return new Response("Failed to create user", { status: 500 });
            }
        }

        return new Response("Webhook processed successfully", { status: 200 });
    })
})

// Export the HTTP router
export default http;