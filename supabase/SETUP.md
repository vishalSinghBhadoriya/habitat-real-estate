# Connect HABITAT to Supabase

## 1. Open the project SQL Editor

In the Supabase Dashboard, select your HABITAT project. In the sidebar, open **SQL Editor** and click **New query**.

## 2. Create the marketplace tables

Open [the marketplace migration](migrations/20261125000100_marketplace.sql). Paste its entire contents in the query and click **Run**. This creates the listing, enquiry, and visit tables, the private image bucket, and the associated policies.

## 3. Add favourites

Click **New query**, paste [the shortlists migration](migrations/20261125000200_shortlists.sql), and click **Run**.

## 4. Add profiles and listing options

Click **New query**, paste [the listing options migration](migrations/20261125000300_listing_options.sql), and click **Run**.

## 5. Add floor plan and media policies

Click **New query**, paste [the floor plan migration](migrations/20261125000400_floor_plans_and_media.sql), and click **Run**.

Run each migration once, in order. If a migration fails, stop at that migration and review the SQL Editor error before continuing.

## 6. Verify the schema

Click **New query**, paste [the read-only verification SQL](verify.sql), and click **Run**. Check for these results.

- All five public tables report `rowsecurity = true`.
- The `property-images` bucket reports `public = false`.
- `properties.floor_plan` exists and has type `text`.
- Policy results include `property_public`, `property_delete`, `visible_images`, and `remove_unused_own_media`.

## 7. Configure email sign-in

Open **Authentication → Sign In / Providers → Email**. Enable the Email provider and keep **Confirm email** enabled. Save any changes. For testing, use a Supabase project-team email.

To deliver to addresses outside your project team, open **Authentication → Emails → SMTP Settings** and enable custom SMTP. Enter the sender address, sender name, host, port, username, and password from your email provider. Save and test with an address you control. Keep those credentials in the Dashboard. [Supabase SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp)

## 8. Set the authentication URLs

Open **Authentication → URL Configuration**. For local testing, set **Site URL** to `http://127.0.0.1:5173` and save. Under **Redirect URLs**, add each URL below and save.

- `http://127.0.0.1:5173/dashboard`
- `http://127.0.0.1:5173/reset-password`

Use the same host in your browser. When deploying, set the Site URL to the HTTPS site and add the same two paths for that origin. [Supabase redirect URL guide](https://supabase.com/docs/guides/auth/redirect-urls)

## 9. Verify from HABITAT

Ensure the project-root `.env.local` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Restart Vite using `npm.cmd run dev -- --host 127.0.0.1 --port 5173` in PowerShell. Open `http://127.0.0.1:5173/register`.

1. Create an account, confirm the email, and sign in.
2. Save a draft using the listing wizard with a property photograph and optional floor plan. Verify that the owner can edit it and a signed-out browser cannot open it.
3. Publish the listing from its edit screen. Verify both images from a signed-out browser. Edit it again and replace or remove the floor plan.
4. With a second account, save the listing, send an enquiry and request a visit. Verify that the owner sees the requests and can accept or decline the visit.
5. Sign out and complete **Forgot password** using a fresh recovery link. Verify login with the new password.
6. Delete the test listing from **Dashboard → My listings** and check that its public URL is unavailable. Deleting a listing also removes its linked enquiries, visit requests, and favourites.

The database policy test at [authorization.test.sql](tests/authorization.test.sql) is for a local Supabase stack with pgTAP. Run it with `supabase test db`. Use Storage through HABITAT or the Storage API so deleting a file also deletes its underlying content.
