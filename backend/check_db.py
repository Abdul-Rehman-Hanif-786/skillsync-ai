"""Check and fix profiles table."""

import sys
sys.path.insert(0, '.')

import asyncio
from sqlalchemy import text
from app.db.database import engine


async def check_and_fix():
    """Check profiles table columns and add missing ones."""
    
    async with engine.connect() as conn:
        # Check existing columns
        result = await conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            ORDER BY ordinal_position
        """))
        
        columns = [(row[0], row[1]) for row in result]
        
        print("\nCurrent 'profiles' table columns:")
        print("-" * 50)
        for col_name, col_type in columns:
            print(f"  {col_name}: {col_type}")
        print("-" * 50)
        
        # Check if new columns exist
        col_names = [c[0] for c in columns]
        
        needs_update = False
        
        if 'experience_level' not in col_names:
            print("\n[ADDING] experience_level column...")
            await conn.execute(text("""
                ALTER TABLE profiles 
                ADD COLUMN experience_level VARCHAR
            """))
            await conn.commit()
            needs_update = True
            
        if 'target_role' not in col_names:
            print("\n[ADDING] target_role column...")
            await conn.execute(text("""
                ALTER TABLE profiles 
                ADD COLUMN target_role VARCHAR
            """))
            await conn.commit()
            needs_update = True
            
        if 'interests' not in col_names:
            print("\n[ADDING] interests column...")
            await conn.execute(text("""
                ALTER TABLE profiles 
                ADD COLUMN interests JSON
            """))
            await conn.commit()
            needs_update = True
        
        if needs_update:
            print("\n[SUCCESS] Database updated!")
        else:
            print("\n[OK] All columns exist!")


if __name__ == "__main__":
    asyncio.run(check_and_fix())
