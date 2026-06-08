import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SECRET_KEY")

supabase = create_client(url, key)

response = supabase.table("universities").select("*").execute()
print("Подключение работает. Строк в таблице:", len(response.data))