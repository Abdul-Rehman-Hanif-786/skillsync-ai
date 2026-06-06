"""Update database schema with new columns."""

import asyncio
from sqlalchemy import text
from app.db.database import engine


async def update_schema():
    """Add missing columns to existing tables."""
    
    async with engine.begin() as conn:
        try:
            # Add new columns to profiles table
            print("Updating profiles table...")
            
            # Check and add experience_level
            await conn.execute(text("""
                ALTER TABLE profiles 
                ADD COLUMN IF NOT EXISTS experience_level VARCHAR
            """))
            print("[OK] Added experience_level column")
            
            # Check and add target_role
            await conn.execute(text("""
                ALTER TABLE profiles 
                ADD COLUMN IF NOT EXISTS target_role VARCHAR
            """))
            print("[OK] Added target_role column")
            
            # Check and add interests
            await conn.execute(text("""
                ALTER TABLE profiles 
                ADD COLUMN IF NOT EXISTS interests JSON
            """))
            print("[OK] Added interests column")
            
            # Change bio from VARCHAR to TEXT
            await conn.execute(text("""
                ALTER TABLE profiles 
                ALTER COLUMN bio TYPE TEXT
            """))
            print("[OK] Changed bio to TEXT type")
            
            # Add unique constraint to user_id (skip if duplicates exist)
            try:
                await conn.execute(text("""
                    ALTER TABLE profiles 
                    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id)
                """))
                print("[OK] Added unique constraint to user_id")
            except Exception as constraint_error:
                if "duplicated" in str(constraint_error) or "already exists" in str(constraint_error):
                    print("[WARNING] Skipping unique constraint - duplicate profiles exist")
                    print("[INFO] You may want to clean up duplicate profiles manually")
                else:
                    raise
            
            print("\n[SUCCESS] Database schema updated successfully!")
            
        except Exception as e:
            print(f"\n[ERROR] Error updating schema: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(update_schema())
