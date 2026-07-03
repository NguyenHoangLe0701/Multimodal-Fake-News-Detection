import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing SUPABASE_URL or SUPABASE_KEY in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

email = "admin@gmail.com"
password = "Admin@12345"

print(f"Creating/Checking admin user: {email}")

try:
    # Attempt to sign up
    res = supabase.auth.sign_up({
        "email": email,
        "password": password,
        "options": {
            "data": {
                "full_name": "Administrator"
            }
        }
    })
    print("User signed up successfully.")
    user_id = res.user.id
except Exception as e:
    if "User already registered" in str(e) or "already exists" in str(e) or "email_exists" in str(e) or "422" in str(e):
        print("User already exists. Attempting to log in to get ID...")
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        user_id = res.user.id
    else:
        print(f"Error during sign up: {e}")
        exit(1)

print(f"User ID: {user_id}")
print("Updating role to 'admin' in public.users table...")

try:
    # Update the user's role in the public.users table
    # Depending on how the table is structured, we might need to insert or update.
    # Let's try upsert
    result = supabase.table("users").upsert({
        "id": user_id,
        "email": email,
        "full_name": "Administrator",
        "role": "admin",
        "status": "Active"
    }).execute()
    print("Successfully set admin role!")
    print(result.data)
except Exception as e:
    print(f"Error updating user role in DB: {e}")
