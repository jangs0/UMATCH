import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()
key = os.environ.get("SCORECARD_API_KEY")

names_to_find = [
    "Elon University",
    "Rollins College",
    "Stetson University",
    "Eckerd College",
    "Florida Southern College",
    "Mercer University",
    "Belmont University",
    "Susquehanna University",
    "McDaniel College",
    "University of Lynchburg",
    "Arcadia University",
    "Hartwick College",
    "Catawba College",
    "Wofford College",
    "Millsaps College",
    "Maryville College",
    "Lenoir-Rhyne University",
    "Lyon College",
    "Centenary College of Louisiana",
    "Coastal Carolina University",
    "Hampden-Sydney College",
    "Berry College",
    "Western New England University",
    "Eastern New Mexico University-Main Campus",
    "Minot State University",
    "Valley City State University",
    "University of Maine at Fort Kent",
    "Dickinson State University",
    "Mayville State University",
    "University of Maine at Presque Isle",
    "Bemidji State University",
    "University of Montana Western",
    "Peru State College",
    "Bluefield State University",
    "Glenville State University",
    "West Virginia State University",
    "Shepherd University",
]

url = "https://api.data.gov/ed/collegescorecard/v1/schools"

for name in names_to_find:
    params = {"api_key": key, "school.name": name, "fields": "id,school.name,school.city,school.state"}
    r = requests.get(url, params=params).json()
    results = r.get("results", [])
    print(f"--- {name} ({len(results)} results) ---")
    for res in results[:5]:
        print(f"  {res['id']} | {res['school.name']} | {res.get('school.city')}, {res.get('school.state')}")
    time.sleep(0.2)
