import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// To save users in the database, we need to create a mutation that will be called from the client. 
// This mutation will take the user's information and save it in the database. We will also add a check to see if the user already exists in the database. 
// If the user exists, we will not create a new user.
export const syncUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), args.clerkId)).first();

        // Dont create a new user if one already exists
        if(existingUser) return;

        return await ctx.db.insert("users",{
            ...args,
            role: "candidate",
        })
    }
});

// To get the list of users from the database, we need to create a query that will be called from the client.
export const getUsers = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error("User is Not authenticated");
        const users = await ctx.db.query("users").collect();

        return users;
    }
});

// To get a specific user from the database, we need to create a query that will be called from the client.
export const getUserByClerkId = query({
    args: {
        clerkId: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)).first();
        return user;
    }
});